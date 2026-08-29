// START/NOW v51 — polished, data-driven front/back SVG muscle map.
(() => {
  const MUSCLE_ORDER = [
    "Chest", "Shoulders", "Rear Delts", "Back", "Traps", "Biceps", "Triceps", "Forearms",
    "Core", "Lower Back", "Quads", "Adductors", "Hamstrings", "Glutes", "Calves"
  ];

  const ZONE_LABELS = {
    chest: "Chest",
    "front-delts": "Shoulders",
    "rear-delts": "Rear Delts",
    traps: "Traps",
    "upper-back": "Back",
    lats: "Back",
    "lower-back": "Lower Back",
    biceps: "Biceps",
    triceps: "Triceps",
    forearms: "Forearms",
    abs: "Core",
    obliques: "Core",
    quads: "Quads",
    adductors: "Adductors",
    hamstrings: "Hamstrings",
    glutes: "Glutes",
    calves: "Calves"
  };

  function esc(value) {
    if (typeof escapeHtml === "function") return escapeHtml(value);
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function canonicalMuscle(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return null;
    if (raw.includes("rear delt")) return "Rear Delts";
    if (raw.includes("shoulder") || raw.includes("delt")) return "Shoulders";
    if (raw.includes("chest") || raw.includes("pec")) return "Chest";
    if (raw === "back" || raw.includes("lat")) return "Back";
    if (raw.includes("trap")) return "Traps";
    if (raw.includes("bicep")) return "Biceps";
    if (raw.includes("tricep")) return "Triceps";
    if (raw.includes("forearm")) return "Forearms";
    if (raw.includes("core") || raw.includes("ab")) return "Core";
    if (raw.includes("lower back")) return "Lower Back";
    if (raw.includes("quad")) return "Quads";
    if (raw.includes("adductor") || raw.includes("groin") || raw.includes("inner thigh")) return "Adductors";
    if (raw.includes("hamstring")) return "Hamstrings";
    if (raw.includes("glute")) return "Glutes";
    if (raw.includes("calf") || raw.includes("calves")) return "Calves";
    if (raw === "legs" || raw.includes("leg")) return "Legs";
    if (raw.includes("full body")) return "Full Body";
    return String(value || "").trim();
  }

  function directMuscles(exercise) {
    const declared = canonicalMuscle(exercise?.muscleGroups?.primary);
    if (declared && declared !== "Legs" && declared !== "Full Body") return [declared];
    const name = String(exercise?.name || "").toLowerCase();
    const base = declared || canonicalMuscle(exercise?.muscle);

    if (/romanian deadlift|stiff[- ]leg|good morning|nordic|leg curl/.test(name)) return ["Hamstrings"];
    if (/hip adduction|adductor|inner thigh|groin/.test(name)) return ["Adductors"];
    if (/hip thrust|glute bridge|glute drive|glute kickback|donkey kick|fire hydrant|frog pump|hip abduction|lateral band walk/.test(name)) return ["Glutes"];
    if (/leg press|hack squat|pendulum squat|front squat|goblet squat|split squat|bulgarian|step[- ]?up|step[- ]?down|lunge|squat/.test(name)) return ["Quads", "Glutes"];
    if (/calf raise|calf press/.test(name)) return ["Calves"];
    if (/tibialis/.test(name)) return ["Calves"];
    if (/rear delt|reverse fly|face pull/.test(name)) return ["Rear Delts"];
    if (/shrug|trap bar shrug/.test(name)) return ["Traps"];
    if (/carry|farmer|suitcase/.test(name) && base === "Traps") return ["Traps"];
    if (/wood chop|pallof|plank|crunch|sit[- ]?up|hollow|v[- ]?up|toe touch|bird dog|ab wheel/.test(name)) return ["Core"];
    if (base === "Legs") return ["Quads", "Glutes"];
    if (base === "Full Body") return ["Chest", "Back", "Quads", "Glutes", "Core"];
    return base ? [base] : [];
  }

  function secondaryMuscles(exercise, direct) {
    if (Array.isArray(exercise?.muscleGroups?.secondary)) {
      return exercise.muscleGroups.secondary.map(canonicalMuscle).filter(muscle => muscle && !direct.includes(muscle));
    }
    const name = String(exercise?.name || "").toLowerCase();
    const out = new Set();
    const has = value => direct.includes(value);

    if (has("Chest") && /press|push[- ]?up|dip/.test(name)) {
      out.add("Shoulders");
      out.add("Triceps");
    }
    if (has("Shoulders") && /press|pike/.test(name)) out.add("Triceps");
    if (has("Back") && /row|pulldown|pull[- ]?up|chin[- ]?up/.test(name)) {
      out.add("Biceps");
      if (/row/.test(name)) out.add("Rear Delts");
    }
    if (has("Rear Delts") && /face pull|row|reverse fly/.test(name)) out.add("Back");
    if (has("Quads") && /squat|leg press|lunge|split|step/.test(name)) out.add("Glutes");
    if (has("Hamstrings") && /deadlift|good morning|curl/.test(name)) out.add("Glutes");
    if (has("Glutes") && /hip thrust|bridge|kickback/.test(name)) out.add("Hamstrings");
    if (has("Core") && /carry|pallof|wood chop/.test(name)) out.add("Lower Back");

    direct.forEach(muscle => out.delete(muscle));
    return [...out];
  }

  function buildFocus(workout) {
    const directCounts = new Map();
    const secondaryCounts = new Map();

    for (const exercise of workout?.exercises || []) {
      const direct = directMuscles(exercise).filter(m => MUSCLE_ORDER.includes(m));
      direct.forEach(muscle => directCounts.set(muscle, (directCounts.get(muscle) || 0) + 1));
      secondaryMuscles(exercise, direct)
        .filter(m => MUSCLE_ORDER.includes(m))
        .forEach(muscle => secondaryCounts.set(muscle, (secondaryCounts.get(muscle) || 0) + 1));
    }

    if (!directCounts.size) {
      return { primary: ["Core"], secondary: [], all: ["Core"] };
    }

    const maxDirect = Math.max(...directCounts.values());
    const primary = MUSCLE_ORDER.filter(m => directCounts.get(m) === maxDirect);
    const secondary = MUSCLE_ORDER.filter(m =>
      !primary.includes(m) && (directCounts.has(m) || secondaryCounts.has(m))
    );
    return { primary, secondary, all: [...primary, ...secondary] };
  }

  function levelForMuscle(focus, muscle) {
    if (focus.primary.includes(muscle)) return "primary";
    if (focus.secondary.includes(muscle)) return "secondary";
    return "inactive";
  }

  function levelForZone(focus, zone) {
    const muscle = ZONE_LABELS[zone];
    if (zone === "rear-delts") {
      if (focus.primary.includes("Rear Delts")) return "primary";
      if (focus.secondary.includes("Rear Delts")) return "secondary";
      if (focus.primary.includes("Shoulders")) return "primary";
      if (focus.secondary.includes("Shoulders")) return "secondary";
      return "inactive";
    }
    return levelForMuscle(focus, muscle);
  }

  function formatMuscles(list) {
    const values = list.filter(Boolean);
    if (!values.length) return "Full body";
    if (values.length === 1) return values[0];
    if (values.length === 2) return `${values[0]} & ${values[1]}`;
    return `${values.slice(0, -1).join(", ")} & ${values[values.length - 1]}`;
  }

  function zoneAttrs(focus, zone) {
    const level = levelForZone(focus, zone);
    const muscle = ZONE_LABELS[zone];
    const status = level === "primary" ? "Primary muscle" : level === "secondary" ? "Secondary muscle" : "Not targeted";
    return `class="sn51-zone" data-muscle="${esc(muscle)}" data-level="${level}" tabindex="0" role="button" aria-label="${esc(muscle)}, ${status}"`;
  }

  function svgMarkup(focus) {
    return `
      <svg class="sn51-svg" viewBox="0 0 500 390" role="img" aria-label="Front and back muscle map">
        <defs>
          <filter id="sn51-shadow" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="7" stdDeviation="7" flood-color="#0F172A" flood-opacity=".08"/>
          </filter>
        </defs>

        <g class="sn51-model" transform="translate(20 10)">
          <text class="sn51-view-label" x="105" y="15" text-anchor="middle">FRONT</text>
          <g filter="url(#sn51-shadow)">
            <ellipse class="sn51-body" cx="105" cy="48" rx="23" ry="27"/>
            <path class="sn51-body" d="M91 72 C81 77 72 86 67 101 L58 154 C56 166 59 174 67 177 C75 180 80 174 82 164 L88 122 L92 184 L82 246 C80 263 82 289 87 342 C88 356 95 365 105 365 C115 365 122 356 123 342 C128 289 130 263 128 246 L118 184 L122 122 L128 164 C130 174 135 180 143 177 C151 174 154 166 152 154 L143 101 C138 86 129 77 119 72 C111 69 99 69 91 72 Z"/>
            <path class="sn51-body-line" d="M105 76 V180 M91 184 Q105 194 119 184 M105 198 V353"/>
          </g>

          <path ${zoneAttrs(focus,"front-delts")} d="M78 84 C71 89 68 98 70 108 C77 111 84 106 89 97 L90 82 C86 81 82 82 78 84 Z"><title>Shoulders</title></path>
          <path ${zoneAttrs(focus,"front-delts")} d="M132 84 C139 89 142 98 140 108 C133 111 126 106 121 97 L120 82 C124 81 128 82 132 84 Z"><title>Shoulders</title></path>

          <path ${zoneAttrs(focus,"chest")} d="M91 86 C95 82 100 81 104 83 L104 120 C94 121 86 116 82 107 L84 94 C85 90 88 88 91 86 Z"><title>Chest</title></path>
          <path ${zoneAttrs(focus,"chest")} d="M119 86 C115 82 110 81 106 83 L106 120 C116 121 124 116 128 107 L126 94 C125 90 122 88 119 86 Z"><title>Chest</title></path>

          <path ${zoneAttrs(focus,"biceps")} d="M69 110 C61 117 60 136 63 151 C65 159 70 164 77 160 L83 122 C80 113 75 108 69 110 Z"><title>Biceps</title></path>
          <path ${zoneAttrs(focus,"biceps")} d="M141 110 C149 117 150 136 147 151 C145 159 140 164 133 160 L127 122 C130 113 135 108 141 110 Z"><title>Biceps</title></path>

          <path ${zoneAttrs(focus,"abs")} d="M94 124 C98 121 102 122 105 126 C108 122 112 121 116 124 L116 176 C112 184 108 186 105 181 C102 186 98 184 94 176 Z"><title>Core</title></path>
          <path class="sn51-muscle-detail" d="M95 140 H115 M95 154 H115 M105 125 V181"/>

          <path ${zoneAttrs(focus,"quads")} d="M88 198 C94 191 101 192 104 201 L101 268 C97 281 90 283 85 271 L83 238 Z"><title>Quads</title></path>
          <path ${zoneAttrs(focus,"quads")} d="M122 198 C116 191 109 192 106 201 L109 268 C113 281 120 283 125 271 L127 238 Z"><title>Quads</title></path>

          <path ${zoneAttrs(focus,"calves")} d="M86 277 C91 271 98 273 100 281 L98 338 C95 349 89 350 86 339 L83 304 Z"><title>Calves</title></path>
          <path ${zoneAttrs(focus,"calves")} d="M124 277 C119 271 112 273 110 281 L112 338 C115 349 121 350 124 339 L127 304 Z"><title>Calves</title></path>
        </g>

        <g class="sn51-model" transform="translate(270 10)">
          <text class="sn51-view-label" x="105" y="15" text-anchor="middle">BACK</text>
          <g filter="url(#sn51-shadow)">
            <ellipse class="sn51-body" cx="105" cy="48" rx="23" ry="27"/>
            <path class="sn51-body" d="M91 72 C81 77 72 86 67 101 L58 154 C56 166 59 174 67 177 C75 180 80 174 82 164 L88 122 L92 184 L82 246 C80 263 82 289 87 342 C88 356 95 365 105 365 C115 365 122 356 123 342 C128 289 130 263 128 246 L118 184 L122 122 L128 164 C130 174 135 180 143 177 C151 174 154 166 152 154 L143 101 C138 86 129 77 119 72 C111 69 99 69 91 72 Z"/>
            <path class="sn51-body-line" d="M105 76 V186 M92 184 Q105 195 118 184 M105 198 V353"/>
          </g>

          <path ${zoneAttrs(focus,"traps")} d="M94 72 C98 68 102 69 105 76 C108 69 112 68 116 72 L124 92 C119 103 113 109 105 111 C97 109 91 103 86 92 Z"><title>Traps</title></path>

          <path ${zoneAttrs(focus,"rear-delts")} d="M78 84 C71 89 68 98 70 108 C77 111 84 106 89 97 L90 82 C86 81 82 82 78 84 Z"><title>Rear delts</title></path>
          <path ${zoneAttrs(focus,"rear-delts")} d="M132 84 C139 89 142 98 140 108 C133 111 126 106 121 97 L120 82 C124 81 128 82 132 84 Z"><title>Rear delts</title></path>

          <path ${zoneAttrs(focus,"upper-back")} d="M88 96 C94 88 100 88 105 96 C110 88 116 88 122 96 L119 125 C115 135 110 140 105 142 C100 140 95 135 91 125 Z"><title>Back</title></path>
          <path ${zoneAttrs(focus,"lats")} d="M86 108 C78 112 74 124 76 143 L84 171 C93 167 99 157 101 143 L98 116 Z"><title>Back</title></path>
          <path ${zoneAttrs(focus,"lats")} d="M124 108 C132 112 136 124 134 143 L126 171 C117 167 111 157 109 143 L112 116 Z"><title>Back</title></path>

          <path ${zoneAttrs(focus,"triceps")} d="M69 110 C61 117 60 136 63 151 C65 159 70 164 77 160 L83 122 C80 113 75 108 69 110 Z"><title>Triceps</title></path>
          <path ${zoneAttrs(focus,"triceps")} d="M141 110 C149 117 150 136 147 151 C145 159 140 164 133 160 L127 122 C130 113 135 108 141 110 Z"><title>Triceps</title></path>

          <path ${zoneAttrs(focus,"lower-back")} d="M96 143 C101 139 109 139 114 143 L116 177 C110 184 100 184 94 177 Z"><title>Lower back</title></path>

          <path ${zoneAttrs(focus,"glutes")} d="M86 180 C93 173 101 174 105 182 C109 174 117 173 124 180 L126 206 C121 219 113 224 105 222 C97 224 89 219 84 206 Z"><title>Glutes</title></path>

          <path ${zoneAttrs(focus,"hamstrings")} d="M85 213 C91 207 99 209 102 217 L100 270 C96 281 89 282 85 272 L82 240 Z"><title>Hamstrings</title></path>
          <path ${zoneAttrs(focus,"hamstrings")} d="M125 213 C119 207 111 209 108 217 L110 270 C114 281 121 282 125 272 L128 240 Z"><title>Hamstrings</title></path>

          <path ${zoneAttrs(focus,"calves")} d="M86 277 C91 271 98 273 100 281 L98 338 C95 349 89 350 86 339 L83 304 Z"><title>Calves</title></path>
          <path ${zoneAttrs(focus,"calves")} d="M124 277 C119 271 112 273 110 281 L112 338 C115 349 121 350 124 339 L127 304 Z"><title>Calves</title></path>
        </g>
      </svg>
    `;
  }

  function installStyles() {
    if (document.getElementById("sn51-muscle-map-styles")) return;
    const style = document.createElement("style");
    style.id = "sn51-muscle-map-styles";
    style.textContent = `
      .sn51-muscle-card{overflow:visible}
      .sn51-muscle-card .section-head{align-items:center;margin-bottom:14px}
      .sn51-muscle-kicker{font-size:12px;font-weight:850;letter-spacing:.08em;text-transform:uppercase;color:#2F6DF6}
      .sn51-muscle-title{margin:0;font-size:24px;line-height:1.16;letter-spacing:-.035em;color:var(--text,#111827)}
      .sn51-muscle-subtitle{margin:7px 0 0;font-size:13px;line-height:1.45;color:var(--muted,#6B7280)}
      .sn51-muscle-content{display:grid;grid-template-columns:minmax(0,1fr);gap:18px;margin-top:16px}
      .sn51-map-stage{position:relative;min-height:340px;padding:10px 8px 2px;border:1px solid rgba(17,24,39,.06);border-radius:22px;background:linear-gradient(180deg,#FBFCFE 0%,#F5F7FA 100%);display:flex;align-items:center;justify-content:center;overflow:hidden}
      .sn51-map-wrap{width:100%;max-width:520px;margin:0 auto}
      .sn51-svg{width:100%;height:auto;display:block;overflow:visible}
      .sn51-body{fill:#F4F6F8;stroke:#9AA2AE;stroke-width:1.8;stroke-linejoin:round}
      .sn51-body-line{fill:none;stroke:#D1D6DD;stroke-width:1.1;stroke-linecap:round;opacity:.85}
      .sn51-view-label{font:800 10px/1 Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:.16em;fill:#8A93A0}
      .sn51-zone{stroke:#CBD2DB;stroke-width:1.05;cursor:pointer;transition:fill .18s ease,stroke .18s ease,opacity .18s ease,filter .18s ease;outline:none}
      .sn51-zone[data-level="inactive"]{fill:#E4E8ED;opacity:.82}
      .sn51-zone[data-level="secondary"]{fill:#A9CBFF;stroke:#76A8F8;opacity:.98}
      .sn51-zone[data-level="primary"]{fill:#2F6DF6;stroke:#1D4ED8;opacity:1;filter:drop-shadow(0 2px 3px rgba(47,109,246,.18))}
      .sn51-zone:hover,.sn51-zone:focus-visible{stroke-width:2;filter:drop-shadow(0 3px 5px rgba(47,109,246,.22))}
      .sn51-muscle-detail{fill:none;stroke:#C4CAD3;stroke-width:1;pointer-events:none}
      .sn51-tooltip{position:absolute;left:50%;bottom:12px;transform:translate(-50%,8px);opacity:0;pointer-events:none;min-width:150px;padding:9px 12px;border-radius:13px;background:rgba(17,24,39,.94);color:white;text-align:center;box-shadow:0 10px 26px rgba(15,23,42,.18);transition:opacity .15s ease,transform .15s ease;z-index:3}
      .sn51-tooltip.show{opacity:1;transform:translate(-50%,0)}
      .sn51-tooltip strong{display:block;font-size:13px;line-height:1.25}
      .sn51-tooltip span{display:block;margin-top:2px;font-size:11px;opacity:.76}
      .sn51-muscle-list{display:grid;gap:8px;align-content:start}
      .sn51-muscle-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 13px;border:1px solid rgba(17,24,39,.06);border-radius:14px;background:rgba(255,255,255,.78)}
      .sn51-muscle-name{display:flex;align-items:center;gap:9px;min-width:0;font-size:13px;font-weight:750;color:var(--text,#111827)}
      .sn51-swatch{width:9px;height:9px;border-radius:50%;flex:0 0 auto;background:#E4E8ED;box-shadow:0 0 0 3px rgba(228,232,237,.55)}
      .sn51-muscle-row[data-level="primary"] .sn51-swatch{background:#2F6DF6;box-shadow:0 0 0 3px rgba(47,109,246,.12)}
      .sn51-muscle-row[data-level="secondary"] .sn51-swatch{background:#A9CBFF;box-shadow:0 0 0 3px rgba(169,203,255,.24)}
      .sn51-muscle-status{font-size:11px;font-weight:800;color:#697386;white-space:nowrap}
      .sn51-muscle-row[data-level="primary"] .sn51-muscle-status{color:#2F6DF6}
      .sn51-legend{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px;color:var(--muted,#6B7280);font-size:10px;font-weight:700}
      .sn51-legend span{display:inline-flex;align-items:center;gap:5px}
      .sn51-legend i{width:8px;height:8px;border-radius:50%;display:inline-block;background:#E4E8ED}
      .sn51-legend .primary i{background:#2F6DF6}.sn51-legend .secondary i{background:#A9CBFF}
      .dark .sn51-map-stage{background:linear-gradient(180deg,#171A1F 0%,#13161B 100%);border-color:rgba(255,255,255,.07)}
      .dark .sn51-body{fill:#20242A;stroke:#69717C}.dark .sn51-body-line{stroke:#383E47}
      .dark .sn51-zone[data-level="inactive"]{fill:#343A43;stroke:#4B535E}
      .dark .sn51-muscle-row{background:rgba(255,255,255,.025);border-color:rgba(255,255,255,.07)}
      @media (min-width:760px){
        .sn51-muscle-content{grid-template-columns:minmax(0,1.35fr) minmax(215px,.65fr);align-items:center;gap:22px}
        .sn51-map-stage{min-height:390px}
      }
      @media (max-width:520px){
        .sn51-muscle-title{font-size:21px}
        .sn51-map-stage{min-height:300px;margin-left:-2px;margin-right:-2px;padding:8px 2px 0}
        .sn51-map-wrap{max-width:430px}
        .sn51-muscle-content{gap:14px}
        .sn51-muscle-row{padding:11px 12px}
      }
    `;
    document.head.appendChild(style);
  }

  function listMarkup(focus) {
    return focus.all.map(muscle => {
      const level = focus.primary.includes(muscle) ? "primary" : "secondary";
      return `
        <div class="sn51-muscle-row" data-level="${level}">
          <span class="sn51-muscle-name"><i class="sn51-swatch"></i>${esc(muscle)}</span>
          <span class="sn51-muscle-status">${level === "primary" ? "Primary" : "Secondary"}</span>
        </div>`;
    }).join("");
  }

  function bindInteraction(card, focus) {
    const tooltip = card.querySelector(".sn51-tooltip");
    if (!tooltip) return;
    let hideTimer = null;

    const show = zone => {
      clearTimeout(hideTimer);
      const muscle = zone.dataset.muscle || "Muscle";
      const level = zone.dataset.level || "inactive";
      tooltip.innerHTML = `<strong>${esc(muscle)}</strong><span>${level === "primary" ? "Primary muscle" : level === "secondary" ? "Secondary muscle" : "Not targeted today"}</span>`;
      tooltip.classList.add("show");
    };
    const hide = delay => {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => tooltip.classList.remove("show"), delay);
    };

    card.querySelectorAll(".sn51-zone").forEach(zone => {
      zone.addEventListener("mouseenter", () => show(zone));
      zone.addEventListener("mouseleave", () => hide(90));
      zone.addEventListener("focus", () => show(zone));
      zone.addEventListener("blur", () => hide(90));
      zone.addEventListener("click", event => {
        event.preventDefault();
        show(zone);
        hide(1800);
      });
    });
  }

  function findMuscleCard() {
    const cards = [...document.querySelectorAll(".section-card")];
    return cards.find(card => /muscle\s*focus/i.test(card.querySelector(".section-head")?.textContent || "")) || null;
  }

  function enhanceMuscleFocus() {
    installStyles();
    const card = findMuscleCard();
    if (!card) return;

    const workout = window.SN36?.scheduledWorkout?.()
      || (typeof getScheduledWorkout === "function" ? getScheduledWorkout() : null);
    if (!workout) return;
    const focus = buildFocus(workout);
    const title = formatMuscles(focus.all);

    card.classList.add("sn51-muscle-card");
    card.innerHTML = `
      <div class="section-head">
        <strong class="sn51-muscle-kicker">Muscle Focus</strong>
        <a href="#" class="sn51-manage-plan">Manage plan →</a>
      </div>
      <h3 class="sn51-muscle-title">${esc(title)}</h3>
      <p class="sn51-muscle-subtitle">Primary muscles trained in today’s workout</p>
      <div class="sn51-muscle-content">
        <div>
          <div class="sn51-map-stage">
            <div class="sn51-map-wrap">${svgMarkup(focus)}</div>
            <div class="sn51-tooltip" role="status" aria-live="polite"></div>
          </div>
          <div class="sn51-legend" aria-label="Muscle map legend">
            <span class="primary"><i></i>Primary</span>
            <span class="secondary"><i></i>Secondary</span>
            <span><i></i>Not targeted</span>
          </div>
        </div>
        <div class="sn51-muscle-list">${listMarkup(focus)}</div>
      </div>
    `;

    const manage = card.querySelector(".sn51-manage-plan");
    if (manage) manage.addEventListener("click", event => {
      event.preventDefault();
      if (typeof state !== "undefined") state.page = "workouts";
      if (typeof render === "function") render();
    });
    bindInteraction(card, focus);
  }

  installStyles();

  if (typeof renderHome === "function") {
    const originalRenderHome = renderHome;
    window.renderHome = function(...args) {
      const result = originalRenderHome.apply(this, args);
      enhanceMuscleFocus();
      return result;
    };
  }

  window.START_NOW_MUSCLE_MAP = {
    version: "v51",
    buildFocus,
    render: enhanceMuscleFocus
  };

  queueMicrotask(enhanceMuscleFocus);
})();
