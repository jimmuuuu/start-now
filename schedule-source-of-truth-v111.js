// START/NOW v111 — one schedule source of truth without replacing the dedicated rest-day experience.
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
    if (typeof getScheduledWorkout === "function") return getScheduledWorkout(todayName());
    return (state?.customWorkouts || []).find(workout => (workout.days || []).includes(todayName())) || null;
  }

  function hasAnyScheduledWorkout() {
    return (state?.customWorkouts || []).some(workout => Array.isArray(workout.days) && workout.days.length > 0);
  }

  function installStyles() {
    if (document.getElementById("sn111-schedule-truth-styles")) return;
    const style = document.createElement("style");
    style.id = "sn111-schedule-truth-styles";
    style.textContent = `
      .sn111-empty-plan{padding:20px!important;overflow:hidden;position:relative}
      .sn111-empty-plan::after{content:"";position:absolute;width:190px;height:190px;border-radius:50%;right:-55px;top:8px;background:rgba(59,130,246,.07);pointer-events:none}
      .sn111-empty-plan .sn111-kicker{position:relative;z-index:1;font-size:12px;font-weight:850;letter-spacing:.08em;text-transform:uppercase;color:var(--blue,#3B82F6)}
      .sn111-empty-plan .sn111-body{position:relative;z-index:1;padding:20px 0 16px;max-width:320px}
      .sn111-empty-plan h2{margin:0 0 7px!important;font-size:30px!important;letter-spacing:-.8px}
      .sn111-empty-plan p{margin:0;color:var(--muted,#7B7D83);font-size:14px;line-height:1.5}
      .sn111-empty-plan .sn111-day{display:inline-flex;margin-top:12px;padding:7px 10px;border-radius:999px;background:#F3F7FF;border:1px solid #E0EAFE;color:#3564A8;font-size:11px;font-weight:750}
      .sn111-empty-plan .sn111-action{position:relative;z-index:1;width:100%;border:0;border-radius:16px;padding:15px 18px;background:linear-gradient(135deg,var(--coral,#FF5A5F),var(--coral-2,#FF3D44));color:#fff;font-weight:800;font-size:15px;box-shadow:0 10px 20px rgba(255,90,95,.2)}
      .dark .sn111-empty-plan .sn111-day{background:#182235;border-color:#263A5A;color:#9CC0FF}
    `;
    document.head.appendChild(style);
  }

  function patchHomeSchedule() {
    if (typeof state !== "undefined" && state.page !== "home") return;

    // A real workout assigned to today should be rendered normally.
    if (scheduledToday()) return;

    const plan = document.querySelector(".plan-card");
    if (!plan) return;

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
    plan.className = `${plan.className.replace(/\bsn54-rest-card\b/g, "").replace(/\bsn110-empty-plan\b/g, "").trim()} sn111-empty-plan`;
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
    version: "v111",
    scheduledToday,
    hasAnyScheduledWorkout,
    refresh: patchHomeSchedule
  };
})();
