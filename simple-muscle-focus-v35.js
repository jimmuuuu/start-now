// START/NOW v35 — simple, polished, reliable dynamic muscle map.
(() => {
  const BLUE = "#3B82F6";
  const BLUE_DARK = "#2563EB";
  const BODY = "#F8F9FA";
  const MUSCLE = "#E6E9ED";
  const OUTLINE = "#7F8792";
  const DETAIL = "#C8CDD4";

  function esc(value) {
    if (typeof escapeHtml === "function") return escapeHtml(value);
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeMuscle(exercise) {
    const name = String(exercise?.name || "").toLowerCase();
    if (name.includes("romanian deadlift")) return "Hamstrings";
    return String(exercise?.muscle || "Other");
  }

  function musclesFor(workout) {
    const raw = [...new Set((workout?.exercises || []).map(normalizeMuscle).filter(Boolean))];
    const specificLegs = raw.some(m => ["Quads", "Hamstrings", "Glutes", "Calves"].includes(m));
    return raw.filter(m => !(m === "Legs" && specificLegs));
  }

  function zonesFor(workout) {
    const zones = new Set();
    musclesFor(workout).forEach(muscle => {
      const key = muscle.toLowerCase();
      if (key.includes("chest")) zones.add("chest");
      if (key.includes("shoulder")) { zones.add("front-delts"); zones.add("rear-delts"); }
      if (key.includes("rear delt")) zones.add("rear-delts");
      if (key.includes("trap")) zones.add("traps");
      if (key === "back" || key.includes("lat")) { zones.add("upper-back"); zones.add("lats"); }
      if (key.includes("lower back")) zones.add("lower-back");
      if (key.includes("bicep")) zones.add("biceps");
      if (key.includes("tricep")) zones.add("triceps");
      if (key.includes("core") || key.includes("ab")) zones.add("abs");
      if (key.includes("quad")) zones.add("quads");
      if (key.includes("hamstring")) zones.add("hamstrings");
      if (key.includes("glute")) zones.add("glutes");
      if (key.includes("calf")) zones.add("calves");
      if (key === "legs") ["quads", "hamstrings", "glutes", "calves"].forEach(zone => zones.add(zone));
    });
    return zones;
  }

  function fill(zones, zone) {
    return zones.has(zone) ? "url(#activeMuscle)" : MUSCLE;
  }

  function stroke(zones, zone) {
    return zones.has(zone) ? BLUE_DARK : DETAIL;
  }

  function installStyles() {
    if (document.getElementById("sn-simple-muscle-v35-styles")) return;
    const style = document.createElement("style");
    style.id = "sn-simple-muscle-v35-styles";
    style.textContent = `
      .body-visual{display:flex;align-items:center;justify-content:center;min-height:300px}
      .sn-simple-muscle-wrap{width:100%;max-width:350px;margin:0 auto}
      .sn-simple-muscle-svg{width:100%;height:auto;display:block;overflow:visible}
      .sn-simple-muscle-label{margin-top:8px;text-align:center;font-size:10px;font-weight:800;letter-spacing:.06em;color:var(--muted)}
      .sn-simple-side-label{font:800 10px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:.12em;fill:#7F8792}
      .sn-simple-muscle-svg .body-outline{filter:drop-shadow(0 4px 8px rgba(17,24,39,.06))}
      .dark .sn-simple-muscle-svg .body-outline{filter:drop-shadow(0 4px 8px rgba(0,0,0,.22))}
      @media (max-width:640px){
        .body-visual{min-height:250px}
        .sn-simple-muscle-wrap{max-width:285px}
      }
    `;
    document.head.appendChild(style);
  }

  function bodyMarkup(workout) {
    workout ||= typeof getTodayWorkout === "function" ? getTodayWorkout() : null;
    const zones = zonesFor(workout);
    const names = musclesFor(workout).join(", ") || "Full body";

    return `
      <div class="sn-simple-muscle-wrap" aria-label="Muscle focus: ${esc(names)}">
        <svg class="sn-simple-muscle-svg" viewBox="0 0 360 330" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Front and back muscle map">
          <defs>
            <linearGradient id="activeMuscle" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#60A5FA"/>
              <stop offset="100%" stop-color="#2563EB"/>
            </linearGradient>
          </defs>

          <g transform="translate(18 12)">
            <text x="76" y="12" text-anchor="middle" class="sn-simple-side-label">FRONT</text>
            <g class="body-outline">
              <circle cx="76" cy="38" r="19" fill="${BODY}" stroke="${OUTLINE}" stroke-width="2.3"/>
              <path d="M58 59 C63 55 69 53 76 55 C83 53 89 55 94 59 L110 78 C116 88 119 101 116 116 L110 154 C107 167 104 180 103 194 L100 268 C97 285 86 291 76 279 C66 291 55 285 52 268 L49 194 C48 180 45 167 42 154 L36 116 C33 101 36 88 42 78 Z" fill="${BODY}" stroke="${OUTLINE}" stroke-width="2.3" stroke-linejoin="round"/>
              <path d="M43 76 L25 111 L15 106 L28 70 L46 59" fill="${BODY}" stroke="${OUTLINE}" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round"/>
              <path d="M109 76 L127 111 L137 106 L124 70 L106 59" fill="${BODY}" stroke="${OUTLINE}" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round"/>
            </g>

            <path d="M47 68 C54 61 64 60 76 65 C88 60 98 61 105 68 C103 84 94 94 76 96 C58 94 49 84 47 68 Z" fill="${fill(zones,"chest")}" stroke="${stroke(zones,"chest")}" stroke-width="1.2"/>
            <path d="M40 68 C45 59 54 59 60 66 C57 79 50 85 41 84 C36 78 36 73 40 68 Z" fill="${fill(zones,"front-delts")}" stroke="${stroke(zones,"front-delts")}" stroke-width="1.2"/>
            <path d="M112 68 C107 59 98 59 92 66 C95 79 102 85 111 84 C116 78 116 73 112 68 Z" fill="${fill(zones,"front-delts")}" stroke="${stroke(zones,"front-delts")}" stroke-width="1.2"/>
            <path d="M21 82 C29 80 34 86 35 96 C34 106 30 114 22 116 C16 109 15 89 21 82 Z" fill="${fill(zones,"biceps")}" stroke="${stroke(zones,"biceps")}" stroke-width="1.2"/>
            <path d="M131 82 C123 80 118 86 117 96 C118 106 122 114 130 116 C136 109 137 89 131 82 Z" fill="${fill(zones,"biceps")}" stroke="${stroke(zones,"biceps")}" stroke-width="1.2"/>

            <path d="M62 100 C66 96 72 95 76 99 C80 95 86 96 90 100 L88 143 C84 149 80 151 76 148 C72 151 68 149 64 143 Z" fill="${fill(zones,"abs")}" stroke="${stroke(zones,"abs")}" stroke-width="1.2"/>
            <path d="M63 111 H89 M63 123 H89 M63 135 H89 M76 99 V148" stroke="${zones.has("abs") ? BLUE_DARK : DETAIL}" stroke-width="1.1" opacity=".8"/>

            <path d="M48 157 C55 150 64 149 70 155 L68 220 C64 233 54 233 49 220 Z" fill="${fill(zones,"quads")}" stroke="${stroke(zones,"quads")}" stroke-width="1.2"/>
            <path d="M82 155 C88 149 97 150 104 157 L103 220 C98 233 88 233 84 220 Z" fill="${fill(zones,"quads")}" stroke="${stroke(zones,"quads")}" stroke-width="1.2"/>
            <path d="M51 222 C57 217 64 218 67 224 L64 271 C60 282 54 281 51 270 Z" fill="${fill(zones,"calves")}" stroke="${stroke(zones,"calves")}" stroke-width="1.2"/>
            <path d="M85 224 C88 218 95 217 101 222 L101 270 C98 281 92 282 88 271 Z" fill="${fill(zones,"calves")}" stroke="${stroke(zones,"calves")}" stroke-width="1.2"/>
          </g>

          <g transform="translate(188 12)">
            <text x="76" y="12" text-anchor="middle" class="sn-simple-side-label">BACK</text>
            <g class="body-outline">
              <circle cx="76" cy="38" r="19" fill="${BODY}" stroke="${OUTLINE}" stroke-width="2.3"/>
              <path d="M58 59 C63 55 69 53 76 55 C83 53 89 55 94 59 L110 78 C116 88 119 101 116 116 L110 154 C107 167 104 180 103 194 L100 268 C97 285 86 291 76 279 C66 291 55 285 52 268 L49 194 C48 180 45 167 42 154 L36 116 C33 101 36 88 42 78 Z" fill="${BODY}" stroke="${OUTLINE}" stroke-width="2.3" stroke-linejoin="round"/>
              <path d="M43 76 L25 111 L15 106 L28 70 L46 59" fill="${BODY}" stroke="${OUTLINE}" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round"/>
              <path d="M109 76 L127 111 L137 106 L124 70 L106 59" fill="${BODY}" stroke="${OUTLINE}" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round"/>
            </g>

            <path d="M58 58 C63 53 69 53 76 59 C83 53 89 53 94 58 L96 71 C88 79 83 82 76 82 C69 82 64 79 56 71 Z" fill="${fill(zones,"traps")}" stroke="${stroke(zones,"traps")}" stroke-width="1.2"/>
            <path d="M40 68 C45 59 54 59 60 66 C57 79 50 85 41 84 C36 78 36 73 40 68 Z" fill="${fill(zones,"rear-delts")}" stroke="${stroke(zones,"rear-delts")}" stroke-width="1.2"/>
            <path d="M112 68 C107 59 98 59 92 66 C95 79 102 85 111 84 C116 78 116 73 112 68 Z" fill="${fill(zones,"rear-delts")}" stroke="${stroke(zones,"rear-delts")}" stroke-width="1.2"/>
            <path d="M49 77 C58 70 68 70 76 77 C84 70 94 70 103 77 L101 114 C94 127 87 134 76 139 C65 134 58 127 51 114 Z" fill="${fill(zones,"upper-back")}" stroke="${stroke(zones,"upper-back")}" stroke-width="1.2"/>
            <path d="M48 105 C56 103 62 109 66 119 L65 153 C57 157 50 153 45 143 Z" fill="${fill(zones,"lats")}" stroke="${stroke(zones,"lats")}" stroke-width="1.2"/>
            <path d="M104 105 C96 103 90 109 86 119 L87 153 C95 157 102 153 107 143 Z" fill="${fill(zones,"lats")}" stroke="${stroke(zones,"lats")}" stroke-width="1.2"/>
            <path d="M21 82 C29 80 34 86 35 96 C34 106 30 114 22 116 C16 109 15 89 21 82 Z" fill="${fill(zones,"triceps")}" stroke="${stroke(zones,"triceps")}" stroke-width="1.2"/>
            <path d="M131 82 C123 80 118 86 117 96 C118 106 122 114 130 116 C136 109 137 89 131 82 Z" fill="${fill(zones,"triceps")}" stroke="${stroke(zones,"triceps")}" stroke-width="1.2"/>
            <path d="M68 124 H84 L86 153 C82 159 70 159 66 153 Z" fill="${fill(zones,"lower-back")}" stroke="${stroke(zones,"lower-back")}" stroke-width="1.2"/>

            <path d="M54 151 C61 144 70 144 76 150 C82 144 91 144 98 151 L99 171 C91 180 84 183 76 182 C68 183 61 180 53 171 Z" fill="${fill(zones,"glutes")}" stroke="${stroke(zones,"glutes")}" stroke-width="1.2"/>
            <path d="M49 176 C56 170 64 170 69 177 L67 222 C63 232 54 231 50 220 Z" fill="${fill(zones,"hamstrings")}" stroke="${stroke(zones,"hamstrings")}" stroke-width="1.2"/>
            <path d="M83 177 C88 170 96 170 103 176 L102 220 C98 231 89 232 85 222 Z" fill="${fill(zones,"hamstrings")}" stroke="${stroke(zones,"hamstrings")}" stroke-width="1.2"/>
            <path d="M51 222 C57 217 64 218 67 224 L64 271 C60 282 54 281 51 270 Z" fill="${fill(zones,"calves")}" stroke="${stroke(zones,"calves")}" stroke-width="1.2"/>
            <path d="M85 224 C88 218 95 217 101 222 L101 270 C98 281 92 282 88 271 Z" fill="${fill(zones,"calves")}" stroke="${stroke(zones,"calves")}" stroke-width="1.2"/>
          </g>
        </svg>
        <div class="sn-simple-muscle-label">BLUE = TODAY’S FOCUS</div>
      </div>`;
  }

  function patchFocusCard(workout) {
    if (!workout) return;
    const body = document.querySelector(".body-visual");
    const copy = document.querySelector(".focus-copy");
    if (!body || !copy) return;

    const muscles = musclesFor(workout).slice(0, 4);
    body.innerHTML = bodyMarkup(workout);

    const heading = copy.querySelector("h3");
    if (heading) heading.textContent = muscles.join(", ") || "Full body";

    const list = copy.querySelector(".muscle-list");
    if (list) {
      list.innerHTML = muscles.map((muscle, index) => `
        <div class="muscle-row"><span><i class="dot"></i>${esc(muscle)}</span><span>${index === 0 ? "Primary" : "Focus"}</span></div>
      `).join("");
    }
  }

  installStyles();

  if (typeof bodySvg === "function") bodySvg = workout => bodyMarkup(workout);
  if (typeof workoutMuscles === "function") workoutMuscles = workout => musclesFor(workout).slice(0, 4).join(", ") || "Full body";

  if (typeof renderHome === "function") {
    const priorRenderHome = renderHome;
    renderHome = function () {
      const result = priorRenderHome();
      const workout = typeof getTodayWorkout === "function" ? getTodayWorkout() : null;
      patchFocusCard(workout);
      return result;
    };
  }

  if (typeof render === "function") render();
})();
