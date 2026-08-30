// START/NOW v135 — active workout wins over schedule/rest state on Home.
(() => {
  function esc(value = "") {
    if (typeof escapeHtml === "function") return escapeHtml(String(value));
    return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  }

  function todayName() {
    return typeof dayName === "function"
      ? dayName()
      : ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()];
  }

  function scheduledToday() {
    if (window.SN36?.scheduledWorkout) return window.SN36.scheduledWorkout(todayName());
    if (typeof getScheduledWorkout === "function") return getScheduledWorkout(todayName());
    return (state?.customWorkouts || []).find(workout => (workout.days || []).includes(todayName())) || null;
  }

  function hasAnyScheduledWorkout() {
    return (state?.customWorkouts || []).some(workout => Array.isArray(workout.days) && workout.days.length > 0);
  }

  function activeSession() {
    const SN = window.SN36;
    if (!SN) return null;
    try {
      return SN.activeWorkoutSession?.() || SN.active || null;
    } catch {
      return SN.active || null;
    }
  }

  function activeProgress(active) {
    const exercises = Array.isArray(active?.exercises) ? active.exercises : [];
    let planned = 0;
    let done = 0;
    exercises.forEach(ex => {
      const sets = Array.isArray(ex?.sets) ? ex.sets : [];
      const target = Math.max(1, Number(ex?.originalPlannedSets || ex?.plannedSets || sets.length || 1));
      planned += target;
      done += sets.slice(0, target).filter(set => set?.done).length;
    });
    return { planned, done };
  }

  function installStyles() {
    if (document.getElementById("sn111-schedule-truth-styles")) return;
    const style = document.createElement("style");
    style.id = "sn111-schedule-truth-styles";
    style.textContent = `
      .sn111-empty-plan,.sn133-active-plan{padding:20px!important;overflow:hidden;position:relative}
      .sn111-empty-plan::after,.sn133-active-plan::after{content:"";position:absolute;width:190px;height:190px;border-radius:50%;right:-55px;top:8px;background:rgba(59,130,246,.07);pointer-events:none}
      .sn111-empty-plan .sn111-kicker,.sn133-active-plan .sn133-kicker{position:relative;z-index:1;font-size:12px;font-weight:850;letter-spacing:.08em;text-transform:uppercase;color:var(--blue,#3B82F6)}
      .sn111-empty-plan .sn111-body,.sn133-active-plan .sn133-body{position:relative;z-index:1;padding:20px 0 16px;max-width:390px}
      .sn111-empty-plan h2,.sn133-active-plan h2{margin:0 0 7px!important;font-size:30px!important;letter-spacing:-.8px}
      .sn111-empty-plan p,.sn133-active-plan p{margin:0;color:var(--muted,#7B7D83);font-size:14px;line-height:1.5}
      .sn111-empty-plan .sn111-day{display:inline-flex;margin-top:12px;padding:7px 10px;border-radius:999px;background:#F3F7FF;border:1px solid #E0EAFE;color:#3564A8;font-size:11px;font-weight:750}
      .sn111-empty-plan .sn111-action,.sn133-active-plan .sn133-action{position:relative;z-index:1;width:100%;border:0;border-radius:16px;padding:15px 18px;background:linear-gradient(135deg,var(--coral,#FF5A5F),var(--coral-2,#FF3D44));color:#fff;font-weight:800;font-size:15px;box-shadow:0 10px 20px rgba(255,90,95,.2)}
      .sn133-active-plan .sn133-current{margin-top:7px;font-weight:750;color:var(--text,#171717)}
      .sn133-active-plan .sn133-progress-copy{display:flex;justify-content:space-between;gap:12px;margin-top:14px;font-size:10px;font-weight:800;color:var(--muted,#7B7D83)}
      .sn133-active-plan .sn133-progress{height:7px;margin-top:7px;border-radius:999px;background:rgba(59,130,246,.12);overflow:hidden}
      .sn133-active-plan .sn133-progress span{display:block;height:100%;border-radius:inherit;background:#3B82F6}
      .dark .sn111-empty-plan .sn111-day{background:#182235;border-color:#263A5A;color:#9CC0FF}
    `;
    document.head.appendChild(style);
  }

  function renderActivePlan(plan, active) {
    const exercises = Array.isArray(active.exercises) ? active.exercises : [];
    const index = Math.max(0, Math.min(exercises.length - 1, Number(active.index) || 0));
    const current = exercises[index] || null;
    const progress = activeProgress(active);
    const percent = progress.planned ? Math.round(progress.done / progress.planned * 100) : 0;

    plan.className = `${plan.className
      .replace(/\bsn54-rest-card\b/g, "")
      .replace(/\bsn110-empty-plan\b/g, "")
      .replace(/\bsn111-empty-plan\b/g, "")
      .replace(/\bsn133-active-plan\b/g, "")
      .trim()} sn133-active-plan`;
    plan.innerHTML = `
      <div class="sn133-kicker">TODAY'S PLAN</div>
      <div class="sn133-body">
        <h2>${esc(active.workoutName || "Workout")}</h2>
        <p class="sn133-current">${current ? `${esc(current.name || "Exercise")} • Exercise ${index + 1} of ${exercises.length}` : `${exercises.length} exercises`}</p>
        <div class="sn133-progress-copy"><span>${progress.done} of ${progress.planned} sets completed</span><span>${percent}%</span></div>
        <div class="sn133-progress" aria-label="Workout progress"><span style="width:${percent}%"></span></div>
      </div>
      <button type="button" class="sn133-action" id="sn133ResumeWorkout">Resume Workout →</button>
    `;

    document.getElementById("sn133ResumeWorkout")?.addEventListener("click", () => {
      state.page = "activeWorkout";
      if (typeof render === "function") render();
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  }

  function patchHomeSchedule() {
    if (typeof state !== "undefined" && state.page !== "home") return;

    const plan = document.querySelector(".plan-card");
    if (!plan) return;

    // An in-progress workout is the most important Home state, regardless of
    // whether today was scheduled, a rest day, or the weekly schedule is empty.
    const active = activeSession();
    if (active?.workoutName && Array.isArray(active.exercises) && active.exercises.length) {
      renderActivePlan(plan, active);
      return;
    }

    // A real workout assigned to today should be rendered normally.
    if (scheduledToday()) return;

    // rest-day-v54 already rendered the correct recovery card when the user has
    // a real weekly schedule but nothing is assigned today. Preserve it instead
    // of replacing it with a generic empty-state card.
    if (plan.classList.contains("sn54-rest-card")) return;

    // If a schedule exists, give the rest-day module one more chance to render
    // before falling back. This keeps Home and Calendar on the same data source.
    if (hasAnyScheduledWorkout() && window.START_NOW_REST_DAY?.isRestToday?.()) {
      window.START_NOW_REST_DAY?.refresh?.();
      if (plan.classList.contains("sn54-rest-card")) return;
    }

    const day = todayName();
    plan.className = `${plan.className
      .replace(/\bsn54-rest-card\b/g, "")
      .replace(/\bsn110-empty-plan\b/g, "")
      .replace(/\bsn111-empty-plan\b/g, "")
      .replace(/\bsn133-active-plan\b/g, "")
      .trim()} sn111-empty-plan`;
    plan.innerHTML = `
      <div class="sn111-kicker">TODAY'S PLAN</div>
      <div class="sn111-body">
        <h2>No workout scheduled</h2>
        <p>Your weekly schedule is empty, so START/NOW will not label a default workout as today's plan.</p>
        <span class="sn111-day">${esc(day)}</span>
      </div>
      <button type="button" class="sn111-action" id="sn111Workouts">Set up my schedule →</button>
    `;

    document.getElementById("sn111Workouts")?.addEventListener("click", () => {
      state.page = "workouts";
      if (typeof render === "function") render();
    });
  }

  installStyles();

  if (typeof renderHome === "function") {
    const previousHome = renderHome;
    window.renderHome = function(...args) {
      const result = previousHome.apply(this, args);
      patchHomeSchedule();
      return result;
    };
  }

  queueMicrotask(patchHomeSchedule);

  window.START_NOW_SCHEDULE_TRUTH = {
    version: "v135",
    scheduledToday,
    hasAnyScheduledWorkout,
    activeSession,
    refresh: patchHomeSchedule
  };
})();
