// START/NOW v53 — schedule-aware Rest Day home state + recovery screen.
(() => {
  const WEEK = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  function esc(value) {
    if (typeof escapeHtml === "function") return escapeHtml(value);
    return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  }

  function todayName() {
    return typeof dayName === "function" ? dayName() : WEEK[new Date().getDay()];
  }

  function scheduledWorkouts() {
    return (state?.customWorkouts || []).filter(workout => Array.isArray(workout.days) && workout.days.length);
  }

  function todayScheduledWorkout() {
    const today = todayName();
    return scheduledWorkouts().find(workout => workout.days.includes(today)) || null;
  }

  function hasRealSchedule() {
    return scheduledWorkouts().length > 0;
  }

  function isRestToday() {
    return hasRealSchedule() && !todayScheduledWorkout();
  }

  function nextScheduledWorkout() {
    const workouts = scheduledWorkouts();
    if (!workouts.length) return null;
    const todayIndex = WEEK.indexOf(todayName());
    let best = null;
    for (const workout of workouts) {
      for (const day of workout.days || []) {
        const dayIndex = WEEK.indexOf(day);
        if (dayIndex < 0) continue;
        let offset = (dayIndex - todayIndex + 7) % 7;
        if (offset === 0) offset = 7;
        if (!best || offset < best.offset) best = { workout, day, offset };
      }
    }
    return best;
  }

  function moonSvg() {
    return `<svg viewBox="0 0 180 150" role="img" aria-label="Rest and recovery">
      <defs>
        <linearGradient id="sn53Moon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#DBEAFE"/>
          <stop offset="100%" stop-color="#93C5FD"/>
        </linearGradient>
      </defs>
      <circle cx="95" cy="74" r="44" fill="url(#sn53Moon)"/>
      <circle cx="114" cy="58" r="43" fill="#FFFFFF"/>
      <circle cx="49" cy="44" r="4" fill="#F2B631"/>
      <circle cx="139" cy="34" r="3.5" fill="#F2B631"/>
      <circle cx="147" cy="95" r="3" fill="#F2B631"/>
      <path d="M42 95 C62 84 79 84 97 94 C111 101 126 102 142 95" fill="none" stroke="#C7D7EA" stroke-width="4" stroke-linecap="round"/>
    </svg>`;
  }

  function installStyles() {
    if (document.getElementById("sn53-rest-day-styles")) return;
    const style = document.createElement("style");
    style.id = "sn53-rest-day-styles";
    style.textContent = `
      .sn53-rest-card{overflow:hidden}
      .sn53-rest-card .plan-grid{align-items:center}
      .sn53-rest-art{display:flex;align-items:center;justify-content:center;min-height:150px}
      .sn53-rest-art svg{width:150px;max-width:100%;height:auto;display:block}
      .sn53-rest-kicker{display:inline-flex;align-items:center;gap:7px;color:#2F6DF6;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
      .sn53-rest-copy{margin:8px 0 4px;color:var(--muted);font-size:14px;line-height:1.45}
      .sn53-rest-meta{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
      .sn53-rest-meta span{padding:7px 9px;border-radius:999px;background:#F4F7FB;color:#526070;font-size:12px;font-weight:700}
      .sn53-rest-button{margin-top:16px}
      .sn53-rest-page{padding:8px 0 40px}
      .sn53-rest-top{display:flex;align-items:center;gap:12px;margin-bottom:18px}
      .sn53-rest-top h1{margin:2px 0 0;font-size:30px;line-height:1.1}
      .sn53-rest-top span{font-size:11px;font-weight:800;letter-spacing:.12em;color:#2F6DF6}
      .sn53-rest-hero{text-align:center;padding:24px 20px}
      .sn53-rest-hero svg{width:180px;max-width:60%;height:auto;margin:0 auto 10px;display:block}
      .sn53-rest-hero h2{margin:4px 0 8px;font-size:23px}
      .sn53-rest-hero p{max-width:460px;margin:0 auto;color:var(--muted);line-height:1.55}
      .sn53-recovery-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}
      .sn53-recovery-item{padding:14px;border:1px solid #E8EEF5;border-radius:16px;background:#FBFCFE}
      .sn53-recovery-item strong{display:block;font-size:14px;margin-bottom:4px}
      .sn53-recovery-item span{font-size:12px;color:var(--muted);line-height:1.4}
      .sn53-section{margin-top:14px;padding:18px}
      .sn53-section h3{margin:0 0 10px;font-size:17px}
      .sn53-activity-list{display:grid;gap:9px}
      .sn53-activity-list div{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #EEF2F6}
      .sn53-activity-list div:last-child{border-bottom:0}
      .sn53-activity-list i{width:8px;height:8px;border-radius:50%;background:#B7D629;flex:0 0 auto}
      .sn53-coach{margin-top:14px;padding:16px 18px;border-radius:18px;background:#F3F7FF;border:1px solid #DDE9FF}
      .sn53-coach span{font-size:11px;font-weight:800;letter-spacing:.1em;color:#2F6DF6}
      .sn53-coach p{margin:6px 0 0;font-weight:700;line-height:1.45}
      @media(max-width:640px){.sn53-rest-art{min-height:125px}.sn53-rest-art svg{width:125px}.sn53-rest-hero{padding:20px 16px}.sn53-rest-top h1{font-size:26px}}
    `;
    document.head.appendChild(style);
  }

  function patchHomeRestState() {
    if (!isRestToday()) return;
    const plan = document.querySelector(".plan-card");
    if (!plan) return;
    const next = nextScheduledWorkout();

    plan.classList.add("sn53-rest-card");
    plan.innerHTML = `
      <div class="sn53-rest-kicker">TODAY’S PLAN</div>
      <div class="plan-grid">
        <div>
          <h2>Rest Day</h2>
          <p class="sn53-rest-copy">Recovery is part of progress.</p>
          <div class="sn53-rest-meta">
            <span>No workout scheduled</span>
            ${next ? `<span>Next: ${esc(next.workout.name)} • ${esc(next.day)}</span>` : `<span>Your next workout is scheduled soon</span>`}
          </div>
        </div>
        <div class="sn53-rest-art">${moonSvg()}</div>
      </div>
      <button class="primary sn53-rest-button" id="sn53ViewRecovery">View Recovery Plan →</button>
    `;

    document.getElementById("sn53ViewRecovery")?.addEventListener("click", () => {
      state.page = "restDay";
      render();
    });

    const muscleCard = document.querySelector(".sn52-muscle-card") || [...document.querySelectorAll(".section-card,.card")].find(card => /muscle focus/i.test(card.textContent || ""));
    if (muscleCard) muscleCard.style.display = "none";
  }

  function renderRestDay() {
    if (typeof navActive === "function") navActive();
    const next = nextScheduledWorkout();
    app.innerHTML = `
      <section class="sn-page sn53-rest-page">
        <div class="sn53-rest-top">
          <button class="icon-btn" id="sn53Back">←</button>
          <div><span>RECOVERY</span><h1>Rest Day</h1></div>
        </div>

        <section class="card sn53-rest-hero">
          ${moonSvg()}
          <h2>Today is a recovery day</h2>
          <p>Taking a rest day gives your body time to recover and helps you stay consistent for your next training session.</p>
          ${next ? `<div class="sn53-rest-meta" style="justify-content:center"><span>Next workout: ${esc(next.workout.name)} • ${esc(next.day)}</span></div>` : ""}
        </section>

        <section class="card sn53-section">
          <h3>Recovery focus</h3>
          <div class="sn53-recovery-grid">
            <div class="sn53-recovery-item"><strong>Recover</strong><span>Give trained muscles time away from hard lifting.</span></div>
            <div class="sn53-recovery-item"><strong>Sleep</strong><span>Aim for a regular, full night of sleep.</span></div>
            <div class="sn53-recovery-item"><strong>Hydrate</strong><span>Drink normally through the day and with meals.</span></div>
            <div class="sn53-recovery-item"><strong>Eat well</strong><span>Keep regular balanced meals that support recovery.</span></div>
          </div>
        </section>

        <section class="card sn53-section">
          <h3>Optional light activity</h3>
          <div class="sn53-activity-list">
            <div><i></i><span>Easy walk</span></div>
            <div><i></i><span>Gentle stretching</span></div>
            <div><i></i><span>Light mobility</span></div>
            <div><i></i><span>Easy everyday movement</span></div>
          </div>
        </section>

        <div class="sn53-coach">
          <span>COACH CUE</span>
          <p>Consistency includes rest. Recover well so you can return ready for your next session.</p>
        </div>
      </section>
    `;
    document.getElementById("sn53Back")?.addEventListener("click", () => {
      state.page = "home";
      render();
    });
  }

  installStyles();

  if (typeof renderHome === "function") {
    const priorHome = renderHome;
    window.renderHome = function(...args) {
      const result = priorHome.apply(this, args);
      patchHomeRestState();
      return result;
    };
  }

  if (typeof render === "function") {
    const priorRender = render;
    window.render = function(...args) {
      if (state?.page === "restDay") return renderRestDay();
      return priorRender.apply(this, args);
    };
  }

  window.START_NOW_REST_DAY = {
    version: "v53",
    isRestToday,
    todayScheduledWorkout,
    nextScheduledWorkout,
    render: renderRestDay
  };

  queueMicrotask(() => {
    if (state?.page === "home") patchHomeRestState();
  });
})();
