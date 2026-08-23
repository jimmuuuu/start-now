// START/NOW visual assets v27 — recognizable machine art + dynamic front/back muscle focus.
(() => {
  const BLUE = "#3B82F6";
  const OUTLINE = "#8e949c";
  const BODY = "#f6f7f8";
  const DETAIL = "#c8ccd1";

  function installVisualStyles() {
    if (document.getElementById("sn-visual-styles")) return;
    const style = document.createElement("style");
    style.id = "sn-visual-styles";
    style.textContent = `
      .machine-art{height:170px;display:flex;align-items:flex-end;justify-content:center;position:relative;z-index:1}
      .sn-machine-wrap{width:100%;height:100%;display:flex;align-items:flex-end;justify-content:center}
      .sn-machine-svg{width:100%;max-width:235px;height:100%;overflow:visible}
      .body-visual{display:flex;align-items:center;justify-content:center;min-height:220px}
      .sn-dynamic-body-wrap{width:100%;max-width:245px;margin:auto}
      .sn-dynamic-body-svg{display:block;width:100%;height:auto;overflow:visible}
      .sn-body-label{margin-top:6px;text-align:center;color:var(--muted);font-size:10px;font-weight:800;letter-spacing:.04em}
      .sn-body-side-label{font:800 9px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:.08em;fill:var(--muted)}
      .dark .sn-machine-svg,.dark .sn-dynamic-body-svg{filter:drop-shadow(0 8px 18px rgba(0,0,0,.22))}
    `;
    document.head.appendChild(style);
  }

  function machineMarkup() {
    return `
      <div class="sn-machine-wrap" aria-label="Chest press machine">
        <svg class="sn-machine-svg" viewBox="0 0 270 215" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Chest press gym machine">
          <defs>
            <linearGradient id="snMetal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#f5f6f8"/><stop offset=".32" stop-color="#bec5cd"/><stop offset=".58" stop-color="#f8f9fa"/><stop offset="1" stop-color="#8f98a3"/>
            </linearGradient>
            <linearGradient id="snPad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#34383d"/><stop offset="1" stop-color="#121417"/>
            </linearGradient>
            <filter id="snShadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="9" stdDeviation="8" flood-color="#000" flood-opacity=".25"/></filter>
          </defs>
          <ellipse cx="139" cy="197" rx="92" ry="10" fill="#000" opacity=".16"/>
          <g filter="url(#snShadow)">
            <path d="M55 184 H104" stroke="#8d949d" stroke-width="10" stroke-linecap="round"/>
            <path d="M165 184 H220" stroke="#8d949d" stroke-width="10" stroke-linecap="round"/>
            <rect x="72" y="52" width="12" height="134" rx="6" fill="url(#snMetal)"/>
            <rect x="181" y="29" width="12" height="157" rx="6" fill="url(#snMetal)"/>
            <path d="M78 48 C103 17 157 13 187 34" fill="none" stroke="url(#snMetal)" stroke-width="12" stroke-linecap="round"/>
            <path d="M82 62 C112 38 151 34 181 47" fill="none" stroke="#9da5ae" stroke-width="3" opacity=".7"/>
            <rect x="105" y="92" width="13" height="88" rx="6" fill="url(#snMetal)"/>
            <rect x="117" y="145" width="53" height="11" rx="5" fill="#8c939c"/>
            <rect x="121" y="119" width="39" height="61" rx="10" fill="url(#snPad)"/>
            <rect x="118" y="83" width="34" height="46" rx="9" fill="url(#snPad)"/>
            <rect x="197" y="78" width="28" height="91" rx="5" fill="#30343a"/>
            <g fill="#17191c">
              <rect x="199" y="84" width="24" height="10" rx="2"/><rect x="199" y="97" width="24" height="10" rx="2"/><rect x="199" y="110" width="24" height="10" rx="2"/><rect x="199" y="123" width="24" height="10" rx="2"/><rect x="199" y="136" width="24" height="10" rx="2"/><rect x="199" y="149" width="24" height="10" rx="2"/>
            </g>
            <rect x="208" y="61" width="4" height="112" rx="2" fill="#aeb5bd"/>
            <rect x="201" y="151" width="7" height="9" rx="2" fill="#FF5A5F"/>
            <path d="M83 55 L63 98" stroke="url(#snMetal)" stroke-width="9" stroke-linecap="round"/>
            <path d="M185 47 L207 91" stroke="url(#snMetal)" stroke-width="9" stroke-linecap="round"/>
            <path d="M65 98 H39" stroke="#202328" stroke-width="8" stroke-linecap="round"/>
            <path d="M207 91 H237" stroke="#202328" stroke-width="8" stroke-linecap="round"/>
            <rect x="34" y="88" width="9" height="22" rx="4" fill="#111317"/>
            <rect x="235" y="81" width="9" height="22" rx="4" fill="#111317"/>
          </g>
        </svg>
      </div>`;
  }

  function normalizedMuscle(exercise) {
    const name = String(exercise?.name || "").toLowerCase();
    if (name.includes("romanian deadlift")) return "Hamstrings";
    return String(exercise?.muscle || "Other");
  }

  function focusMuscles(workout) {
    const raw = [...new Set((workout?.exercises || []).map(normalizedMuscle).filter(Boolean))];
    const hasSpecificLegMuscle = raw.some(muscle => ["Quads", "Hamstrings", "Glutes", "Calves"].includes(muscle));
    return raw.filter(muscle => !(muscle === "Legs" && hasSpecificLegMuscle));
  }

  function focusZones(workout) {
    const zones = new Set();
    focusMuscles(workout).forEach(muscle => {
      const key = muscle.toLowerCase();
      if (key.includes("chest")) zones.add("chest");
      if (key.includes("shoulder")) zones.add("shoulders");
      if (key.includes("rear delt")) zones.add("rear-delts");
      if (key === "back" || key.includes("lat")) zones.add("back");
      if (key.includes("bicep")) zones.add("biceps");
      if (key.includes("tricep")) zones.add("triceps");
      if (key.includes("core") || key.includes("ab")) zones.add("core");
      if (key.includes("quad")) zones.add("quads");
      if (key.includes("hamstring")) zones.add("hamstrings");
      if (key.includes("glute")) zones.add("glutes");
      if (key.includes("calf")) zones.add("calves");
      if (key === "legs") ["quads", "hamstrings", "glutes", "calves"].forEach(zone => zones.add(zone));
    });
    return zones;
  }

  function zoneFill(zones, zone) {
    return zones.has(zone) ? BLUE : "transparent";
  }

  function bodyMarkup(workout) {
    workout ||= typeof getTodayWorkout === "function" ? getTodayWorkout() : null;
    const zones = focusZones(workout);
    const names = focusMuscles(workout).join(", ") || "Full body";

    return `
      <div class="sn-dynamic-body-wrap" aria-label="Muscle focus: ${escapeHtml(names)}">
        <svg class="sn-dynamic-body-svg" viewBox="0 0 260 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Front and back body with today's muscles highlighted">
          <g transform="translate(5 0)">
            <text x="58" y="13" text-anchor="middle" class="sn-body-side-label">FRONT</text>
            <circle cx="58" cy="34" r="16" fill="${BODY}" stroke="${OUTLINE}" stroke-width="2.5"/>
            <path d="M42 54 C48 49 53 49 58 52 C63 49 68 49 74 54 L88 75 L80 113 L76 146 L71 215 H61 L58 151 L55 215 H45 L40 146 L36 113 L28 75 Z" fill="${BODY}" stroke="${OUTLINE}" stroke-width="2.5" stroke-linejoin="round"/>
            <path d="M30 72 L14 104 L7 100 L23 62 L40 54" fill="${BODY}" stroke="${OUTLINE}" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M86 72 L102 104 L109 100 L93 62 L76 54" fill="${BODY}" stroke="${OUTLINE}" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M39 57 C45 52 51 53 58 57 C65 53 71 52 77 57 L80 74 C72 82 66 86 58 86 C50 86 44 82 36 74 Z" fill="${zoneFill(zones,"chest")}"/>
            <ellipse cx="31" cy="68" rx="9" ry="11" fill="${zoneFill(zones,"shoulders")}"/>
            <ellipse cx="85" cy="68" rx="9" ry="11" fill="${zoneFill(zones,"shoulders")}"/>
            <ellipse cx="20" cy="84" rx="6" ry="13" transform="rotate(27 20 84)" fill="${zoneFill(zones,"biceps")}"/>
            <ellipse cx="96" cy="84" rx="6" ry="13" transform="rotate(-27 96 84)" fill="${zoneFill(zones,"biceps")}"/>
            <path d="M47 91 H69 L67 126 H49 Z" fill="${zoneFill(zones,"core")}"/>
            <path d="M40 132 L56 132 L55 176 L44 176 Z" fill="${zoneFill(zones,"quads")}"/>
            <path d="M60 132 L76 132 L72 176 L61 176 Z" fill="${zoneFill(zones,"quads")}"/>
            <path d="M44 177 L55 177 L53 211 L46 211 Z" fill="${zoneFill(zones,"calves")}"/>
            <path d="M61 177 L72 177 L70 211 L63 211 Z" fill="${zoneFill(zones,"calves")}"/>
            <path d="M58 89 V125 M44 127 H72" stroke="${DETAIL}" stroke-width="1.6" opacity=".8"/>
          </g>

          <g transform="translate(135 0)">
            <text x="58" y="13" text-anchor="middle" class="sn-body-side-label">BACK</text>
            <circle cx="58" cy="34" r="16" fill="${BODY}" stroke="${OUTLINE}" stroke-width="2.5"/>
            <path d="M42 54 C48 49 53 49 58 52 C63 49 68 49 74 54 L88 75 L80 113 L76 146 L71 215 H61 L58 151 L55 215 H45 L40 146 L36 113 L28 75 Z" fill="${BODY}" stroke="${OUTLINE}" stroke-width="2.5" stroke-linejoin="round"/>
            <path d="M30 72 L14 104 L7 100 L23 62 L40 54" fill="${BODY}" stroke="${OUTLINE}" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M86 72 L102 104 L109 100 L93 62 L76 54" fill="${BODY}" stroke="${OUTLINE}" stroke-width="2.5" stroke-linecap="round"/>
            <ellipse cx="31" cy="68" rx="9" ry="11" fill="${zones.has("rear-delts") || zones.has("shoulders") ? BLUE : "transparent"}"/>
            <ellipse cx="85" cy="68" rx="9" ry="11" fill="${zones.has("rear-delts") || zones.has("shoulders") ? BLUE : "transparent"}"/>
            <path d="M40 57 C47 53 52 54 58 58 C64 54 69 53 76 57 L80 86 L70 111 H46 L36 86 Z" fill="${zoneFill(zones,"back")}"/>
            <ellipse cx="20" cy="84" rx="6" ry="13" transform="rotate(27 20 84)" fill="${zoneFill(zones,"triceps")}"/>
            <ellipse cx="96" cy="84" rx="6" ry="13" transform="rotate(-27 96 84)" fill="${zoneFill(zones,"triceps")}"/>
            <ellipse cx="50" cy="128" rx="10" ry="9" fill="${zoneFill(zones,"glutes")}"/>
            <ellipse cx="66" cy="128" rx="10" ry="9" fill="${zoneFill(zones,"glutes")}"/>
            <path d="M40 139 L55 139 L54 176 L44 176 Z" fill="${zoneFill(zones,"hamstrings")}"/>
            <path d="M61 139 L76 139 L72 176 L62 176 Z" fill="${zoneFill(zones,"hamstrings")}"/>
            <path d="M44 177 L55 177 L53 211 L46 211 Z" fill="${zoneFill(zones,"calves")}"/>
            <path d="M61 177 L72 177 L70 211 L63 211 Z" fill="${zoneFill(zones,"calves")}"/>
            <path d="M58 59 V112" stroke="${DETAIL}" stroke-width="1.6" opacity=".8"/>
          </g>
        </svg>
        <div class="sn-body-label">BLUE = TODAY’S FOCUS</div>
      </div>`;
  }

  function repairRomanianDeadlifts() {
    let changed = false;
    if (typeof exerciseLibrary !== "undefined" && Array.isArray(exerciseLibrary)) {
      exerciseLibrary.forEach(exercise => {
        if (String(exercise?.name || "").toLowerCase().includes("romanian deadlift") && exercise.muscle !== "Hamstrings") {
          exercise.muscle = "Hamstrings";
          changed = true;
        }
      });
    }

    if (typeof state !== "undefined" && Array.isArray(state.customWorkouts)) {
      state.customWorkouts = state.customWorkouts.map(workout => ({
        ...workout,
        exercises: (workout.exercises || []).map(exercise => {
          if (String(exercise?.name || "").toLowerCase().includes("romanian deadlift") && exercise.muscle !== "Hamstrings") {
            changed = true;
            return { ...exercise, muscle: "Hamstrings" };
          }
          return exercise;
        })
      }));
      if (changed && typeof saveCustomWorkouts === "function") saveCustomWorkouts();
    }
  }

  function patchFocusCard(workout) {
    if (!workout) return;
    const body = document.querySelector(".body-visual");
    const copy = document.querySelector(".focus-copy");
    if (!body || !copy) return;

    const muscles = focusMuscles(workout).slice(0, 4);
    body.innerHTML = bodyMarkup(workout);

    const heading = copy.querySelector("h3");
    if (heading) heading.textContent = muscles.join(", ") || "Full body";

    const list = copy.querySelector(".muscle-list");
    if (list) {
      list.innerHTML = muscles.map((muscle, index) => `
        <div class="muscle-row"><span><i class="dot"></i>${escapeHtml(muscle)}</span><span>${index === 0 ? "Primary" : "Focus"}</span></div>
      `).join("");
    }
  }

  installVisualStyles();
  repairRomanianDeadlifts();

  if (typeof machineSvg === "function") machineSvg = () => machineMarkup();
  if (typeof bodySvg === "function") bodySvg = workout => bodyMarkup(workout);
  if (typeof workoutMuscles === "function") workoutMuscles = workout => focusMuscles(workout).slice(0, 4).join(", ") || "Full body";

  if (typeof renderHome === "function") {
    const previousRenderHome = renderHome;
    renderHome = function () {
      const result = previousRenderHome();
      const workout = typeof getTodayWorkout === "function" ? getTodayWorkout() : null;
      patchFocusCard(workout);
      return result;
    };
  }

  if (typeof render === "function") render();
})();