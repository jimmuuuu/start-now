// START/NOW v89 — optional accounts, cloud backup/sync, account deletion, and production identity polish.
(() => {
  const SUPABASE_URL = "https://wxeptxfijwrwmdzxvsuh.supabase.co";
  const SUPABASE_KEY = "sb_publishable_iptY9q73dl1gKeM18zcwZA_Vz8d-Lu0";
  const SYNC_META_KEY = "sn_cloud_sync_meta_v88";
  const ERROR_LOG_KEY = "sn_error_log_v88";
  const PROFILE_KEY = "sn_user_profile_v36";
  const EXCLUDED_KEYS = new Set(["sn_runtime_version", SYNC_META_KEY, ERROR_LOG_KEY]);
  const PRESERVE_ON_SIGNOUT = new Set(["sn_runtime_version", "sn_dark"]);

  let client = null;
  let currentUser = null;
  let syncing = false;
  let syncTimer = null;
  let lastFingerprint = "";
  let authMode = "signin";
  let identityRefreshQueued = false;
  let cloudStatus = "pending";
  let authTrigger = null;
  const OWNER_KEY = "sn_cloud_owner";

  function switchAccountStorage(user) {
    const owner = localStorage.getItem(OWNER_KEY) || safeJSON(localStorage.getItem(SYNC_META_KEY), {})?.userId;
    const next = user?.id || null;
    if (owner && owner !== next) {
      // Preserve unsynced data privately under its original owner before switching.
      localStorage.setItem(`sn_cloud_archive_${owner}`, JSON.stringify(collectStorage()));
      clearUserLocalData();
    }
    if (next && next !== owner) {
      const archiveKey = `sn_cloud_archive_${next}`;
      const archive = safeJSON(localStorage.getItem(archiveKey), null);
      if (archive) {
        Object.entries(archive).forEach(([key,value]) => {
          if (key.startsWith("sn_") && !key.startsWith("sn_cloud_") && typeof value === "string") localStorage.setItem(key,value);
        });
        localStorage.removeItem(archiveKey);
      }
    }
    if (next) localStorage.setItem(OWNER_KEY,next);
    else localStorage.removeItem(OWNER_KEY);
    if (owner && owner !== next) {
      // Discard the old account's in-memory render/session state as well.
      window.location.reload();
      return true;
    }
    return false;
  }

  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[ch]));

  function safeJSON(value, fallback=null){
    try { return JSON.parse(value); } catch { return fallback; }
  }

  function show(message){
    if (typeof window.showToast === "function") window.showToast(message);
    else console.info("Level Up Fitness:", message);
  }

  function collectStorage(){
    const storage = {};
    const keys = [];
    for (let i=0; i<localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("sn_") && !EXCLUDED_KEYS.has(key) && !key.startsWith("sn_cloud_")) keys.push(key);
    }
    keys.sort().forEach(key => { storage[key] = localStorage.getItem(key); });
    return storage;
  }

  function fingerprint(storage=collectStorage()){
    return JSON.stringify(storage);
  }

  function localHasMeaningfulData(){
    const workouts = safeJSON(localStorage.getItem("sn_custom_workouts"), []);
    const sessions = safeJSON(localStorage.getItem("sn_progress_sessions"), []);
    const active = safeJSON(localStorage.getItem("sn_active_workout_v36"), null);
    return (Array.isArray(workouts) && workouts.length > 0) ||
      (Array.isArray(sessions) && sessions.length > 0) || Boolean(active);
  }

  function mergeById(remote=[], local=[]){
    if (window.SN36?.mergeWorkouts) return window.SN36.mergeWorkouts(remote, local);
    const map = new Map();
    [...(Array.isArray(remote)?remote:[]), ...(Array.isArray(local)?local:[])].forEach(item => {
      if (!item || typeof item !== "object") return;
      const id = item.id || `${item.timestamp || ""}:${item.workoutId || item.workoutName || "item"}`;
      map.set(String(id), item);
    });
    return [...map.values()];
  }

  function mergeSessions(remote=[], local=[]){
    if (window.SN36?.mergeSessions) return window.SN36.mergeSessions(remote, local);
    return mergeById(remote, local)
      .filter(session => Number(session?.timestamp) > 0)
      .sort((a,b) => Number(a.timestamp)-Number(b.timestamp))
      ;
  }

  function hasOwn(object, key){
    return Object.prototype.hasOwnProperty.call(object || {}, key);
  }

  function mergeProfile(remoteStorage, localProfile, hadLocalData, backupUpdatedAt){
    const remoteProfile = safeJSON(remoteStorage?.[PROFILE_KEY], {}) || {};
    if (!Object.keys(remoteProfile).length && !Object.keys(localProfile).length) return;

    const merged = hadLocalData
      ? { ...remoteProfile, ...localProfile }
      : { ...localProfile, ...remoteProfile };
    const localPhotoStamp = Number(localProfile.photoUpdatedAt) || 0;
    const remotePhotoStamp = Number(remoteProfile.photoUpdatedAt) ||
      (remoteProfile.photo ? Date.parse(backupUpdatedAt || "") || 0 : 0);
    const localHasPhotoState = hasOwn(localProfile, "photo") || localPhotoStamp > 0;
    const remoteHasPhotoState = hasOwn(remoteProfile, "photo") || remotePhotoStamp > 0;
    const useLocalPhoto = localHasPhotoState && (!remoteHasPhotoState || localPhotoStamp >= remotePhotoStamp);
    const photoSource = useLocalPhoto ? localProfile : remoteProfile;

    if (localHasPhotoState || remoteHasPhotoState) {
      if (photoSource.photo) merged.photo = photoSource.photo;
      else delete merged.photo;
      if (photoSource.photoUpdatedAt) merged.photoUpdatedAt = photoSource.photoUpdatedAt;
      else delete merged.photoUpdatedAt;
    }

    localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
  }

  function applyRemoteBackup(backup, remoteSessions){
    const remoteStorage = backup?.storage && typeof backup.storage === "object" ? backup.storage : {};
    const hadLocalData = localHasMeaningfulData();
    const localProfile = safeJSON(localStorage.getItem(PROFILE_KEY), {}) || {};
    // Merge tombstones before records so another device cannot resurrect deletions.
    for (const key of ["sn_deleted_workout_ids", "sn_deleted_session_ids"]) {
      const remote = safeJSON(remoteStorage[key], []);
      const local = safeJSON(localStorage.getItem(key), []);
      const ids = [...new Set([...(Array.isArray(remote) ? remote : []), ...(Array.isArray(local) ? local : [])].map(String))];
      localStorage.setItem(key, JSON.stringify(ids));
    }

    if (!hadLocalData && Object.keys(remoteStorage).length) {
      Object.entries(remoteStorage).forEach(([key,value]) => {
        if (!key.startsWith("sn_") || EXCLUDED_KEYS.has(key) || key.startsWith("sn_cloud_")) return;
        if (key === PROFILE_KEY) return;
        if (key === "sn_deleted_workout_ids" || key === "sn_deleted_session_ids") return;
        if (typeof value === "string") localStorage.setItem(key, value);
      });
    } else {
      const remoteWorkouts = safeJSON(remoteStorage.sn_custom_workouts, []);
      const localWorkouts = safeJSON(localStorage.getItem("sn_custom_workouts"), []);
      const deletedIds = new Set(safeJSON(localStorage.getItem("sn_deleted_workout_ids"), []));
      const mergedWorkouts = mergeById(remoteWorkouts, localWorkouts).filter(workout => !deletedIds.has(workout.id));
      if (window.SN36?.saveWorkouts) {
        if (!window.SN36.saveWorkouts(mergedWorkouts, {silent:true})) throw new Error("Device storage is full. Cloud backup was not overwritten.");
      } else localStorage.setItem("sn_custom_workouts", JSON.stringify(mergedWorkouts));
    }

    mergeProfile(remoteStorage, localProfile, hadLocalData, backup?.updated_at);

    const localSessions = safeJSON(localStorage.getItem("sn_progress_sessions"), []);
    const backupSessions = safeJSON(remoteStorage.sn_progress_sessions, []);
    const deletedSessions = new Set(safeJSON(localStorage.getItem("sn_deleted_session_ids"), []));
    const mergedSessions = mergeSessions(
      [...(Array.isArray(backupSessions)?backupSessions:[]), ...(Array.isArray(remoteSessions)?remoteSessions:[])],
      localSessions
    ).filter(session => !deletedSessions.has(session.id));
    {
      if (window.SN36?.saveSessions) {
        if (!window.SN36.saveSessions(mergedSessions, {silent:true})) throw new Error("Device storage is full. Cloud backup was not overwritten.");
      } else localStorage.setItem("sn_progress_sessions", JSON.stringify(mergedSessions));
    }

    try {
      if (typeof state !== "undefined") {
        if (window.SN36?.saveWorkouts) window.SN36.saveWorkouts(window.SN36.workouts(), {silent:true});
        state.customWorkouts = safeJSON(localStorage.getItem("sn_custom_workouts"), state.customWorkouts || []);
      }
      window.SN36?.syncStats?.();
    } catch (error) {
      console.warn("Level Up Fitness cloud state refresh skipped", error);
    }

    return !hadLocalData && (Object.keys(remoteStorage).length > 0 || remoteSessions.length > 0);
  }

  function sessionId(session){
    if (session?.id) return String(session.id);
    const slug = String(session?.workoutName || "workout").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
    return `${Number(session?.timestamp)||Date.now()}-${slug || "workout"}`;
  }

  function sessionRow(session, userId){
    const timestamp = Number(session?.timestamp) || Date.now();
    const duration = Math.max(0, Math.round(Number(session?.durationMinutes) || 0));
    const completedAt = new Date(timestamp);
    const startedAt = new Date(Number(session?.startedAt) || (timestamp - duration*60000));
    const exercises = Array.isArray(session?.exercises) ? session.exercises : [];
    const muscles = [...new Set(exercises.flatMap(ex => [ex?.muscleGroups?.primary || ex?.primaryMuscle || ex?.muscle, ...(ex?.muscleGroups?.secondary || ex?.secondaryMuscles || [])]).filter(Boolean))];
    const notes = {};
    exercises.forEach(ex => {
      const note = String(ex?.note || "").trim();
      if (note) notes[String(ex?.id || ex?.name || "exercise")] = note.slice(0,500);
    });

    return {
      id: sessionId(session),
      user_id: userId,
      status: "completed",
      plan_id: String(session?.workoutId || ""),
      plan_name: String(session?.workoutName || "Workout"),
      program: session?.program || null,
      scheduled_day: session?.scheduledDay || null,
      muscles,
      started_at: startedAt.toISOString(),
      completed_at: completedAt.toISOString(),
      duration_minutes: duration,
      draft_payload: session,
      exercise_notes: notes,
      grade: session?.grade ?? null,
      updated_at: new Date().toISOString()
    };
  }

  async function fetchCloud(user){
    const profileResult = await client.from("profiles").select("app_settings, weekly_plan, updated_at").eq("id", user.id).maybeSingle();
    if (profileResult.error) throw profileResult.error;
    const sessions = [];
    for (let offset = 0; ; offset += 500) {
      const result = await client.from("workout_sessions").select("id, draft_payload, updated_at").eq("user_id", user.id).order("id", {ascending:true}).range(offset, offset + 499);
      if (result.error) throw result.error;
      sessions.push(...(result.data || []).map(row => row.draft_payload).filter(Boolean));
      if ((result.data || []).length < 500) break;
    }
    const profile = profileResult.data || null;
    return { profile, sessions };
  }

  async function pushCloud(user, cloud){
    const storage = collectStorage();
    const now = new Date().toISOString();
    const localProfile = window.SN36?.profile?.() || safeJSON(localStorage.getItem("sn_user_profile_v36"), {}) || {};
    const displayName = String(
      user.user_metadata?.display_name || localProfile.displayName || localProfile.name || user.email?.split("@")[0] || "Athlete"
    ).slice(0,80);
    const workouts = safeJSON(storage.sn_custom_workouts, []);

    const existingSettings = cloud.profile?.app_settings && typeof cloud.profile.app_settings === "object"
      ? cloud.profile.app_settings : {};

    const profileResult = await client.from("profiles").upsert({
      id: user.id,
      display_name: displayName,
      email: user.email || "",
      weekly_plan: Array.isArray(workouts) ? workouts : [],
      app_settings: {
        ...existingSettings,
        start_now_backup: { version: 1, updated_at: now, storage }
      },
      updated_at: now
    }, {onConflict:"id"});
    if (profileResult.error) throw profileResult.error;

    const sessions = safeJSON(storage.sn_progress_sessions, []);
    if (Array.isArray(sessions) && sessions.length) {
      const remote = new Map(cloud.sessions.map(session => [sessionId(session), JSON.stringify(session)]));
      const rows = sessions.filter(session => remote.get(sessionId(session)) !== JSON.stringify(session)).map(session => sessionRow(session, user.id));
      for (let offset=0; offset<rows.length; offset+=100) {
        const sessionResult = await client.from("workout_sessions").upsert(rows.slice(offset,offset+100), {onConflict:"id"});
        if (sessionResult.error) throw sessionResult.error;
      }
    }

    const deletedSessionIds = safeJSON(storage.sn_deleted_session_ids, []);
    if (Array.isArray(deletedSessionIds) && deletedSessionIds.length) {
      for (let offset=0; offset<deletedSessionIds.length; offset+=100) {
        const deleteResult = await client.from("workout_sessions").delete().eq("user_id", user.id).in("id", deletedSessionIds.slice(offset,offset+100));
        if (deleteResult.error) throw deleteResult.error;
      }
    }

    localStorage.setItem(SYNC_META_KEY, JSON.stringify({lastSyncedAt:now, userId:user.id}));
    lastFingerprint = fingerprint(storage);
  }

  async function syncNow(options={}){
    if (!client || !currentUser || syncing) return false;
    syncing = true;
    const user = currentUser;
    updateAccountUI("syncing");
    try {
      const cloud = await fetchCloud(user);
      if (currentUser?.id !== user.id) return false;
      const backup = cloud.profile?.app_settings?.start_now_backup || null;
      const restored = applyRemoteBackup(backup, cloud.sessions);
      await pushCloud(user, cloud);
      updateAccountUI("synced");
      if (restored && options.reloadOnRestore) {
        window.location.reload();
        return true;
      }
      return true;
    } catch (error) {
      console.error("Level Up Fitness cloud sync failed", error);
      updateAccountUI("error");
      if (!options.silent) show("Cloud sync couldn’t finish. Your data is still saved on this device.");
      return false;
    } finally {
      syncing = false;
    }
  }

  function scheduleSync(){
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => syncNow({silent:true}), 900);
  }

  function startSyncLoop(){
    if (window.__snCloudSyncLoop) return;
    window.__snCloudSyncLoop = setInterval(() => {
      if (!currentUser || document.hidden) return;
      const next = fingerprint();
      if (next !== lastFingerprint) scheduleSync();
    }, 15000);
  }

  function clearUserLocalData(){
    const keys = [];
    for (let i=0;i<localStorage.length;i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("sn_") && !key.startsWith("sn_cloud_archive_") && !PRESERVE_ON_SIGNOUT.has(key)) keys.push(key);
    }
    keys.forEach(key => localStorage.removeItem(key));
  }

  function displayName(){
    const profile = window.SN36?.profile?.() || safeJSON(localStorage.getItem("sn_user_profile_v36"), {}) || {};
    return String(
      currentUser?.user_metadata?.display_name || profile.displayName || profile.name || currentUser?.email?.split("@")[0] || ""
    ).trim();
  }

  function initials(){
    const name = displayName();
    if (!name) return "ME";
    return name.split(/\s+/).filter(Boolean).slice(0,2).map(part => part[0]).join("").toUpperCase().slice(0,2) || "ME";
  }

  function applyIdentity(){
    const name = displayName();
    const nextInitials = initials();
    document.querySelectorAll(".avatar, .profile-avatar").forEach(node => {
      if (node.textContent !== nextInitials) node.textContent = nextInitials;
    });
    const profileHeading = document.querySelector(".profile-card h2");
    const nextHeading = name || "Your profile";
    if (profileHeading && profileHeading.textContent !== nextHeading) profileHeading.textContent = nextHeading;
  }

  function scheduleIdentityRefresh(){
    if (identityRefreshQueued) return;
    identityRefreshQueued = true;
    requestAnimationFrame(() => {
      identityRefreshQueued = false;
      applyIdentity();
      if (typeof state !== "undefined" && state.page === "profile") appendAccountCard();
    });
  }

  function ensureStyles(){
    if (document.getElementById("snCloudAccountStyles")) return;
    const style = document.createElement("style");
    style.id = "snCloudAccountStyles";
    style.textContent = `
      .sn-account-card{margin-top:14px;padding:18px}.sn-account-card h2{font-size:18px;margin:0 0 5px}.sn-account-card p{margin:0;color:var(--muted);font-size:12px;line-height:1.5}
      .sn-account-status{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:14px;padding:12px 13px;border:1px solid var(--line);border-radius:14px;background:var(--surface)}
      .sn-account-status strong,.sn-account-status small{display:block}.sn-account-status strong{font-size:12px}.sn-account-status small{margin-top:3px;color:var(--muted);font-size:10px}.sn-cloud-dot{width:9px;height:9px;border-radius:50%;background:#94A3B8;flex:0 0 auto}.sn-cloud-dot.synced{background:#7FAF19}.sn-cloud-dot.syncing{background:#D89A0E}.sn-cloud-dot.error{background:#FF5A5F}
      .sn-account-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:12px}.sn-account-btn{min-height:44px;border-radius:13px;border:1px solid var(--line);background:var(--surface);color:var(--text);font:inherit;font-size:12px;font-weight:800;cursor:pointer}.sn-account-btn.primary{background:#FF5A5F;border-color:#FF5A5F;color:white}.sn-account-btn.danger{color:#FF5A5F;border-color:rgba(255,90,95,.3);background:rgba(255,90,95,.06)}
      .sn-legal-links{display:flex;justify-content:center;gap:18px;padding:17px 0 2px}.sn-legal-links a{color:var(--muted);font-size:11px;font-weight:700;text-decoration:none}.sn-legal-links a:hover{color:var(--text)}
      .sn-auth-modal{position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(8,12,18,.64);backdrop-filter:blur(5px)}.sn-auth-modal.open{display:flex}.sn-auth-sheet{max-height:calc(100dvh - 40px);overflow-y:auto;overscroll-behavior:contain;touch-action:pan-y;width:min(100%,430px);border-radius:24px;background:var(--surface);border:1px solid var(--line);box-shadow:0 24px 80px rgba(0,0,0,.28);padding:22px}.sn-auth-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.sn-auth-head h2{margin:0;font-size:24px}.sn-auth-head p{margin:5px 0 0;color:var(--muted);font-size:12px;line-height:1.45}.sn-auth-close{width:38px;height:38px;border-radius:12px;border:1px solid var(--line);background:var(--surface);color:var(--text);font-size:20px;cursor:pointer}.sn-auth-form{display:grid;gap:11px;margin-top:18px}.sn-auth-field{display:grid;gap:6px}.sn-auth-field span{font-size:11px;font-weight:800;color:var(--muted)}.sn-auth-field input{width:100%;box-sizing:border-box;min-height:48px;border:1px solid var(--line);border-radius:13px;background:var(--surface);color:var(--text);font:inherit;padding:0 13px}.sn-auth-submit{min-height:50px;border:0;border-radius:14px;background:#FF5A5F;color:white;font:inherit;font-weight:900;cursor:pointer}.sn-auth-error{min-height:16px;color:#FF5A5F;font-size:11px}.sn-auth-switch{text-align:center;margin-top:13px;color:var(--muted);font-size:11px}.sn-auth-switch button{border:0;background:none;color:#3478F6;font:inherit;font-weight:800;cursor:pointer}
      .dark .sn-auth-sheet{background:#17191B}.dark .sn-account-btn.danger{background:rgba(255,90,95,.08)}
      @media(max-width:390px){.sn-account-actions{grid-template-columns:1fr}.sn-auth-sheet{padding:18px}}
    `;
    document.head.appendChild(style);
  }

  function ensureAuthModal(){
    ensureStyles();
    if (document.getElementById("snAuthModal")) return;
    const modal = document.createElement("div");
    modal.className = "sn-auth-modal";
    modal.id = "snAuthModal";
    modal.innerHTML = `
      <div class="sn-auth-sheet" role="dialog" aria-modal="true" aria-labelledby="snAuthTitle">
        <div class="sn-auth-head"><div><h2 id="snAuthTitle">Sign in</h2><p id="snAuthIntro">Back up workouts and keep your history with your account.</p></div><button class="sn-auth-close" id="snAuthClose" aria-label="Close">×</button></div>
        <form class="sn-auth-form" id="snAuthForm">
          <label class="sn-auth-field" id="snNameField" hidden><span>Display name</span><input id="snAuthName" maxlength="80" autocomplete="name" /></label>
          <label class="sn-auth-field"><span>Email</span><input id="snAuthEmail" type="email" required autocomplete="email" /></label>
          <label class="sn-auth-field"><span>Password</span><input id="snAuthPassword" type="password" required minlength="8" autocomplete="current-password" /></label>
          <div class="sn-auth-error" id="snAuthError" role="alert"></div>
          <button class="sn-auth-submit" id="snAuthSubmit" type="submit">Sign in</button>
        </form>
        <div class="sn-auth-switch"><span id="snAuthSwitchCopy">New to Level Up Fitness?</span> <button id="snAuthSwitch" type="button">Create account</button></div>
        <div class="sn-auth-switch"><button id="snForgotPassword" type="button">Forgot password?</button></div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener("click", event => { if (event.target === modal) closeAuth(); });
    modal.querySelector("#snAuthClose").addEventListener("click", closeAuth);
    modal.querySelector("#snAuthSwitch").addEventListener("click", () => setAuthMode(authMode === "signin" ? "signup" : "signin"));
    modal.querySelector("#snForgotPassword").addEventListener("click", () => setAuthMode("reset"));
    modal.querySelector("#snAuthForm").addEventListener("submit", submitAuth);
    modal.addEventListener("keydown", event => {
      if (event.key === "Escape") { event.preventDefault(); closeAuth(); }
      if (event.key !== "Tab") return;
      const items = [...modal.querySelectorAll("button, input")].filter(el => !el.disabled && el.getClientRects().length);
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    });
  }

  function setAuthMode(mode){
    authMode = mode;
    const signup = mode === "signup";
    document.getElementById("snAuthTitle").textContent = signup ? "Create account" : "Sign in";
    document.getElementById("snAuthIntro").textContent = signup ? "Create an account to protect and sync your training data." : "Back up workouts and keep your history with your account.";
    document.getElementById("snNameField").hidden = !signup;
    document.getElementById("snAuthSubmit").textContent = signup ? "Create account" : "Sign in";
    document.getElementById("snAuthSwitchCopy").textContent = signup ? "Already have an account?" : "New to Level Up Fitness?";
    document.getElementById("snAuthSwitch").textContent = signup ? "Sign in" : "Create account";
    const password = document.getElementById("snAuthPassword");
    password.autocomplete = signup ? "new-password" : "current-password";
    password.closest("label").hidden = mode === "reset";
    password.required = mode !== "reset";
    const email = document.getElementById("snAuthEmail");
    email.closest("label").hidden = mode === "recovery";
    email.required = mode !== "recovery";
    document.getElementById("snForgotPassword").hidden = mode !== "signin";
    if (mode === "reset" || mode === "recovery") {
      document.getElementById("snAuthTitle").textContent = mode === "reset" ? "Reset password" : "Choose a new password";
      document.getElementById("snAuthIntro").textContent = mode === "reset" ? "We’ll send a secure reset link to your email." : "Use at least 8 characters for your new password.";
      document.getElementById("snAuthSubmit").textContent = mode === "reset" ? "Send reset link" : "Save password";
      password.autocomplete = "new-password";
    }
    document.getElementById("snAuthError").textContent = "";
  }

  function openAuth(mode="signin"){
    authTrigger = document.activeElement;
    ensureAuthModal();
    setAuthMode(mode);
    document.getElementById("snAuthModal").classList.add("open");
    setTimeout(() => document.getElementById(mode === "recovery" ? "snAuthPassword" : "snAuthEmail")?.focus(), 0);
  }

  function closeAuth(){
    document.getElementById("snAuthModal")?.classList.remove("open");
    document.getElementById("snAuthPassword").value = "";
    authTrigger?.focus?.();
  }

  async function submitAuth(event){
    event.preventDefault();
    if (!client) {
      document.getElementById("snAuthError").textContent = "Account service is unavailable. Your workouts remain on this device. Please try again later.";
      return;
    }
    const errorEl = document.getElementById("snAuthError");
    const button = document.getElementById("snAuthSubmit");
    const email = document.getElementById("snAuthEmail").value.trim();
    const password = document.getElementById("snAuthPassword").value;
    const name = document.getElementById("snAuthName").value.trim();
    const submittedMode = authMode;
    errorEl.textContent = "";
    button.disabled = true;
    button.textContent = authMode === "signup" ? "Creating…" : "Signing in…";
    try {
      if (submittedMode === "reset") {
        const {error} = await client.auth.resetPasswordForEmail(email, {redirectTo:location.origin + location.pathname});
        if (error) throw error;
        closeAuth();
        show("If an account exists for that email, a password reset link will arrive shortly.");
      } else if (submittedMode === "recovery") {
        const {error} = await client.auth.updateUser({password});
        if (error) throw error;
        closeAuth();
        show("Password updated.");
      } else if (submittedMode === "signup") {
        const {data,error} = await client.auth.signUp({email,password,options:{data:{display_name:name || email.split("@")[0]}}});
        if (error) throw error;
        if (!data.session) {
          closeAuth();
          show("Check your email to confirm your Level Up Fitness account, then sign in.");
        } else {
          closeAuth();
          show("Account created. Cloud backup is on.");
        }
      } else {
        const {error} = await client.auth.signInWithPassword({email,password});
        if (error) throw error;
        closeAuth();
        show("Signed in. Syncing your training data…");
      }
    } catch (error) {
      console.error("Level Up Fitness authentication failed", error);
      errorEl.textContent = error?.message || "Couldn’t complete that request.";
    } finally {
      button.disabled = false;
      button.textContent = authMode === "reset" ? "Send reset link" : authMode === "recovery" ? "Save password" : authMode === "signup" ? "Create account" : "Sign in";
    }
  }

  function statusCopy(status){
    if (!currentUser) return {title:"Saved on this device",detail:"Sign in for cloud backup."};
    if (status === "syncing") return {title:"Syncing…",detail:currentUser.email || "Your account"};
    if (status === "error") return {title:"Device copy is safe",detail:"Cloud sync will retry automatically."};
    if (status === "pending") return {title:"Waiting for backup",detail:"Your training data is saved on this device."};
    const meta = safeJSON(localStorage.getItem(SYNC_META_KEY), null);
    const when = meta?.lastSyncedAt ? new Date(meta.lastSyncedAt).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"}) : "just now";
    return {title:"Cloud backup on",detail:`${currentUser.email || "Signed in"} • Synced ${when}`};
  }

  function updateAccountUI(status="synced"){
    cloudStatus = status;
    const root = document.getElementById("snCloudStatus");
    if (!root) return;
    const copy = statusCopy(status);
    root.querySelector("strong").textContent = copy.title;
    root.querySelector("small").textContent = copy.detail;
    const dot = root.querySelector(".sn-cloud-dot");
    dot.className = `sn-cloud-dot ${currentUser ? status : ""}`;
  }

  function appendAccountCard(){
    ensureStyles();
    const root = document.getElementById("app");
    if (!root || root.querySelector("#snAccountCard")) { applyIdentity(); return; }
    const profileCard = root.querySelector(".profile-card");
    if (!profileCard) { applyIdentity(); return; }

    const card = document.createElement("section");
    card.className = "card sn-account-card";
    card.id = "snAccountCard";
    card.innerHTML = currentUser ? `
      <h2>Account & cloud backup</h2><p>Your training data is backed up to your account and can be restored on another device.</p>
      <div class="sn-account-status" id="snCloudStatus"><div><strong>Cloud backup on</strong><small>${esc(currentUser.email || "Signed in")}</small></div><i class="sn-cloud-dot synced"></i></div>
      <div class="sn-account-actions"><button class="sn-account-btn" id="snSyncNow">Sync now</button><button class="sn-account-btn danger" id="snDeleteAccount">Delete account</button></div>
    ` : `
      <h2>Protect your training data</h2><p>Your workouts are currently saved on this device. Sign in to add cloud backup and cross-device restore.</p>
      <div class="sn-account-status" id="snCloudStatus"><div><strong>Saved on this device</strong><small>Sign in for cloud backup.</small></div><i class="sn-cloud-dot"></i></div>
      <div class="sn-account-actions"><button class="sn-account-btn primary" id="snSignIn">Sign in</button><button class="sn-account-btn" id="snCreateAccount">Create account</button></div>
    `;
    profileCard.insertAdjacentElement("afterend", card);

    const legal = document.createElement("div");
    legal.className = "sn-legal-links";
    legal.innerHTML = `<a href="privacy.html" target="_blank" rel="noopener">Privacy</a><a href="support.html" target="_blank" rel="noopener">Support</a>`;
    card.insertAdjacentElement("afterend", legal);

    card.querySelector("#snSignIn")?.addEventListener("click", () => openAuth("signin"));
    card.querySelector("#snCreateAccount")?.addEventListener("click", () => openAuth("signup"));
    card.querySelector("#snSyncNow")?.addEventListener("click", async () => { const ok=await syncNow(); if(ok) show("Cloud backup is up to date."); });
    card.querySelector("#snDeleteAccount")?.addEventListener("click", deleteAccount);

    const signoutWrap = root.querySelector(".sn-profile-signout-wrap");
    if (signoutWrap) signoutWrap.hidden = !currentUser;
    updateAccountUI(cloudStatus);
    applyIdentity();
  }

  async function deleteAccount(){
    if (!client || !currentUser) return;
    const confirmed = window.confirm("Delete your Level Up Fitness account and all cloud workout data? This cannot be undone.");
    if (!confirmed) return;
    const second = window.confirm("Are you sure? Your account, workout history, saved plans, and synced notes will be permanently deleted.");
    if (!second) return;
    try {
      await syncNow({silent:true});
      const {error} = await client.functions.invoke("delete-account", {body:{confirm:true}});
      if (error) throw error;
      clearUserLocalData();
      try { await client.auth.signOut({scope:"local"}); } catch {}
      show("Your Level Up Fitness account was deleted.");
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error("Level Up Fitness account deletion failed", error);
      show("Couldn’t delete the account. Please try again.");
    }
  }

  async function signOut(){
    if (!client) return false;
    try {
      if (!await syncNow({silent:true}) || fingerprint() !== lastFingerprint) {
        show("Sign-out paused: back up your latest changes before signing out. Your data is still on this device.");
        return false;
      }
      const {error} = await client.auth.signOut({scope:"local"});
      if (error) throw error;
      clearUserLocalData();
      window.location.reload();
      return true;
    } catch (error) {
      show("Couldn’t sign out. Your data is still on this device. Please try again.");
      return false;
    }
  }

  async function onUser(user, {reloadOnRestore=false}={}){
    if (switchAccountStorage(user)) return;
    currentUser = user || null;
    window.SN_CLOUD_USER = currentUser;
    if (currentUser) {
      await syncNow({silent:true,reloadOnRestore});
    }
    appendAccountCard();
    applyIdentity();
  }

  async function init(){
    ensureAuthModal();
    if (!window.supabase?.createClient) {
      console.warn("Level Up Fitness cloud backup unavailable: Supabase library did not load.");
      appendAccountCard();
      return;
    }

    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:localStorage}
    });
    window.SN_SUPABASE = client;
    window.SN_AUTH = { signOut, openSignIn:() => openAuth("signin"), openSignUp:() => openAuth("signup"), syncNow };

    client.auth.onAuthStateChange((event, session) => {
      setTimeout(async () => {
        if (event === "PASSWORD_RECOVERY") openAuth("recovery");
        const nextUser = session?.user || null;
        const changed = nextUser?.id !== currentUser?.id;
        if (changed && switchAccountStorage(nextUser)) return;
        currentUser = nextUser;
        window.SN_CLOUD_USER = currentUser;
        if (currentUser && (changed || event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
          await syncNow({silent:true,reloadOnRestore:changed});
        }
        if (!currentUser) lastFingerprint = "";
        if (typeof state !== "undefined" && state.page === "profile" && typeof render === "function") render();
        else { appendAccountCard(); applyIdentity(); }
      }, 0);
    });

    const {data:{session}} = await client.auth.getSession();
    await onUser(session?.user || null, {reloadOnRestore:true});

    startSyncLoop();
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && currentUser && fingerprint() !== lastFingerprint) syncNow({silent:true});
    });
  }

  ensureStyles();
  const appRoot = document.getElementById("app");
  if (appRoot) new MutationObserver(scheduleIdentityRefresh).observe(appRoot,{childList:true,subtree:true});

  if (typeof window.renderProfile === "function") {
    const priorProfile = window.renderProfile;
    window.renderProfile = function(...args){
      const result = priorProfile.apply(this,args);
      queueMicrotask(appendAccountCard);
      return result;
    };
  }

  window.START_NOW_CLOUD = {version:"v89",syncNow:() => syncNow(),openSignIn:() => openAuth("signin"),openSignUp:() => openAuth("signup")};
  init().catch(error => console.error("Level Up Fitness cloud initialization failed", error));
})();
