// START/NOW v88 — lightweight production diagnostics.
(() => {
  const LOG_KEY = "sn_error_log_v88";
  const MAX_LOCAL = 20;
  let sending = false;

  const build = () => document.querySelector('meta[name="startnow-build"]')?.content || "unknown";
  const page = () => { try { return typeof state !== "undefined" ? String(state.page || "unknown") : "unknown"; } catch { return "unknown"; } };

  function readLog(){
    try { const value=JSON.parse(localStorage.getItem(LOG_KEY)); return Array.isArray(value)?value:[]; }
    catch { return []; }
  }

  function saveLocal(entry){
    try {
      const log=readLog();
      log.push(entry);
      localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(-MAX_LOCAL)));
    } catch {}
  }

  function normalizeError(error, fallback="Unknown error"){
    if (error instanceof Error) return {message:error.message || fallback,stack:error.stack || null,name:error.name || "Error"};
    if (typeof error === "string") return {message:error,stack:null,name:"Error"};
    try { return {message:JSON.stringify(error) || fallback,stack:null,name:"Error"}; }
    catch { return {message:fallback,stack:null,name:"Error"}; }
  }

  async function sendRemote(entry){
    const client=window.SN_SUPABASE;
    const user=window.SN_CLOUD_USER;
    if (!client || !user || sending) return;
    sending=true;
    try {
      await client.from("app_errors").insert({
        user_id:user.id,
        occurred_at:entry.occurred_at,
        build:entry.build,
        page:entry.page,
        message:entry.message.slice(0,2000),
        stack:entry.stack ? entry.stack.slice(0,8000) : null,
        context:{
          name:entry.name,
          href:location.href,
          userAgent:navigator.userAgent,
          online:navigator.onLine,
          viewport:`${window.innerWidth}x${window.innerHeight}`
        }
      });
    } catch (error) {
      console.warn("START/NOW remote error report skipped", error);
    } finally {
      sending=false;
    }
  }

  function capture(error, source="runtime"){
    const normalized=normalizeError(error);
    const entry={
      occurred_at:new Date().toISOString(),
      build:build(),
      page:page(),
      source,
      name:normalized.name,
      message:normalized.message,
      stack:normalized.stack
    };
    saveLocal(entry);
    sendRemote(entry);
    return entry;
  }

  window.addEventListener("error", event => {
    capture(event.error || event.message || "Script error", "window.error");
  });

  window.addEventListener("unhandledrejection", event => {
    capture(event.reason || "Unhandled promise rejection", "unhandledrejection");
  });

  window.addEventListener("offline", () => {
    if (typeof window.showToast === "function") window.showToast("You’re offline. START/NOW will keep saving on this device.");
  });

  window.addEventListener("online", () => {
    window.START_NOW_CLOUD?.syncNow?.();
  });

  window.START_NOW_DIAGNOSTICS={
    version:"v88",
    capture,
    getLocalErrors:readLog,
    clearLocalErrors:() => localStorage.removeItem(LOG_KEY),
    status:() => ({build:build(),page:page(),online:navigator.onLine,cloud:Boolean(window.SN_CLOUD_USER)})
  };
})();
