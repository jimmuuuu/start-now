// START/NOW v26 — dynamic muscle-focus diagram + muscle classification cleanup.
(() => {
  const BLUE = "#3B82F6";
  const OUTLINE = "#8e949c";
  const BODY = "#f6f7f8";
  const DETAIL = "#c8ccd1";

  function normalizeMuscle(exercise){
    const name = String(exercise?.name || "").toLowerCase();
    const muscle = String(exercise?.muscle || "Other");

    // Romanian deadlifts were accidentally classified as Back in the original
    // exercise library. They are a hip-hinge movement whose main target here is hamstrings.
    if(name.includes("romanian deadlift")) return "Hamstrings";
    return muscle;
  }

  function repairRomanianDeadlifts(){
    let changed = false;

    if(Array.isArray(exerciseLibrary)){
      exerciseLibrary.forEach(exercise => {
        if(String(exercise?.name || "").toLowerCase().includes("romanian deadlift") && exercise.muscle !== "Hamstrings"){
          exercise.muscle = "Hamstrings";
          exercise.cue = exercise.cue || "Hinge at the hips, keep the weight close, and control the stretch in your hamstrings.";
          changed = true;
        }
      });
    }

    state.customWorkouts = (state.customWorkouts || []).map(workout => ({
      ...workout,
      exercises: (workout.exercises || []).map(exercise => {
        if(String(exercise?.name || "").toLowerCase().includes("romanian deadlift") && exercise.muscle !== "Hamstrings"){
          changed = true;
          return {
            ...exercise,
            muscle: "Hamstrings",
            cue: exercise.cue || "Hinge at the hips, keep the weight close, and control the stretch in your hamstrings."
          };
        }
        return exercise;
      })
    }));

    if(changed && typeof saveCustomWorkouts === "function") saveCustomWorkouts();
  }

  function focusMuscles(workout){
    const raw = [...new Set((workout?.exercises || []).map(normalizeMuscle).filter(Boolean))];
    const lowerSpecific = raw.some(muscle => ["Quads", "Hamstrings", "Glutes", "Calves"].includes(muscle));
    const cleaned = raw.filter(muscle => !(muscle === "Legs" && lowerSpecific));
    return cleaned.length ? cleaned : ["Full body"];
  }

  function focusZones(workout){
    const muscles = new Set(focusMuscles(workout));
    const zones = new Set();

    muscles.forEach(muscle => {
      const key = String(muscle).toLowerCase();
      if(key === "full body") ["chest","shoulders","back","core","quads","hamstrings","glutes","calves"].forEach(zone => zones.add(zone));
      if(key.includes("chest")) zones.add("chest");
      if(key.includes("shoulder")) zones.add("shoulders");
      if(key.includes("rear delt")) zones.add("rear-delts");
      if(key.includes("back") || key.includes("lat")) zones.add("back");
      if(key.includes("bicep")) zones.add("biceps");
      if(key.includes("tricep")) zones.add("triceps");
      if(key.includes("core") || key.includes("ab")) zones.add("core");
      if(key.includes("quad")) zones.add("quads");
      if(key.includes("hamstring")) zones.add("hamstrings");
      if(key.includes("glute")) zones.add("glutes");
      if(key.includes("calf")) zones.add("calves");
      if(key === "legs") ["quads","hamstrings","glutes","calves"].forEach(zone => zones.add(zone));
    });

    return zones;
  }

  function fill(zones, zone){
    return zones.has(zone) ? BLUE : "transparent";
  }

  function dynamicBodyMarkup(workout){
    const zones = focusZones(workout);
    const names = focusMuscles(workout).join(", ");

    return `
      <div class="sn-dynamic-body-wrap" aria-label="Muscle focus: ${escapeHtml(names)}">
        <svg class="sn-dynamic-body-svg" viewBox="0 0 260 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Front and back body showing today's highlighted muscles">
          <g transform="translate(5 0)">
            <text x="58" y="13" text-anchor="middle" class="sn-body-side-label">FRONT</text>
            <circle cx="58" cy="34" r="16" fill="${BODY}" stroke="${OUTLINE}" stroke-width="2.5"/>
            <path d="M42 54 C48 49 53 49 58 52 C63 49 68 49 74 54 L88 75 L80 113 L76 146 L71 215 H61 L58 151 L55 215 H45 L40 146 L36 113 L28 75 Z" fill="${BODY}" stroke="${OUTLINE}" stroke-width="2.5" stroke-linejoin="round"/>
            <path d="M30 72 L14 104 L7 100 L23 62 L40 54" fill="${BODY}" stroke="${OUTLINE}" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M86 72 L102 104 L109 100 L93 62 L76 54" fill="${BODY}" stroke="${OUTLINE}" stroke-width="2.5" stroke-linecap="round"/>

            <path d="M39 57 C45 52 51 53 58 57 C65 53 71 52 77 57 L80 74 C72 82 66 86 58 86 C50 86 44 82 36 74 Z" fill="${fill(zones,"chest")}"/>
            <ellipse cx="31" cy="68" rx="9" ry="11" fill="${fill(zones,"shoulders")}"/>
            <ellipse cx="85" cy="68" rx="9" ry="11" fill="${fill(zones,"shoulders")}"/>
            <ellipse cx="20" cy="84" rx="6" ry="13" transform="rotate(27 20 84)" fill="${fill(zones,"biceps")}"/>
            <ellipse cx="96" cy="84" rx="6" ry="13" transform="rotate(-27 96 84)" fill="${fill(zones,"biceps")}"/>
            <path d="M47 91 H69 L67 126 H49 Z" rx="7" fill="${fill(zones,"core")}"/>
            <path d="M40 132 L56 132 L55 176 L44 176 Z" fill="${fill(zones,"quads")}"/>
            <path d="M60 132 L76 132 L72 176 L61 176 Z" fill="${fill(zones,"quads")}"/>
            <path d="M44 177 L55 177 L53 211 L46 211 Z" fill="${fill(zones,"calves")}"/>
            <path d="M61 177 L72 177 L70 211 L63 211 Z" fill="${fill(zones,"calves")}"/>
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
            <path d="M40 57 C47 53 52 54 58 58 C64 54 69 53 76 57 L80 86 L70 111 H46 L36 86 Z" fill="${fill(zones,"back")}"/>
            <ellipse cx="20" cy="84" rx="6" ry="13" transform="rotate(27 20 84)" fill="${fill(zones,"triceps")}"/>
            <ellipse cx="96" cy="84" rx="6" ry="13" transform="rotate(-27 96 84)" fill="${fill(zones,"triceps")}"/>
            <ellipse cx="50" cy="128" rx="10" ry="9" fill="${fill(zones,"glutes")}"/>
            <ellipse cx="66" cy="128" rx="10" ry="9" fill="${fill(zones,"glutes")}"/>
            <path d="M40 139 L55 139 L54 176 L44 176 Z" fill="${fill(zones,"hamstrings")}"/>
            <path d="M61 139 L76 139 L72 176 L62 176 Z" fill="${fill(zones,"hamstrings")}"/>
            <path d="M44 177 L55 177 L53 211 L46 211 Z" fill="${fill(zones,"calves")}"/>
            <path d="M61 177 L72 177 L70 211 L63 211 Z" fill="${fill(zones,"calves")}"/>
            <path d="M58 59 V112" stroke="${DETAIL}" stroke-width="1.6" opacity=".8"/>
          </g>
        </svg>
        <div class="sn-body-label">BLUE = TODAY’S FOCUS</div>
      </div>`;
  }

  function installStyles(){
    if(document.getElementById("sn-dynamic-focus-styles")) return;
    const style = document.createElement("style");
    style.id = "sn-dynamic-focus-styles";
    style.textContent = `
      .sn-dynamic-body-wrap{width:100%;max-width:230px;margin:auto}
      .sn-dynamic-body-svg{display:block;width:100%;height:auto;overflow:visible}
      .sn-body-side-label{font:800 9px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:.08em;fill:var(--muted)}
      .dark .sn-dynamic-body-svg{filter:drop-shadow(0 8px 18px rgba(0,0,0,.18))}
    `;
    document.head.appendChild(style);
  }

  function patchFocusCard(workout){
    const body = document.querySelector(".body-visual");
    const copy = document.querySelector(".focus-copy");
    if(!body || !copy || !workout) return;

    const muscles = focusMuscles(workout).slice(0, 4);
    body.innerHTML = dynamicBodyMarkup(workout);

    const heading = copy.querySelector("h3");
    if(heading) heading.textContent = muscles.join(", ");

    const list = copy.querySelector(".muscle-list");
    if(list){
      list.innerHTML = muscles.map((muscle, index) => `
        <div class="muscle-row">
          <span><i class="dot"></i>${escapeHtml(muscle)}</span>
          <span>${index === 0 ? "Primary" : "Focus"}</span>
        </div>`).join("");
    }
  }

  installStyles();
  repairRomanianDeadlifts();

  // Keep the existing function available to every Home renderer, but make it dynamic.
  if(typeof bodySvg === "function"){
    bodySvg = () => dynamicBodyMarkup(typeof getTodayWorkout === "function" ? getTodayWorkout() : null);
  }

  if(typeof workoutMuscles === "function"){
    workoutMuscles = workout => focusMuscles(workout).slice(0, 4).join(", ");
  }

  const previousRenderHome = renderHome;
  renderHome = function(){
    const result = previousRenderHome();
    patchFocusCard(getTodayWorkout());
    return result;
  };

  // Refresh the current screen so the corrected focus graphic appears immediately.
  if(typeof render === "function") render();
})();
