// START/NOW v54 — blue rest-day theme + larger detailed moon illustration.
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
    return `<svg viewBox="0 0 260 210" role="img" aria-label="Crescent moon and stars for rest and recovery">
      <defs>
        <linearGradient id="sn54Moon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#93C5FD"/>
          <stop offset="55%" stop-color="#60A5FA"/>
          <stop offset="100%" stop-color="#2563EB"/>
        </linearGradient>
        <linearGradient id="sn54Glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#EFF6FF"/>
          <stop offset="100%" stop-color="#DBEAFE"/>
        </linearGradient>
        <filter id="sn54Shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#2563EB" flood-opacity=".18"/>
        </filter>
      </defs>

      <path d="M32 55 C57 18 111 6 165 18 C212 28 244 64 242 112 C241 157 207 190 158 197 C110 203 60 187 36 151 C16 121 14 84 32 55 Z" fill="url(#sn54Glow)" opacity=".95"/>

      <g filter="url(#sn54Shadow)">
        <path d="M151 38 C117 48 94 79 94 115 C94 149 114 176 146 187 C117 194 82 185 62 160 C39 130 38 89 59 58 C78 31 112 18 151 22 C141 27 134 31 127 37 C137 36 145 36 151 38 Z" fill="url(#sn54Moon)"/>
        <path d="M146 187 C178 184 205 169 225 145 C214 170 194 190 168 200 C144 209 113 209 87 199 C107 200 128 196 146 187 Z" fill="#A9C7FF" opacity=".9"/>

        <ellipse cx="83" cy="90" rx="9" ry="13" fill="#BFDBFE" opacity=".55"/>
        <ellipse cx="75" cy="119" rx="7" ry="9" fill="#93C5FD" opacity=".45"/>
        <ellipse cx="99" cy="153" rx="10" ry="7" fill="#BFDBFE" opacity=".4"/>
        <circle cx="91" cy="63" r="5" fill="#DBEAFE" opacity=".5"/>
      </g>

      <path d="M171 52 L176 65 L189 70 L176 75 L171 88 L166 75 L153 70 L166 65 Z" fill="#2563EB" opacity=".9"/>
      <path d="M210 91 L214 101 L224 105 L214 109 L210 119 L206 109 L196 105 L206 101 Z" fill="#60A5FA"/>
      <path d="M50 42 L53 50 L61 53 L53 56 L50 64 L47 56 L39 53 L47 50 Z" fill="#3B82F6"/>
      <circle cx="208" cy="45" r="4" fill="#93C5FD"/>
      <circle cx="229" cy="127" r="3.5" fill="#60A5FA" opacity=".8"/>
      <circle cx="48" cy="145" r="3.5" fill="#93C5FD"/>
      <circle cx="190" cy="135" r="2.5" fill="#FFFFFF" stroke="#BFDBFE" stroke-width="1.5"/>
      <circle cx="126" cy="39" r="2.5" fill="#FFFFFF" opacity=".95"/>

      <path d="M57 181 C82 171 101 172 119 182 C135 191 154 193 181 186" fill="none" stroke="#A7C7F5" stroke-width="5" stroke-linecap="round" opacity=".75"/>
    </svg>`;
  }

  function installStyles() {
    if (document.getElementById("sn54-rest-day-styles")) return;
    const style = document.createElement("style");
    style.id = "sn54-rest-day-styles";
    style.textContent = `
      .sn54-rest-card{overflow:hidden;border-color:#DCE8FB}
      .sn54-rest-card .plan-grid{align-items:center;grid-template-columns:minmax(0,1.2fr) minmax(180px,.8fr)}
      .sn54-rest-art{display:flex;align-items:center;justify-content:center;min-height:190px;margin:-8px -4px -8px 0}
      .sn54-rest-art svg{width:225px;max-width:100%;height:auto;display:block}
      .sn54-rest-kicker{display:inline-flex;align-items:center;gap:7px;color:#2563EB;font-size:12px;font-weight:800;letter-spacing:.09em;text-transform:uppercase}
      .sn54-rest-copy{margin:8px 0 4px;color:var(--muted);font-size:14px;line-height:1.45}
      .sn54-rest-meta{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
      .sn54-rest-meta span{padding:8px 10px;border-radius:999px;background:#EFF6FF;color:#285EA8;font-size:12px;font-weight:750;border:1px solid #DBEAFE}
      .sn54-rest-button{margin-top:16px!important;background:linear-gradient(135deg,#2F6DF6 0%,#2563EB 100%)!important;border-color:#2563EB!important;color:#fff!important;box-shadow:0 9px 20px rgba(37,99,235,.2)!important}
      .sn54-rest-button:hover{filter:brightness(.98)}

      .sn54-rest-page{padding:8px 0 40px}
      .sn54-rest-page .primary{background:linear-gradient(135deg,#2F6DF6 0%,#2563EB 100%)!important;border-color:#2563EB!important}
      .sn54-rest-top{display:flex;align-items:center;gap:12px;margin-bottom:18px}
      .sn54-rest-top h1{margin:2px 0 0;font-size:30px;line-height:1.1}
      .sn54-rest-top span{font-size:11px;font-weight:800;letter-spacing:.12em;color:#2563EB}
      .sn54-rest-hero{text-align:center;padding:24px 20px;border-color:#DCE8FB}
      .sn54-rest-hero svg{width:240px;max-width:72%;height:auto;margin:-2px auto 4px;display:block}
      .sn54-rest-hero h2{margin:4px 0 8px;font-size:23px}
      .sn54-rest-hero p{max-width:460px;margin:0 auto;color:var(--muted);line-height:1.55}
      .sn54-recovery-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}
      .sn54-recovery-item{padding:14px;border:1px solid #DCE8FB;border-radius:16px;background:#F8FBFF}
      .sn54-recovery-item strong{display:block;font-size:14px;margin-bottom:4px;color:#173B72}
      .sn54-recovery-item span{font-size:12px;color:var(--muted);line-height:1.4}
      .sn54-section{margin-top:14px;padding:18px}
      .sn54-section h3{margin:0 0 10px;font-size:17px}
      .sn54-activity-list{display:grid;gap:9px}
      .sn54-activity-list div{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #EEF2F6}
      .sn54-activity-list div:last-child{border-bottom:0}
      .sn54-activity-list i{width:8px;height:8px;border-radius:50%;background:#60A5FA;flex:0 0 auto}
      .sn54-coach{margin-top:14px;padding:16px 18px;border-radius:18px;background:#EFF6FF;border:1px solid #D7E6FF}
      .sn54-coach span{font-size:11px;font-weight:800;letter-spacing:.1em;color:#2563EB}
      .sn54-coach p{margin:6px 0 0;font-weight:700;line-height:1.45}

      @media(max-width:640px){
        .sn54-rest-card .plan-grid{grid-template-columns:minmax(0,1fr) 150px}
        .sn54-rest-art{min-height:160px;margin:-8px -10px -8px -8px}
        .sn54-rest-art svg{width:190px;max-width:150%}
        .sn54-rest-hero{padding:20px 16px}
        .sn54-rest-hero svg{width:220px;max-width:82%}
        .sn54-rest-top h1{font-size:26px}
      }
    `;
    document.head.appendChild(style);
  }

  function patchHomeRestState() {
    if (!isRestToday()) return;
    const plan = document.querySelector(".plan-card");
    if (!plan) return;
    const next = nextScheduledWorkout();

    plan.classList.add("sn54-rest-card");
    plan.innerHTML = `
      <div class="sn54-rest-kicker">TODAY’S PLAN</div>
      <div class="plan-grid">
        <div>
          <h2>Rest Day</h2>
          <p class="sn54-rest-copy">Recovery is part of progress.</p>
          <div class="sn54-rest-meta">
            <span>No workout scheduled</span>
            ${next ? `<span>Next: ${esc(next.workout.name)} • ${esc(next.day)}</span>` : `<span>Your next workout is scheduled soon</span>`}
          </div>
        </div>
        <div class="sn54-rest-art">${moonSvg()}</div>
      </div>
      <button class="primary sn54-rest-button" id="sn54ViewRecovery">View Recovery Plan →</button>
    `;

    document.getElementById("sn54ViewRecovery")?.addEventListener("click", () => {
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
      <section class="sn-page sn54-rest-page">
        <div class="sn54-rest-top">
          <button class="icon-btn" id="sn54Back">←</button>
          <div><span>RECOVERY</span><h1>Rest Day</h1></div>
        </div>

        <section class="card sn54-rest-hero">
          ${moonSvg()}
          <h2>Today is a recovery day</h2>
          <p>Taking a rest day gives your body time to recover and helps you stay consistent for your next training session.</p>
          ${next ? `<div class="sn54-rest-meta" style="justify-content:center"><span>Next workout: ${esc(next.workout.name)} • ${esc(next.day)}</span></div>` : ""}
        </section>

        <section class="card sn54-section">
          <h3>Recovery focus</h3>
          <div class="sn54-recovery-grid">
            <div class="sn54-recovery-item"><strong>Recover</strong><span>Give trained muscles time away from hard lifting.</span></div>
            <div class="sn54-recovery-item"><strong>Sleep</strong><span>Aim for a regular, full night of sleep.</span></div>
            <div class="sn54-recovery-item"><strong>Hydrate</strong><span>Drink normally through the day and with meals.</span></div>
            <div class="sn54-recovery-item"><strong>Eat well</strong><span>Keep regular balanced meals that support recovery.</span></div>
          </div>
        </section>

        <section class="card sn54-section">
          <h3>Optional light activity</h3>
          <div class="sn54-activity-list">
            <div><i></i><span>Easy walk</span></div>
            <div><i></i><span>Gentle stretching</span></div>
            <div><i></i><span>Light mobility</span></div>
            <div><i></i><span>Easy everyday movement</span></div>
          </div>
        </section>

        <div class="sn54-coach">
          <span>COACH CUE</span>
          <p>Consistency includes rest. Recover well so you can return ready for your next session.</p>
        </div>
      </section>
    `;

    document.getElementById("sn54Back")?.addEventListener("click", () => {
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
    version: "v54",
    isRestToday,
    todayScheduledWorkout,
    nextScheduledWorkout,
    render: renderRestDay
  };

  queueMicrotask(() => {
    if (state?.page === "home") patchHomeRestState();
  });
})();
