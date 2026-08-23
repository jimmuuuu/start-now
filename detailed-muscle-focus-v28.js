// START/NOW v28 — more detailed front/back muscle map.
(() => {
  const ACTIVE = "#3B82F6";
  const ACTIVE_STROKE = "#245FD1";
  const BODY = "#F4F6F8";
  const OUTLINE = "#9AA1AA";
  const DETAIL = "#CCD1D7";

  function normalizeMuscle(exercise){
    const name = String(exercise?.name || "").toLowerCase();
    if(name.includes("romanian deadlift")) return "Hamstrings";
    return String(exercise?.muscle || "Other");
  }

  function musclesFor(workout){
    const raw = [...new Set((workout?.exercises || []).map(normalizeMuscle).filter(Boolean))];
    const specificLegs = raw.some(m => ["Quads","Hamstrings","Glutes","Calves"].includes(m));
    return raw.filter(m => !(m === "Legs" && specificLegs));
  }

  function zonesFor(workout){
    const zones = new Set();
    musclesFor(workout).forEach(muscle => {
      const key = muscle.toLowerCase();
      if(key.includes("chest")) zones.add("chest");
      if(key.includes("shoulder")) zones.add("front-delts");
      if(key.includes("shoulder") || key.includes("rear delt")) zones.add("rear-delts");
      if(key === "back" || key.includes("lat")) { zones.add("lats"); zones.add("upper-back"); }
      if(key.includes("trap")) zones.add("traps");
      if(key.includes("lower back")) zones.add("lower-back");
      if(key.includes("bicep")) zones.add("biceps");
      if(key.includes("tricep")) zones.add("triceps");
      if(key.includes("core") || key.includes("ab")) zones.add("abs");
      if(key.includes("quad")) zones.add("quads");
      if(key.includes("hamstring")) zones.add("hamstrings");
      if(key.includes("glute")) zones.add("glutes");
      if(key.includes("calf")) zones.add("calves");
      if(key === "legs") ["quads","hamstrings","glutes","calves"].forEach(z => zones.add(z));
    });
    return zones;
  }

  function fill(zones, zone){ return zones.has(zone) ? ACTIVE : BODY; }
  function stroke(zones, zone){ return zones.has(zone) ? ACTIVE_STROKE : DETAIL; }
  function opacity(zones, zone){ return zones.has(zone) ? "1" : ".9"; }

  function detailedBodyMarkup(workout){
    workout ||= typeof getTodayWorkout === "function" ? getTodayWorkout() : null;
    const zones = zonesFor(workout);
    const names = musclesFor(workout).join(", ") || "Full body";

    const muscle = (zone, d, extra="") => `<path d="${d}" fill="${fill(zones, zone)}" stroke="${stroke(zones, zone)}" stroke-width="1.2" opacity="${opacity(zones, zone)}" ${extra}/>`;
    const ellipse = (zone, cx, cy, rx, ry, extra="") => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill(zones, zone)}" stroke="${stroke(zones, zone)}" stroke-width="1.2" opacity="${opacity(zones, zone)}" ${extra}/>`;

    return `
      <div class="sn-anatomy-wrap" aria-label="Muscle focus: ${escapeHtml(names)}">
        <svg class="sn-anatomy-svg" viewBox="0 0 340 285" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Detailed front and back muscle map showing today's focus">
          <defs>
            <filter id="snBodyShadow" x="-20%" y="-20%" width="140%" height="150%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#7b8490" flood-opacity=".16"/>
            </filter>
          </defs>

          <g transform="translate(12 5)" filter="url(#snBodyShadow)">
            <text x="75" y="11" text-anchor="middle" class="sn-anatomy-side-label">FRONT</text>
            <circle cx="75" cy="34" r="17" fill="#F7F8FA" stroke="${OUTLINE}" stroke-width="2.2"/>
            <path d="M66 51 Q75 56 84 51" fill="none" stroke="${DETAIL}" stroke-width="1.2"/>
            <path d="M54 57 Q63 49 75 52 Q87 49 96 57 L105 83 L97 120 L94 154 L91 220 Q86 253 81 263 H70 Q65 253 61 220 L58 154 L54 120 L45 83 Z" fill="#F7F8FA" stroke="${OUTLINE}" stroke-width="2.3" stroke-linejoin="round"/>
            <path d="M49 67 L31 78 L15 117 L24 121 L43 91 L53 82" fill="#F7F8FA" stroke="${OUTLINE}" stroke-width="2.3" stroke-linejoin="round"/>
            <path d="M101 67 L119 78 L135 117 L126 121 L107 91 L97 82" fill="#F7F8FA" stroke="${OUTLINE}" stroke-width="2.3" stroke-linejoin="round"/>

            ${muscle("chest", "M58 61 Q66 56 74 61 L74 85 Q64 84 56 75 Z")}
            ${muscle("chest", "M76 61 Q84 56 92 61 L94 75 Q86 84 76 85 Z")}
            ${ellipse("front-delts", 51, 68, 9, 11, 'transform="rotate(22 51 68)"')}
            ${ellipse("front-delts", 99, 68, 9, 11, 'transform="rotate(-22 99 68)"')}
            ${ellipse("biceps", 37, 91, 6.5, 14, 'transform="rotate(24 37 91)"')}
            ${ellipse("biceps", 113, 91, 6.5, 14, 'transform="rotate(-24 113 91)"')}

            ${muscle("abs", "M63 91 Q68 87 73 90 L73 105 H62 Z")}
            ${muscle("abs", "M77 90 Q82 87 87 91 L88 105 H77 Z")}
            ${muscle("abs", "M62 108 H73 V123 H61 Z")}
            ${muscle("abs", "M77 108 H89 L90 123 H77 Z")}
            ${muscle("abs", "M61 126 H73 V141 H60 Z")}
            ${muscle("abs", "M77 126 H90 L91 141 H77 Z")}
            <path d="M75 88 V145" stroke="${DETAIL}" stroke-width="1"/>

            ${muscle("quads", "M57 151 Q63 144 70 149 L71 196 Q64 201 58 194 Z")}
            ${muscle("quads", "M79 149 Q87 144 93 151 L92 194 Q86 201 79 196 Z")}
            ${muscle("quads", "M69 151 Q74 147 75 151 L75 198 Q72 201 70 196 Z")}
            ${muscle("quads", "M75 151 Q77 147 81 151 L80 196 Q78 201 75 198 Z")}
            ${muscle("calves", "M59 202 Q66 197 70 205 L68 244 Q63 248 60 240 Z")}
            ${muscle("calves", "M80 205 Q84 197 91 202 L90 240 Q87 248 82 244 Z")}

            <path d="M58 147 Q67 143 75 147 Q83 143 92 147" fill="none" stroke="${DETAIL}" stroke-width="1.2"/>
            <path d="M59 199 Q66 196 70 201 M80 201 Q84 196 91 199" fill="none" stroke="${DETAIL}" stroke-width="1"/>
          </g>

          <g transform="translate(183 5)" filter="url(#snBodyShadow)">
            <text x="75" y="11" text-anchor="middle" class="sn-anatomy-side-label">BACK</text>
            <circle cx="75" cy="34" r="17" fill="#F7F8FA" stroke="${OUTLINE}" stroke-width="2.2"/>
            <path d="M54 57 Q63 49 75 52 Q87 49 96 57 L105 83 L97 120 L94 154 L91 220 Q86 253 81 263 H70 Q65 253 61 220 L58 154 L54 120 L45 83 Z" fill="#F7F8FA" stroke="${OUTLINE}" stroke-width="2.3" stroke-linejoin="round"/>
            <path d="M49 67 L31 78 L15 117 L24 121 L43 91 L53 82" fill="#F7F8FA" stroke="${OUTLINE}" stroke-width="2.3" stroke-linejoin="round"/>
            <path d="M101 67 L119 78 L135 117 L126 121 L107 91 L97 82" fill="#F7F8FA" stroke="${OUTLINE}" stroke-width="2.3" stroke-linejoin="round"/>

            ${muscle("traps", "M62 56 Q75 50 88 56 L84 72 L75 66 L66 72 Z")}
            ${ellipse("rear-delts", 51, 68, 9, 11, 'transform="rotate(22 51 68)"')}
            ${ellipse("rear-delts", 99, 68, 9, 11, 'transform="rotate(-22 99 68)"')}
            ${muscle("upper-back", "M58 67 Q67 63 74 69 L72 91 Q63 89 56 80 Z")}
            ${muscle("upper-back", "M76 69 Q83 63 92 67 L94 80 Q87 89 78 91 Z")}
            ${muscle("lats", "M54 78 Q61 87 70 92 L67 119 Q57 116 50 101 Z")}
            ${muscle("lats", "M96 78 Q89 87 80 92 L83 119 Q93 116 100 101 Z")}
            ${ellipse("triceps", 37, 91, 6.5, 15, 'transform="rotate(24 37 91)"')}
            ${ellipse("triceps", 113, 91, 6.5, 15, 'transform="rotate(-24 113 91)"')}
            ${muscle("lower-back", "M66 101 Q75 96 84 101 L87 126 Q75 132 63 126 Z")}

            ${ellipse("glutes", 67, 143, 11, 10, 'transform="rotate(-7 67 143)"')}
            ${ellipse("glutes", 83, 143, 11, 10, 'transform="rotate(7 83 143)"')}
            ${muscle("hamstrings", "M57 154 Q64 148 71 153 L70 195 Q64 200 58 193 Z")}
            ${muscle("hamstrings", "M79 153 Q86 148 93 154 L92 193 Q86 200 80 195 Z")}
            ${muscle("calves", "M59 202 Q66 197 70 205 L68 244 Q63 248 60 240 Z")}
            ${muscle("calves", "M80 205 Q84 197 91 202 L90 240 Q87 248 82 244 Z")}

            <path d="M75 56 V126" stroke="${DETAIL}" stroke-width="1.1"/>
            <path d="M62 130 Q75 135 88 130" fill="none" stroke="${DETAIL}" stroke-width="1.1"/>
            <path d="M59 199 Q66 196 70 201 M80 201 Q84 196 91 199" fill="none" stroke="${DETAIL}" stroke-width="1"/>
          </g>
        </svg>
        <div class="sn-body-label">BLUE = TODAY’S FOCUS</div>
      </div>`;
  }

  function installStyles(){
    if(document.getElementById("sn-anatomy-v28-styles")) return;
    const style = document.createElement("style");
    style.id = "sn-anatomy-v28-styles";
    style.textContent = `
      .sn-anatomy-wrap{width:100%;max-width:315px;margin:auto}
      .sn-anatomy-svg{display:block;width:100%;height:auto;overflow:visible}
      .sn-anatomy-side-label{font:800 9px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:.11em;fill:var(--muted)}
      .dark .sn-anatomy-svg{filter:drop-shadow(0 7px 15px rgba(0,0,0,.18))}
      @media (max-width:560px){.sn-anatomy-wrap{max-width:275px}}
    `;
    document.head.appendChild(style);
  }

  function patchBody(){
    const workout = typeof getTodayWorkout === "function" ? getTodayWorkout() : null;
    const body = document.querySelector(".body-visual");
    if(body && workout) body.innerHTML = detailedBodyMarkup(workout);
  }

  installStyles();

  // Make every normal Home render use the detailed diagram.
  if(typeof bodySvg === "function") bodySvg = workout => detailedBodyMarkup(workout || (typeof getTodayWorkout === "function" ? getTodayWorkout() : null));

  if(typeof renderHome === "function"){
    const previousRenderHome = renderHome;
    renderHome = function(){
      const result = previousRenderHome();
      patchBody();
      return result;
    };
  }

  patchBody();
})();