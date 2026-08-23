// START/NOW v52 — compact premium muscle-focus presentation built on the v51 data model.
(() => {
  const ENGINE = () => window.START_NOW_MUSCLE_MAP;
  const COLORS = {
    primary: "#3B82F6",
    primaryStroke: "#2563EB",
    secondary: "#BFDBFE",
    secondaryStroke: "#7FB3FF",
    inactive: "#E8EDF3",
    inactiveStroke: "#C7D1DB",
    body: "#F8FAFC",
    bodyStroke: "#A9B4C0"
  };

  const ZONE_TO_MUSCLE = {
    chest: "Chest",
    delts: "Shoulders",
    rearDelts: "Rear Delts",
    traps: "Traps",
    back: "Back",
    lats: "Back",
    lowerBack: "Lower Back",
    biceps: "Biceps",
    triceps: "Triceps",
    abs: "Core",
    quads: "Quads",
    hamstrings: "Hamstrings",
    glutes: "Glutes",
    calves: "Calves"
  };

  function esc(value) {
    if (typeof escapeHtml === "function") return escapeHtml(value);
    return String(value ?? "").replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#39;"}[c]));
  }

  function levelFor(focus, muscle) {
    if (focus.primary?.includes(muscle)) return "primary";
    if (focus.secondary?.includes(muscle)) return "secondary";
    return "inactive";
  }

  function attrs(focus, zone) {
    let muscle = ZONE_TO_MUSCLE[zone];
    let level = levelFor(focus, muscle);
    if (zone === "rearDelts" && level === "inactive") level = levelFor(focus, "Shoulders");
    const fill = COLORS[level];
    const stroke = COLORS[`${level}Stroke`];
    const state = level === "primary" ? "Primary muscle" : level === "secondary" ? "Secondary muscle" : "Not targeted";
    return `fill="${fill}" stroke="${stroke}" data-muscle="${esc(muscle)}" data-level="${state}" class="sn52-zone sn52-${level}" tabindex="0" role="button" aria-label="${esc(muscle)} — ${state}"`;
  }

  function titleFor(focus) {
    const all = [...(focus.primary || []), ...(focus.secondary || [])];
    if (!all.length) return "Full body";
    if (all.length === 1) return all[0];
    if (all.length === 2) return `${all[0]} & ${all[1]}`;
    return `${all.slice(0, -1).join(", ")} & ${all.at(-1)}`;
  }

  function frontSvg(focus) {
    return `<svg class="sn52-body" viewBox="0 0 150 254" role="img" aria-label="Front muscle map">
      <text x="75" y="13" text-anchor="middle" class="sn52-view-label">FRONT</text>
      <g class="sn52-shell">
        <ellipse cx="75" cy="31" rx="15" ry="17" fill="${COLORS.body}" stroke="${COLORS.bodyStroke}" stroke-width="1.7"/>
        <path d="M58 49 C64 44 70 43 75 45 C80 43 86 44 92 49 C101 59 103 74 100 92 L95 132 C93 143 92 157 92 170 L88 229 C86 239 82 244 75 244 C68 244 64 239 62 229 L58 170 C58 157 57 143 55 132 L50 92 C47 74 49 59 58 49 Z" fill="${COLORS.body}" stroke="${COLORS.bodyStroke}" stroke-width="1.7" stroke-linejoin="round"/>
        <path d="M53 58 C45 66 39 80 34 96 C32 104 33 112 38 118 L44 120 C48 116 50 111 51 103 L59 68" fill="${COLORS.body}" stroke="${COLORS.bodyStroke}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M97 58 C105 66 111 80 116 96 C118 104 117 112 112 118 L106 120 C102 116 100 111 99 103 L91 68" fill="${COLORS.body}" stroke="${COLORS.bodyStroke}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <path ${attrs(focus,"chest")} d="M57 58 C62 52 69 51 75 55 C81 51 88 52 93 58 C92 71 86 79 75 83 C64 79 58 71 57 58 Z"/>
      <path ${attrs(focus,"delts")} d="M49 56 C53 49 60 48 64 53 C63 63 58 69 50 70 C46 66 45 61 49 56 Z"/>
      <path ${attrs(focus,"delts")} d="M101 56 C97 49 90 48 86 53 C87 63 92 69 100 70 C104 66 105 61 101 56 Z"/>
      <path ${attrs(focus,"biceps")} d="M37 91 C42 87 47 90 49 97 C49 107 45 115 39 118 C35 111 34 98 37 91 Z"/>
      <path ${attrs(focus,"biceps")} d="M113 91 C108 87 103 90 101 97 C101 107 105 115 111 118 C115 111 116 98 113 91 Z"/>
      <path ${attrs(focus,"abs")} d="M65 87 C68 84 72 83 75 85 C78 83 82 84 85 87 L83 128 C80 135 78 138 75 138 C72 138 70 135 67 128 Z"/>
      <path d="M67 98 H83 M66 109 H84 M66 120 H84 M75 85 V138" stroke="#94A3B8" stroke-width="1" opacity=".75"/>
      <path ${attrs(focus,"quads")} d="M58 146 C63 141 69 141 72 147 L70 195 C67 205 60 205 57 195 Z"/>
      <path ${attrs(focus,"quads")} d="M78 147 C81 141 87 141 92 146 L93 195 C90 205 83 205 80 195 Z"/>
      <path ${attrs(focus,"calves")} d="M59 197 C63 193 68 193 70 198 L67 230 C64 237 60 237 58 230 Z"/>
      <path ${attrs(focus,"calves")} d="M80 198 C82 193 87 193 91 197 L92 230 C90 237 86 237 83 230 Z"/>
    </svg>`;
  }

  function backSvg(focus) {
    return `<svg class="sn52-body" viewBox="0 0 150 254" role="img" aria-label="Back muscle map">
      <text x="75" y="13" text-anchor="middle" class="sn52-view-label">BACK</text>
      <g class="sn52-shell">
        <ellipse cx="75" cy="31" rx="15" ry="17" fill="${COLORS.body}" stroke="${COLORS.bodyStroke}" stroke-width="1.7"/>
        <path d="M58 49 C64 44 70 43 75 45 C80 43 86 44 92 49 C101 59 103 74 100 92 L95 132 C93 143 92 157 92 170 L88 229 C86 239 82 244 75 244 C68 244 64 239 62 229 L58 170 C58 157 57 143 55 132 L50 92 C47 74 49 59 58 49 Z" fill="${COLORS.body}" stroke="${COLORS.bodyStroke}" stroke-width="1.7" stroke-linejoin="round"/>
        <path d="M53 58 C45 66 39 80 34 96 C32 104 33 112 38 118 L44 120 C48 116 50 111 51 103 L59 68" fill="${COLORS.body}" stroke="${COLORS.bodyStroke}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M97 58 C105 66 111 80 116 96 C118 104 117 112 112 118 L106 120 C102 116 100 111 99 103 L91 68" fill="${COLORS.body}" stroke="${COLORS.bodyStroke}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <path ${attrs(focus,"traps")} d="M64 47 C68 43 72 43 75 47 C78 43 82 43 86 47 L88 58 C84 65 80 69 75 69 C70 69 66 65 62 58 Z"/>
      <path ${attrs(focus,"rearDelts")} d="M49 56 C53 49 60 48 64 53 C63 63 58 69 50 70 C46 66 45 61 49 56 Z"/>
      <path ${attrs(focus,"rearDelts")} d="M101 56 C97 49 90 48 86 53 C87 63 92 69 100 70 C104 66 105 61 101 56 Z"/>
      <path ${attrs(focus,"back")} d="M58 61 C64 56 70 56 75 61 C80 56 86 56 92 61 L90 92 C86 103 81 111 75 115 C69 111 64 103 60 92 Z"/>
      <path ${attrs(focus,"lats")} d="M58 84 C52 87 49 94 49 102 L52 126 C59 129 64 124 68 116 L66 96 C64 90 61 86 58 84 Z"/>
      <path ${attrs(focus,"lats")} d="M92 84 C98 87 101 94 101 102 L98 126 C91 129 86 124 82 116 L84 96 C86 90 89 86 92 84 Z"/>
      <path ${attrs(focus,"triceps")} d="M37 91 C42 87 47 90 49 97 C49 107 45 115 39 118 C35 111 34 98 37 91 Z"/>
      <path ${attrs(focus,"triceps")} d="M113 91 C108 87 103 90 101 97 C101 107 105 115 111 118 C115 111 116 98 113 91 Z"/>
      <path ${attrs(focus,"lowerBack")} d="M68 114 H82 L84 137 C82 143 79 146 75 146 C71 146 68 143 66 137 Z"/>
      <path ${attrs(focus,"glutes")} d="M59 139 C64 134 70 134 75 139 C80 134 86 134 91 139 L90 157 C86 164 81 168 75 168 C69 168 64 164 60 157 Z"/>
      <path ${attrs(focus,"hamstrings")} d="M58 159 C63 155 69 156 72 162 L70 197 C67 206 60 206 57 197 Z"/>
      <path ${attrs(focus,"hamstrings")} d="M78 162 C81 156 87 155 92 159 L93 197 C90 206 83 206 80 197 Z"/>
      <path ${attrs(focus,"calves")} d="M59 197 C63 193 68 193 70 198 L67 230 C64 237 60 237 58 230 Z"/>
      <path ${attrs(focus,"calves")} d="M80 198 C82 193 87 193 91 197 L92 230 C90 237 86 237 83 230 Z"/>
    </svg>`;
  }

  function chips(focus) {
    const all = [...(focus.primary || []), ...(focus.secondary || [])];
    return all.map(muscle => {
      const primary = focus.primary.includes(muscle);
      return `<span class="sn52-chip ${primary ? "primary" : "secondary"}"><strong>${esc(muscle)}</strong><small>${primary ? "Primary" : "Secondary"}</small></span>`;
    }).join("");
  }

  function installStyles() {
    if (document.getElementById("sn52-muscle-styles")) return;
    const style = document.createElement("style");
    style.id = "sn52-muscle-styles";
    style.textContent = `
      .sn51-muscle-card.sn52-muscle-card{padding:17px 17px 15px!important;min-height:0!important}
      .sn52-muscle-card .section-head{margin:0 0 7px;align-items:center}
      .sn52-kicker{font-size:11px;font-weight:850;letter-spacing:.12em;text-transform:uppercase;color:#2563EB}
      .sn52-manage{font-size:13px;font-weight:700;color:#2563EB;text-decoration:none}
      .sn52-title{margin:0;font-size:21px;line-height:1.16;letter-spacing:-.02em;color:#111827}
      .sn52-sub{margin:4px 0 11px;font-size:13px;line-height:1.35;color:#718096}
      .sn52-panel{border:1px solid #E7EDF4;border-radius:18px;background:linear-gradient(180deg,#FCFDFF,#F8FAFD);padding:10px 11px 9px;box-shadow:inset 0 1px 0 rgba(255,255,255,.9)}
      .sn52-stage{position:relative}
      .sn52-bodies{display:grid;grid-template-columns:1fr 1fr;align-items:end;gap:4px;max-width:300px;margin:0 auto}
      .sn52-body{display:block;width:100%;max-width:132px;height:auto;margin:0 auto;overflow:visible}
      .sn52-view-label{font:800 9.5px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:.15em;fill:#94A3B8}
      .sn52-zone{cursor:pointer;transition:filter .14s ease,transform .14s ease,opacity .14s ease;stroke-width:1.15}
      .sn52-zone:hover,.sn52-zone:focus{filter:brightness(1.03);transform:translateY(-.5px);outline:none}
      .sn52-inactive{opacity:.86}
      .sn52-tooltip{position:absolute;left:50%;bottom:4px;transform:translateX(-50%) translateY(3px);opacity:0;pointer-events:none;background:rgba(15,23,42,.94);color:#fff;border-radius:10px;padding:7px 9px;min-width:108px;text-align:center;box-shadow:0 8px 22px rgba(15,23,42,.15);transition:.14s ease;font-size:11px;line-height:1.2}
      .sn52-tooltip.show{opacity:1;transform:translateX(-50%) translateY(0)}
      .sn52-tooltip strong{display:block;font-size:12px;margin-bottom:1px}
      .sn52-legend{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-top:5px;color:#64748B;font-size:11px}
      .sn52-legend span{display:inline-flex;align-items:center;gap:5px}
      .sn52-legend i{width:8px;height:8px;border-radius:50%;background:#E8EDF3;border:1px solid #C7D1DB}
      .sn52-legend .p i{background:#3B82F6;border-color:#2563EB}.sn52-legend .s i{background:#BFDBFE;border-color:#7FB3FF}
      .sn52-chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:9px}
      .sn52-chip{display:inline-flex;align-items:center;gap:7px;border-radius:999px;padding:7px 9px;border:1px solid #E4EAF1;background:#fff;box-shadow:0 1px 2px rgba(15,23,42,.025)}
      .sn52-chip.primary{background:#F2F7FF;border-color:#CFE2FF}.sn52-chip.secondary{background:#FAFCFF}
      .sn52-chip strong{font-size:12px;color:#111827}.sn52-chip small{font-size:11px;color:#718096}
      @media(max-width:640px){.sn51-muscle-card.sn52-muscle-card{padding:15px 15px 13px!important}.sn52-title{font-size:19px}.sn52-panel{padding:8px 9px 8px}.sn52-bodies{max-width:268px}.sn52-body{max-width:118px}.sn52-legend{gap:9px;font-size:10.5px}.sn52-chip{padding:6px 8px}}
    `;
    document.head.appendChild(style);
  }

  function findCard() {
    return [...document.querySelectorAll(".section-card,.card")].find(card => /muscle focus/i.test(card.textContent || ""));
  }

  function bindTooltip(card) {
    const tooltip = card.querySelector(".sn52-tooltip");
    if (!tooltip) return;
    const show = zone => {
      tooltip.innerHTML = `<strong>${esc(zone.dataset.muscle)}</strong>${esc(zone.dataset.level)}`;
      tooltip.classList.add("show");
    };
    const hide = () => tooltip.classList.remove("show");
    card.querySelectorAll(".sn52-zone").forEach(zone => {
      zone.addEventListener("mouseenter", () => show(zone));
      zone.addEventListener("focus", () => show(zone));
      zone.addEventListener("click", () => show(zone));
      zone.addEventListener("mouseleave", hide);
      zone.addEventListener("blur", hide);
    });
  }

  function enhance() {
    installStyles();
    const engine = ENGINE();
    if (!engine?.buildFocus || typeof getTodayWorkout !== "function") return;
    const card = findCard();
    if (!card) return;
    const workout = getTodayWorkout();
    if (!workout) return;
    const focus = engine.buildFocus(workout);

    card.classList.add("sn52-muscle-card");
    card.innerHTML = `
      <div class="section-head"><strong class="sn52-kicker">Muscle Focus</strong><a href="#" class="sn52-manage">Manage plan →</a></div>
      <h3 class="sn52-title">${esc(titleFor(focus))}</h3>
      <p class="sn52-sub">Muscles trained in today’s workout</p>
      <div class="sn52-panel">
        <div class="sn52-stage"><div class="sn52-bodies">${frontSvg(focus)}${backSvg(focus)}</div><div class="sn52-tooltip" role="status" aria-live="polite"></div></div>
        <div class="sn52-legend"><span class="p"><i></i>Primary</span><span class="s"><i></i>Secondary</span><span><i></i>Not targeted</span></div>
        <div class="sn52-chips">${chips(focus)}</div>
      </div>`;

    card.querySelector(".sn52-manage")?.addEventListener("click", event => {
      event.preventDefault();
      if (typeof state !== "undefined") state.page = "workouts";
      if (typeof render === "function") render();
    });
    bindTooltip(card);
  }

  installStyles();
  if (typeof renderHome === "function") {
    const previous = renderHome;
    window.renderHome = function(...args) {
      const result = previous.apply(this, args);
      enhance();
      return result;
    };
  }
  window.START_NOW_MUSCLE_MAP_V52 = { render: enhance };
  queueMicrotask(enhance);
})();