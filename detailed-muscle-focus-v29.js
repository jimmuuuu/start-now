// START/NOW v29 — larger, clearer, more detailed muscle focus map.
(() => {
  const ACTIVE = "#3B82F6";
  const ACTIVE_STROKE = "#245FD1";
  const BODY = "#F5F7F9";
  const OUTLINE = "#969EA8";
  const DETAIL = "#C9CFD6";

  function esc(value) {
    if (typeof escapeHtml === "function") return escapeHtml(value);
    return String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#39;");
  }

  function normalizeMuscle(exercise) {
    const name = String(exercise?.name || "").toLowerCase();
    if (name.includes("romanian deadlift")) return "Hamstrings";
    return String(exercise?.muscle || "Other");
  }

  function musclesFor(workout) {
    const raw = [...new Set((workout?.exercises || []).map(normalizeMuscle).filter(Boolean))];
    const specificLegs = raw.some(m => ["Quads","Hamstrings","Glutes","Calves"].includes(m));
    return raw.filter(m => !(m === "Legs" && specificLegs));
  }

  function zonesFor(workout) {
    const zones = new Set();
    musclesFor(workout).forEach(muscle => {
      const key = muscle.toLowerCase();
      if (key.includes("chest")) zones.add("chest");
      if (key.includes("shoulder")) zones.add("front-delts");
      if (key.includes("shoulder") || key.includes("rear delt")) zones.add("rear-delts");
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
      if (key === "legs") ["quads","hamstrings","glutes","calves"].forEach(z => zones.add(z));
    });
    return zones;
  }

  const fill = (zones, zone) => zones.has(zone) ? ACTIVE : "transparent";
  const stroke = (zones, zone) => zones.has(zone) ? ACTIVE_STROKE : "none";
  const detailStroke = (zones, zone) => zones.has(zone) ? ACTIVE_STROKE : DETAIL;

  function installStyles() {
    if (document.getElementById("sn-muscle-v29-styles")) return;
    const style = document.createElement("style");
    style.id = "sn-muscle-v29-styles";
    style.textContent = `
      .body-visual{min-height:275px;display:flex;align-items:center;justify-content:center}
      .sn-muscle-v29{width:100%;max-width:320px;margin:0 auto}
      .sn-muscle-v29 svg{display:block;width:100%;height:auto;overflow:visible}
      .sn-muscle-v29 .side-label{font:800 10px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:.09em;fill:var(--muted)}
      .sn-muscle-v29 .legend{margin-top:8px;text-align:center;color:var(--muted);font-size:10px;font-weight:800;letter-spacing:.05em}
      .dark .sn-muscle-v29 svg{filter:drop-shadow(0 10px 20px rgba(0,0,0,.2))}
    `;
    document.head.appendChild(style);
  }

  function bodyMarkup(workout) {
    workout ||= typeof getTodayWorkout === "function" ? getTodayWorkout() : null;
    const z = zonesFor(workout);
    const label = musclesFor(workout).join(", ") || "Full body";

    return `<div class="sn-muscle-v29" aria-label="Muscle focus: ${esc(label)}">
      <svg viewBox="0 0 340 285" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Detailed front and back body showing today's muscle focus">
        <g transform="translate(8 5)">
          <text class="side-label" x="76" y="14" text-anchor="middle">FRONT</text>
          <circle cx="76" cy="39" r="18" fill="${BODY}" stroke="${OUTLINE}" stroke-width="2.6"/>
          <path d="M60 62 C65 55 71 54 76 57 C81 54 87 55 92 62 L103 73 C111 82 114 94 113 108 L106 151 L99 214 L90 239 H62 L53 214 L46 151 L39 108 C38 94 41 82 49 73 Z" fill="${BODY}" stroke="${OUTLINE}" stroke-width="2.6" stroke-linejoin="round"/>
          <path d="M49 73 L33 111 L23 106 L35 72 L49 60" fill="${BODY}" stroke="${OUTLINE}" stroke-width="2.6" stroke-linecap="round"/>
          <path d="M103 73 L119 111 L129 106 L117 72 L103 60" fill="${BODY}" stroke="${OUTLINE}" stroke-width="2.6" stroke-linecap="round"/>

          <path d="M50 64 C57 58 65 58 76 63 C87 58 95 58 102 64 L103 80 C94 91 86 96 76 96 C66 96 58 91 49 80 Z" fill="${fill(z,"chest")}" stroke="${stroke(z,"chest")}" stroke-width="1.5"/>
          <path d="M43 67 C47 61 54 60 60 66 C58 77 52 84 43 86 C38 80 39 72 43 67 Z" fill="${fill(z,"front-delts")}" stroke="${stroke(z,"front-delts")}" stroke-width="1.5"/>
          <path d="M109 67 C105 61 98 60 92 66 C94 77 100 84 109 86 C114 80 113 72 109 67 Z" fill="${fill(z,"front-delts")}" stroke="${stroke(z,"front-delts")}" stroke-width="1.5"/>
          <path d="M27 84 C33 82 38 87 39 96 C38 106 34 113 27 115 C20 109 20 90 27 84 Z" fill="${fill(z,"biceps")}" stroke="${stroke(z,"biceps")}" stroke-width="1.5"/>
          <path d="M125 84 C119 82 114 87 113 96 C114 106 118 113 125 115 C132 109 132 90 125 84 Z" fill="${fill(z,"biceps")}" stroke="${stroke(z,"biceps")}" stroke-width="1.5"/>
          <path d="M63 99 C68 96 84 96 89 99 L87 132 C84 138 68 138 65 132 Z" fill="${fill(z,"abs")}" stroke="${stroke(z,"abs")}" stroke-width="1.5"/>
          <path d="M76 100 V135 M63 110 H89 M64 121 H88" stroke="${detailStroke(z,"abs")}" stroke-width="1.6" opacity=".9"/>

          <path d="M54 149 C59 145 66 144 72 148 L69 192 C66 199 59 199 55 192 Z" fill="${fill(z,"quads")}" stroke="${stroke(z,"quads")}" stroke-width="1.5"/>
          <path d="M80 148 C86 144 93 145 98 149 L97 192 C93 199 86 199 83 192 Z" fill="${fill(z,"quads")}" stroke="${stroke(z,"quads")}" stroke-width="1.5"/>
          <path d="M58 153 C61 151 65 151 68 153 L65 185 C63 189 60 189 58 185 Z" fill="none" stroke="${detailStroke(z,"quads")}" stroke-width="1.3" opacity=".85"/>
          <path d="M84 153 C87 151 91 151 94 153 L94 185 C92 189 89 189 87 185 Z" fill="none" stroke="${detailStroke(z,"quads")}" stroke-width="1.3" opacity=".85"/>
          <path d="M56 193 C61 190 66 190 69 194 L66 228 C63 233 59 233 55 228 Z" fill="${fill(z,"calves")}" stroke="${stroke(z,"calves")}" stroke-width="1.5"/>
          <path d="M83 194 C86 190 91 190 96 193 L97 228 C93 233 89 233 86 228 Z" fill="${fill(z,"calves")}" stroke="${stroke(z,"calves")}" stroke-width="1.5"/>
          <path d="M61 197 C64 195 66 196 67 200 L64 222" fill="none" stroke="${detailStroke(z,"calves")}" stroke-width="1.2" opacity=".8"/>
          <path d="M91 197 C88 195 86 196 85 200 L88 222" fill="none" stroke="${detailStroke(z,"calves")}" stroke-width="1.2" opacity=".8"/>
        </g>

        <g transform="translate(176 5)">
          <text class="side-label" x="76" y="14" text-anchor="middle">BACK</text>
          <circle cx="76" cy="39" r="18" fill="${BODY}" stroke="${OUTLINE}" stroke-width="2.6"/>
          <path d="M60 62 C65 55 71 54 76 57 C81 54 87 55 92 62 L103 73 C111 82 114 94 113 108 L106 151 L99 214 L90 239 H62 L53 214 L46 151 L39 108 C38 94 41 82 49 73 Z" fill="${BODY}" stroke="${OUTLINE}" stroke-width="2.6" stroke-linejoin="round"/>
          <path d="M49 73 L33 111 L23 106 L35 72 L49 60" fill="${BODY}" stroke="${OUTLINE}" stroke-width="2.6" stroke-linecap="round"/>
          <path d="M103 73 L119 111 L129 106 L117 72 L103 60" fill="${BODY}" stroke="${OUTLINE}" stroke-width="2.6" stroke-linecap="round"/>

          <path d="M62 60 C67 55 71 55 76 59 C81 55 85 55 90 60 L91 69 C86 75 82 77 76 77 C70 77 66 75 61 69 Z" fill="${fill(z,"traps")}" stroke="${stroke(z,"traps")}" stroke-width="1.5"/>
          <path d="M43 67 C47 61 54 60 60 66 C58 77 52 84 43 86 C38 80 39 72 43 67 Z" fill="${fill(z,"rear-delts")}" stroke="${stroke(z,"rear-delts")}" stroke-width="1.5"/>
          <path d="M109 67 C105 61 98 60 92 66 C94 77 100 84 109 86 C114 80 113 72 109 67 Z" fill="${fill(z,"rear-delts")}" stroke="${stroke(z,"rear-delts")}" stroke-width="1.5"/>
          <path d="M51 74 C58 70 67 71 76 77 C85 71 94 70 101 74 L103 103 C99 116 90 124 81 128 L76 119 L71 128 C62 124 53 116 49 103 Z" fill="${fill(z,"upper-back")}" stroke="${stroke(z,"upper-back")}" stroke-width="1.5"/>
          <path d="M50 100 C57 99 62 103 66 110 L65 145 C58 147 52 143 47 134 Z" fill="${fill(z,"lats")}" stroke="${stroke(z,"lats")}" stroke-width="1.5"/>
          <path d="M102 100 C95 99 90 103 86 110 L87 145 C94 147 100 143 105 134 Z" fill="${fill(z,"lats")}" stroke="${stroke(z,"lats")}" stroke-width="1.5"/>
          <path d="M70 112 H82 L84 142 H68 Z" fill="${fill(z,"lower-back")}" stroke="${stroke(z,"lower-back")}" stroke-width="1.5"/>
          <path d="M76 78 V143" stroke="${DETAIL}" stroke-width="1.5" opacity=".8"/>
          <path d="M27 84 C33 82 38 87 39 96 C38 106 34 113 27 115 C20 109 20 90 27 84 Z" fill="${fill(z,"triceps")}" stroke="${stroke(z,"triceps")}" stroke-width="1.5"/>
          <path d="M125 84 C119 82 114 87 113 96 C114 106 118 113 125 115 C132 109 132 90 125 84 Z" fill="${fill(z,"triceps")}" stroke="${stroke(z,"triceps")}" stroke-width="1.5"/>

          <path d="M61 135 C66 131 71 130 76 134 C81 130 86 131 91 135 L92 152 C87 159 82 161 76 161 C70 161 65 159 60 152 Z" fill="${fill(z,"glutes")}" stroke="${stroke(z,"glutes")}" stroke-width="1.5"/>
          <path d="M55 154 C60 151 66 151 70 154 L68 194 C64 200 59 200 55 194 Z" fill="${fill(z,"hamstrings")}" stroke="${stroke(z,"hamstrings")}" stroke-width="1.5"/>
          <path d="M82 154 C86 151 92 151 97 154 L97 194 C93 200 88 200 84 194 Z" fill="${fill(z,"hamstrings")}" stroke="${stroke(z,"hamstrings")}" stroke-width="1.5"/>
          <path d="M59 159 C62 156 66 156 68 159 L65 189" fill="none" stroke="${detailStroke(z,"hamstrings")}" stroke-width="1.3" opacity=".85"/>
          <path d="M93 159 C90 156 86 156 84 159 L87 189" fill="none" stroke="${detailStroke(z,"hamstrings")}" stroke-width="1.3" opacity=".85"/>
          <path d="M56 195 C61 192 66 192 69 196 L66 228 C63 233 59 233 55 228 Z" fill="${fill(z,"calves")}" stroke="${stroke(z,"calves")}" stroke-width="1.5"/>
          <path d="M83 196 C86 192 91 192 96 195 L97 228 C93 233 89 233 86 228 Z" fill="${fill(z,"calves")}" stroke="${stroke(z,"calves")}" stroke-width="1.5"/>
        </g>
      </svg>
      <div class="legend">BLUE = TODAY’S FOCUS</div>
    </div>`;
  }

  function patchFocus(workout) {
    if (!workout) return;
    const body = document.querySelector(".body-visual");
    const copy = document.querySelector(".focus-copy");
    if (!body || !copy) return;
    const muscles = musclesFor(workout).slice(0,4);
    body.innerHTML = bodyMarkup(workout);
    const heading = copy.querySelector("h3");
    if (heading) heading.textContent = muscles.join(", ") || "Full body";
    const list = copy.querySelector(".muscle-list");
    if (list) list.innerHTML = muscles.map((muscle,index) => `<div class="muscle-row"><span><i class="dot"></i>${esc(muscle)}</span><span>${index === 0 ? "Primary" : "Focus"}</span></div>`).join("");
  }

  installStyles();
  if (typeof bodySvg === "function") bodySvg = workout => bodyMarkup(workout);
  if (typeof workoutMuscles === "function") workoutMuscles = workout => musclesFor(workout).slice(0,4).join(", ") || "Full body";

  if (typeof renderHome === "function") {
    const previousRenderHome = renderHome;
    renderHome = function () {
      const result = previousRenderHome();
      patchFocus(typeof getTodayWorkout === "function" ? getTodayWorkout() : null);
      return result;
    };
  }

  if (typeof render === "function") render();
})();