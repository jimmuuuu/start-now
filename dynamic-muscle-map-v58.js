// START/NOW v58 — polished, compact, data-driven front/back SVG muscle map.
(() => {
  const COLORS = {
    primary: "#3B82F6",
    primaryStroke: "#2563EB",
    secondary: "#BFD8FF",
    secondaryStroke: "#7FB3FF",
    inactive: "#E9EEF4",
    inactiveStroke: "#CCD5DF",
    shell: "#F8FAFC",
    shellStroke: "#B5C0CC",
    detail: "#A8B4C2"
  };

  const ZONES = {
    chest: "Chest",
    shoulders: "Shoulders",
    rearDelts: "Rear Delts",
    traps: "Traps",
    back: "Back",
    lowerBack: "Lower Back",
    biceps: "Biceps",
    triceps: "Triceps",
    core: "Core",
    quads: "Quads",
    hamstrings: "Hamstrings",
    glutes: "Glutes",
    calves: "Calves"
  };

  function esc(value) {
    if (typeof escapeHtml === "function") return escapeHtml(value);
    return String(value ?? "").replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[ch]));
  }

  function focusEngine() {
    return window.START_NOW_MUSCLE_MAP;
  }

  function muscleState(focus, muscle, fallbackMuscle = null) {
    if (focus?.primary?.includes(muscle)) return "primary";
    if (focus?.secondary?.includes(muscle)) return "secondary";
    if (fallbackMuscle) {
      if (focus?.primary?.includes(fallbackMuscle)) return "primary";
      if (focus?.secondary?.includes(fallbackMuscle)) return "secondary";
    }
    return "inactive";
  }

  function muscleAttrs(focus, zone, fallbackMuscle = null) {
    const muscle = ZONES[zone];
    const state = muscleState(focus, muscle, fallbackMuscle);
    const fill = COLORS[state];
    const stroke = COLORS[`${state}Stroke`];
    const label = state === "primary" ? "Primary muscle" : state === "secondary" ? "Secondary muscle" : "Not targeted";
    return `class="sn58-muscle sn58-${state}" fill="${fill}" stroke="${stroke}" data-muscle="${esc(muscle)}" data-level="${esc(label)}" tabindex="0" role="button" aria-label="${esc(muscle)} — ${esc(label)}"`;
  }

  function displayTitle(focus) {
    const primary = focus?.primary || [];
    const secondary = focus?.secondary || [];
    const all = [...primary, ...secondary];
    if (!all.length) return "Muscle Focus";
    if (all.length > 4) return "Full Body Focus";
    if (all.length === 1) return all[0];
    if (all.length === 2) return `${all[0]} & ${all[1]}`;
    return `${all.slice(0, -1).join(", ")} & ${all.at(-1)}`;
  }

  function frontBody(focus) {
    const z = (zone, fallback) => muscleAttrs(focus, zone, fallback);
    return `
      <g class="sn58-figure" transform="translate(28 20)">
        <text x="108" y="10" text-anchor="middle" class="sn58-view-label">FRONT</text>

        <g class="sn58-shell">
          <ellipse cx="108" cy="34" rx="22" ry="25"/>
          <path d="M95 58 C91 62 88 69 87 77 L79 132 C77 145 79 153 85 156 C91 159 96 154 98 145 L102 111 L100 171 L91 223 C89 240 91 253 95 267 C98 276 102 281 108 281 C114 281 118 276 121 267 C125 253 127 240 125 223 L116 171 L114 111 L118 145 C120 154 125 159 131 156 C137 153 139 145 137 132 L129 77 C128 69 125 62 121 58 C114 54 102 54 95 58 Z"/>
          <path d="M91 66 C79 73 70 90 65 112 C62 126 64 139 71 147 C75 151 80 151 84 146 L92 117"/>
          <path d="M125 66 C137 73 146 90 151 112 C154 126 152 139 145 147 C141 151 136 151 132 146 L124 117"/>
        </g>

        <path ${z("shoulders")} d="M82 68 C86 59 94 57 100 62 C100 73 94 81 84 83 C78 79 77 73 82 68 Z"/>
        <path ${z("shoulders")} d="M134 68 C130 59 122 57 116 62 C116 73 122 81 132 83 C138 79 139 73 134 68 Z"/>

        <path ${z("chest")} d="M94 70 C99 65 104 65 108 69 L108 101 C97 102 89 97 86 87 C87 79 89 74 94 70 Z"/>
        <path ${z("chest")} d="M122 70 C117 65 112 65 108 69 L108 101 C119 102 127 97 130 87 C129 79 127 74 122 70 Z"/>
        <path class="sn58-anatomy-line" d="M108 70 V101 M88 88 C99 92 117 92 128 88"/>

        <path ${z("biceps")} d="M70 103 C76 98 82 103 84 113 L81 139 C78 149 71 151 67 141 C64 128 65 112 70 103 Z"/>
        <path ${z("biceps")} d="M146 103 C140 98 134 103 132 113 L135 139 C138 149 145 151 149 141 C152 128 151 112 146 103 Z"/>

        <g ${z("core")}>
          <path d="M98 105 C102 101 106 102 108 106 C110 102 114 101 118 105 L117 158 C113 164 110 165 108 161 C106 165 103 164 99 158 Z"/>
          <path d="M99 112 H107 V125 H99 Z M109 112 H117 V125 H109 Z M99 128 H107 V141 H99 Z M109 128 H117 V141 H109 Z M100 144 H107 V156 H100 Z M109 144 H116 V156 H109 Z" opacity=".88"/>
        </g>

        <path ${z("quads")} d="M91 177 C96 170 103 172 106 181 L103 224 C100 239 93 242 88 231 L86 205 Z"/>
        <path ${z("quads")} d="M125 177 C120 170 113 172 110 181 L113 224 C116 239 123 242 128 231 L130 205 Z"/>
        <path class="sn58-anatomy-line" d="M94 183 C100 197 100 216 96 232 M122 183 C116 197 116 216 120 232"/>

        <path ${z("calves")} d="M89 232 C94 226 101 228 103 238 L101 267 C98 276 92 278 89 269 L86 249 Z"/>
        <path ${z("calves")} d="M127 232 C122 226 115 228 113 238 L115 267 C118 276 124 278 127 269 L130 249 Z"/>
      </g>`;
  }

  function backBody(focus) {
    const z = (zone, fallback) => muscleAttrs(focus, zone, fallback);
    return `
      <g class="sn58-figure" transform="translate(286 20)">
        <text x="108" y="10" text-anchor="middle" class="sn58-view-label">BACK</text>

        <g class="sn58-shell">
          <ellipse cx="108" cy="34" rx="22" ry="25"/>
          <path d="M95 58 C91 62 88 69 87 77 L79 132 C77 145 79 153 85 156 C91 159 96 154 98 145 L102 111 L100 171 L91 223 C89 240 91 253 95 267 C98 276 102 281 108 281 C114 281 118 276 121 267 C125 253 127 240 125 223 L116 171 L114 111 L118 145 C120 154 125 159 131 156 C137 153 139 145 137 132 L129 77 C128 69 125 62 121 58 C114 54 102 54 95 58 Z"/>
          <path d="M91 66 C79 73 70 90 65 112 C62 126 64 139 71 147 C75 151 80 151 84 146 L92 117"/>
          <path d="M125 66 C137 73 146 90 151 112 C154 126 152 139 145 147 C141 151 136 151 132 146 L124 117"/>
        </g>

        <path ${z("traps")} d="M96 58 C101 53 105 55 108 62 C111 55 115 53 120 58 L128 77 C124 88 117 94 108 97 C99 94 92 88 88 77 Z"/>

        <path ${z("rearDelts", "Shoulders")} d="M82 68 C86 59 94 57 100 62 C100 73 94 81 84 83 C78 79 77 73 82 68 Z"/>
        <path ${z("rearDelts", "Shoulders")} d="M134 68 C130 59 122 57 116 62 C116 73 122 81 132 83 C138 79 139 73 134 68 Z"/>

        <path ${z("back")} d="M94 78 C98 73 103 73 108 78 C113 73 118 73 122 78 L121 108 C118 119 113 127 108 132 C103 127 98 119 95 108 Z"/>
        <path ${z("back")} d="M91 92 C84 97 81 108 82 119 L86 145 C94 147 101 139 104 128 L102 103 C99 96 95 92 91 92 Z"/>
        <path ${z("back")} d="M125 92 C132 97 135 108 134 119 L130 145 C122 147 115 139 112 128 L114 103 C117 96 121 92 125 92 Z"/>
        <path class="sn58-anatomy-line" d="M108 78 V139 M91 99 C98 104 101 111 103 122 M125 99 C118 104 115 111 113 122"/>

        <path ${z("triceps")} d="M70 103 C76 98 82 103 84 113 L81 139 C78 149 71 151 67 141 C64 128 65 112 70 103 Z"/>
        <path ${z("triceps")} d="M146 103 C140 98 134 103 132 113 L135 139 C138 149 145 151 149 141 C152 128 151 112 146 103 Z"/>

        <path ${z("lowerBack")} d="M99 132 C102 128 106 129 108 133 C110 129 114 128 117 132 L118 158 C115 165 112 169 108 169 C104 169 101 165 98 158 Z"/>
        <path class="sn58-anatomy-line" d="M108 134 V165"/>

        <path ${z("glutes")} d="M92 161 C97 155 104 155 108 160 C112 155 119 155 124 161 L123 181 C119 190 113 194 108 194 C103 194 97 190 93 181 Z"/>
        <path class="sn58-anatomy-line" d="M108 161 V193"/>

        <path ${z("hamstrings")} d="M91 188 C96 183 103 185 106 194 L103 228 C100 239 93 241 88 231 L87 209 Z"/>
        <path ${z("hamstrings")} d="M125 188 C120 183 113 185 110 194 L113 228 C116 239 123 241 128 231 L129 209 Z"/>
        <path class="sn58-anatomy-line" d="M95 194 C99 206 99 217 96 229 M121 194 C117 206 117 217 120 229"/>

        <path ${z("calves")} d="M89 232 C94 226 101 228 103 238 L101 267 C98 276 92 278 89 269 L86 249 Z"/>
        <path ${z("calves")} d="M127 232 C122 226 115 228 113 238 L115 267 C118 276 124 278 127 269 L130 249 Z"/>
      </g>`;
  }

  function muscleSvg(focus) {
    return `<svg class="sn58-svg" viewBox="0 0 520 320" role="img" aria-label="Front and back muscles trained today">
      <defs>
        <filter id="sn58Shadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="#0F172A" flood-opacity=".07"/>
        </filter>
      </defs>
      ${frontBody(focus)}
      ${backBody(focus)}
    </svg>`;
  }

  function chips(focus) {
    const primary = focus?.primary || [];
    const secondary = focus?.secondary || [];
    return [...primary.map(m => ({ muscle: m, level: "Primary" })), ...secondary.map(m => ({ muscle: m, level: "Secondary" }))]
      .map(item => `<span class="sn58-chip ${item.level.toLowerCase()}"><span class="sn58-chip-dot"></span><strong>${esc(item.muscle)}</strong><small>${item.level}</small></span>`)
      .join("");
  }

  function installStyles() {
    if (document.getElementById("sn58-muscle-styles")) return;
    const style = document.createElement("style");
    style.id = "sn58-muscle-styles";
    style.textContent = `
      .sn58-muscle-card{padding:18px!important;overflow:visible!important}
      .sn58-muscle-card .section-head{margin:0 0 7px!important;align-items:center!important}
      .sn58-kicker{font-size:11px;font-weight:850;letter-spacing:.12em;text-transform:uppercase;color:#2563EB}
      .sn58-manage{font-size:13px;font-weight:750;color:#2563EB;text-decoration:none}
      .sn58-title{margin:0;font-size:22px;line-height:1.14;letter-spacing:-.035em;color:var(--text,#111827)}
      .sn58-subtitle{margin:5px 0 12px;color:var(--muted,#6B7280);font-size:13px;line-height:1.4}
      .sn58-panel{border:1px solid #E6EDF5;border-radius:20px;background:linear-gradient(180deg,#FCFDFF 0%,#F7FAFE 100%);padding:10px 10px 11px;box-shadow:inset 0 1px 0 rgba(255,255,255,.95)}
      .sn58-stage{position:relative;height:250px;display:flex;align-items:center;justify-content:center;overflow:hidden}
      .sn58-svg{display:block;width:100%;max-width:500px;height:100%;overflow:visible}
      .sn58-shell{fill:${COLORS.shell};stroke:${COLORS.shellStroke};stroke-width:1.7;stroke-linejoin:round;stroke-linecap:round;filter:url(#sn58Shadow)}
      .sn58-view-label{font:800 9.5px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:.16em;fill:#94A3B8}
      .sn58-muscle{stroke-width:1.1;stroke-linejoin:round;cursor:pointer;transition:filter .15s ease,opacity .15s ease,stroke-width .15s ease}
      .sn58-muscle:hover,.sn58-muscle:focus{filter:brightness(1.02);stroke-width:1.7;outline:none}
      .sn58-inactive{opacity:.9}
      .sn58-anatomy-line{fill:none;stroke:${COLORS.detail};stroke-width:1;stroke-linecap:round;opacity:.68;pointer-events:none}
      .sn58-tooltip{position:absolute;left:50%;bottom:5px;transform:translate(-50%,4px);min-width:116px;padding:8px 10px;border-radius:11px;background:rgba(15,23,42,.94);color:#fff;text-align:center;font-size:11px;line-height:1.15;box-shadow:0 10px 25px rgba(15,23,42,.16);opacity:0;pointer-events:none;transition:.14s ease;z-index:3}
      .sn58-tooltip.show{opacity:1;transform:translate(-50%,0)}
      .sn58-tooltip strong{display:block;font-size:12px;margin-bottom:2px}
      .sn58-legend{display:flex;align-items:center;justify-content:center;gap:13px;flex-wrap:wrap;padding:7px 3px 1px;color:#64748B;font-size:11px}
      .sn58-legend span{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
      .sn58-legend i{width:8px;height:8px;border-radius:999px;display:inline-block;border:1px solid ${COLORS.inactiveStroke};background:${COLORS.inactive}}
      .sn58-legend .primary i{background:${COLORS.primary};border-color:${COLORS.primaryStroke}}
      .sn58-legend .secondary i{background:${COLORS.secondary};border-color:${COLORS.secondaryStroke}}
      .sn58-chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}
      .sn58-chip{display:inline-flex;align-items:center;gap:6px;min-height:32px;padding:7px 10px;border-radius:999px;background:#fff;border:1px solid #E5EBF2;box-shadow:0 1px 2px rgba(15,23,42,.025)}
      .sn58-chip.primary{background:#F2F7FF;border-color:#C9DCFF}
      .sn58-chip-dot{width:7px;height:7px;border-radius:50%;background:${COLORS.secondary};border:1px solid ${COLORS.secondaryStroke};flex:0 0 auto}
      .sn58-chip.primary .sn58-chip-dot{background:${COLORS.primary};border-color:${COLORS.primaryStroke}}
      .sn58-chip strong{font-size:12.5px;color:var(--text,#111827)}
      .sn58-chip small{font-size:11px;color:#718096}
      .dark .sn58-panel{background:linear-gradient(180deg,#171B20,#14171B);border-color:#2A3038}
      .dark .sn58-chip{background:#171B20;border-color:#2B3138}
      .dark .sn58-chip.primary{background:#172338;border-color:#274A80}
      @media(min-width:700px){
        .sn58-stage{height:275px}
        .sn58-panel{padding:12px 14px}
        .sn58-svg{max-width:520px}
      }
      @media(max-width:390px){
        .sn58-muscle-card{padding:16px!important}
        .sn58-title{font-size:20px}
        .sn58-stage{height:232px;margin:0 -3px}
        .sn58-panel{padding:8px 7px 10px}
        .sn58-legend{gap:9px;font-size:10.5px}
        .sn58-chip{padding:6px 8px}
        .sn58-chip strong{font-size:12px}
      }
    `;
    document.head.appendChild(style);
  }

  function findCard() {
    return document.querySelector(".sn51-muscle-card") || [...document.querySelectorAll(".section-card")].find(card => /muscle\s*focus/i.test(card.textContent || ""));
  }

  function bindTooltip(card) {
    const tooltip = card.querySelector(".sn58-tooltip");
    if (!tooltip) return;
    const show = zone => {
      tooltip.innerHTML = `<strong>${esc(zone.dataset.muscle)}</strong><span>${esc(zone.dataset.level)}</span>`;
      tooltip.classList.add("show");
    };
    const hide = () => tooltip.classList.remove("show");
    card.querySelectorAll(".sn58-muscle").forEach(zone => {
      zone.addEventListener("mouseenter", () => show(zone));
      zone.addEventListener("mouseleave", hide);
      zone.addEventListener("focus", () => show(zone));
      zone.addEventListener("blur", hide);
      zone.addEventListener("click", event => {
        event.stopPropagation();
        show(zone);
      });
    });
  }

  function renderMuscleFocus() {
    installStyles();
    const engine = focusEngine();
    if (!engine?.buildFocus || typeof getTodayWorkout !== "function") return;
    const workout = getTodayWorkout();
    const card = findCard();
    if (!workout || !card) return;

    const focus = engine.buildFocus(workout);
    card.className = `${card.className.replace(/\bsn52-muscle-card\b/g, "").replace(/\bsn58-muscle-card\b/g, "").trim()} sn58-muscle-card`;
    card.innerHTML = `
      <div class="section-head">
        <strong class="sn58-kicker">Muscle Focus</strong>
        <a href="#" class="sn58-manage">Manage plan →</a>
      </div>
      <h3 class="sn58-title">${esc(displayTitle(focus))}</h3>
      <p class="sn58-subtitle">Primary muscles trained in today’s workout</p>
      <div class="sn58-panel">
        <div class="sn58-stage">
          ${muscleSvg(focus)}
          <div class="sn58-tooltip" role="status" aria-live="polite"></div>
        </div>
        <div class="sn58-legend" aria-label="Muscle highlight legend">
          <span class="primary"><i></i>Primary</span>
          <span class="secondary"><i></i>Secondary</span>
          <span><i></i>Not targeted</span>
        </div>
        <div class="sn58-chips">${chips(focus)}</div>
      </div>`;

    card.querySelector(".sn58-manage")?.addEventListener("click", event => {
      event.preventDefault();
      if (typeof state !== "undefined") state.page = "workouts";
      if (typeof render === "function") render();
    });
    bindTooltip(card);
  }

  installStyles();

  if (typeof renderHome === "function") {
    const previousRenderHome = renderHome;
    window.renderHome = function(...args) {
      const result = previousRenderHome.apply(this, args);
      renderMuscleFocus();
      return result;
    };
  }

  window.START_NOW_MUSCLE_PRESENTATION = {
    version: "v58",
    render: renderMuscleFocus
  };

  queueMicrotask(renderMuscleFocus);
})();
