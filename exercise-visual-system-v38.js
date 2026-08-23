// START/NOW v38 — exercise-specific visuals with safe fallbacks. Accuracy over decoration.
(() => {
  const SN = window.SN36;
  const BLUE = "#3B82F6";
  const DARK = "#111827";
  const MUTED = "#8B919B";
  const LINE = "#D8DDE4";
  const BG = "#F7F9FC";
  let patching = false;

  function esc(value = "") {
    return typeof escapeHtml === "function" ? escapeHtml(String(value)) : String(value);
  }

  function slug(value = "") {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function exerciseId(ex) {
    return ex?.id || SN?.exerciseId?.(ex) || slug(ex?.name || "exercise");
  }

  function equipment(ex) {
    const name = String(ex?.name || "").toLowerCase();
    if (/smith/.test(name)) return "Smith Machine";
    if (/lat pulldown|pulldown|pushdown|cable|face pull|wood chop|pallof/.test(name)) return "Cable";
    if (/dumbbell/.test(name)) return "Dumbbell";
    if (/barbell|ez-bar|ez bar/.test(name)) return "Barbell";
    if (/kettlebell/.test(name)) return "Kettlebell";
    if (/leg press|machine|pec deck|leg extension|leg curl|hip abduction|hip adduction|glute drive/.test(name)) return "Machine";
    if (/push-up|push up|pull-up|pull up|chin-up|chin up|dip|plank|bodyweight|bird dog|dead bug|bear crawl|glute bridge|donkey kick|lunge/.test(name)) return "Bodyweight";
    if (/treadmill|bike|elliptical|stair|rowing machine|ski erg|jump rope/.test(name)) return "Cardio";
    return SN?.meta?.(ex)?.equipment || "Gym";
  }

  // Central ID-first map. `image` is ready for future photo/WebP assets; currently verified
  // exercises use consistent inline illustrations so there are no external-image failures.
  const exerciseImages = {
    "barbell-bench-press": {visual:"bench-barbell", equipment:"Barbell"},
    "incline-barbell-bench-press": {visual:"bench-barbell", equipment:"Barbell"},
    "decline-barbell-bench-press": {visual:"bench-barbell", equipment:"Barbell"},
    "dumbbell-bench-press": {visual:"bench-dumbbell", equipment:"Dumbbell"},
    "incline-dumbbell-bench-press": {visual:"bench-dumbbell", equipment:"Dumbbell"},
    "decline-dumbbell-bench-press": {visual:"bench-dumbbell", equipment:"Dumbbell"},
    "smith-machine-bench-press": {visual:"bench-smith", equipment:"Smith Machine"},
    "smith-machine-incline-press": {visual:"bench-smith", equipment:"Smith Machine"},
    "machine-chest-press": {visual:"chest-press-machine", equipment:"Machine"},
    "chest-press": {visual:"chest-press-machine", equipment:"Machine"},
    "lat-pulldown": {visual:"lat-pulldown", equipment:"Cable"},
    "triceps-pushdown": {visual:"triceps-pushdown", equipment:"Cable"},
    "leg-press": {visual:"leg-press", equipment:"Machine"},
    "seated-row": {visual:"seated-row-cable", equipment:"Cable"},
    "cable-row": {visual:"seated-row-cable", equipment:"Cable"},
    "barbell-row": {visual:"barbell-row", equipment:"Barbell"},
    "bent-over-barbell-row": {visual:"barbell-row", equipment:"Barbell"},
    "one-arm-dumbbell-row": {visual:"dumbbell-row", equipment:"Dumbbell"},
    "single-arm-dumbbell-row": {visual:"dumbbell-row", equipment:"Dumbbell"},
    "dumbbell-row": {visual:"dumbbell-row", equipment:"Dumbbell"},
    "romanian-deadlift": {visual:"rdl-barbell", equipment:"Barbell"},
    "barbell-romanian-deadlift": {visual:"rdl-barbell", equipment:"Barbell"},
    "dumbbell-romanian-deadlift": {visual:"rdl-dumbbell", equipment:"Dumbbell"},
    "push-up": {visual:"push-up", equipment:"Bodyweight"},
    "wide-grip-push-up": {visual:"push-up", equipment:"Bodyweight"},
    "close-grip-push-up": {visual:"push-up", equipment:"Bodyweight"},
    "incline-push-up": {visual:"push-up", equipment:"Bodyweight"},
    "decline-push-up": {visual:"push-up", equipment:"Bodyweight"},
    "plank": {visual:"plank", equipment:"Bodyweight"},
    "pull-up": {visual:"pull-up", equipment:"Bodyweight"},
    "assisted-pull-up": {visual:"pull-up", equipment:"Machine"},
    "chest-dip": {visual:"dip", equipment:"Bodyweight"},
    "dip": {visual:"dip", equipment:"Bodyweight"},
    "bodyweight-squat": {visual:"bodyweight-squat", equipment:"Bodyweight"},
    "supported-reverse-lunge": {visual:"lunge", equipment:"Bodyweight"},
    "reverse-lunge": {visual:"lunge", equipment:"Bodyweight"},
    "walking-lunge": {visual:"lunge", equipment:"Bodyweight"}
  };

  // Alias rules are only used when an older/custom exercise lacks the same stable ID.
  // They are deliberately conservative; anything uncertain falls back instead of showing
  // a misleading movement.
  const aliasRules = [
    [/dumbbell.*romanian deadlift|romanian deadlift.*dumbbell/i, "rdl-dumbbell", "Dumbbell"],
    [/romanian deadlift|\brdl\b/i, "rdl-barbell", "Barbell"],
    [/lat pulldown/i, "lat-pulldown", "Cable"],
    [/triceps? pushdown/i, "triceps-pushdown", "Cable"],
    [/leg press/i, "leg-press", "Machine"],
    [/smith.*bench|bench.*smith/i, "bench-smith", "Smith Machine"],
    [/dumbbell.*bench|bench.*dumbbell/i, "bench-dumbbell", "Dumbbell"],
    [/barbell.*bench|bench.*barbell/i, "bench-barbell", "Barbell"],
    [/machine chest press|^chest press$/i, "chest-press-machine", "Machine"],
    [/seated (cable )?row|cable row/i, "seated-row-cable", "Cable"],
    [/barbell row/i, "barbell-row", "Barbell"],
    [/dumbbell row/i, "dumbbell-row", "Dumbbell"],
    [/dumbbell (biceps )?curl|dumbbell curl/i, "dumbbell-curl", "Dumbbell"],
    [/push[- ]?up/i, "push-up", "Bodyweight"],
    [/\bplank\b/i, "plank", "Bodyweight"],
    [/pull[- ]?up|chin[- ]?up/i, "pull-up", "Bodyweight"],
    [/\bdip\b/i, "dip", "Bodyweight"],
    [/bodyweight squat/i, "bodyweight-squat", "Bodyweight"],
    [/\blunge\b/i, "lunge", "Bodyweight"]
  ];

  function resolveVisual(ex) {
    const id = exerciseId(ex);
    const explicit = exerciseImages[id];
    if (explicit) return {id, kind: explicit.image ? "image" : "illustration", image: explicit.image || null, visual: explicit.visual, equipment: explicit.equipment || equipment(ex), verified: true};
    const name = String(ex?.name || "");
    for (const [pattern, visual, eq] of aliasRules) {
      if (pattern.test(name)) return {id, kind:"illustration", image:null, visual, equipment:eq, verified:true, alias:true};
    }
    return {id, kind:"fallback", image:null, visual:"fallback", equipment:equipment(ex), verified:false};
  }

  function equipmentIcon(type) {
    const common = `fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"`;
    if (type === "Dumbbell") return `<svg viewBox="0 0 40 40" ${common}><path d="M5 16v8M9 12v16M13 16v8M27 16v8M31 12v16M35 16v8M13 20h14"/></svg>`;
    if (type === "Barbell") return `<svg viewBox="0 0 40 40" ${common}><path d="M3 15v10M7 11v18M12 15v10M28 15v10M33 11v18M37 15v10M12 20h16"/></svg>`;
    if (type === "Cable") return `<svg viewBox="0 0 40 40" ${common}><rect x="7" y="5" width="10" height="30" rx="2"/><path d="M12 10h18M30 10v9M25 19h10M30 19l-5 12M30 19l5 12"/></svg>`;
    if (type === "Smith Machine") return `<svg viewBox="0 0 40 40" ${common}><path d="M8 5v30M32 5v30M8 8h24M8 32h24M11 18h18M14 15v6M26 15v6"/></svg>`;
    if (type === "Bodyweight") return `<svg viewBox="0 0 40 40" ${common}><circle cx="20" cy="8" r="4"/><path d="M20 12v10M10 18l10 4 10-4M14 35l6-13 6 13"/></svg>`;
    if (type === "Cardio") return `<svg viewBox="0 0 40 40" ${common}><path d="M4 22h7l4-10 7 18 5-10h9"/></svg>`;
    if (type === "Machine") return `<svg viewBox="0 0 40 40" ${common}><rect x="9" y="5" width="22" height="30" rx="3"/><path d="M14 11h12M14 17h12M14 23h12M14 29h12"/></svg>`;
    return `<svg viewBox="0 0 40 40" ${common}><circle cx="20" cy="20" r="14"/><path d="M12 20h16M20 12v16"/></svg>`;
  }

  function shell(label, content) {
    return `<svg viewBox="0 0 320 190" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(label)} illustration">
      <rect x="1" y="1" width="318" height="188" rx="22" fill="${BG}" stroke="${LINE}"/>
      <g fill="none" stroke="${DARK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${content}</g>
    </svg>`;
  }

  function personHead(x,y,r=10){return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/>`;}
  function barbell(x1,y,x2){return `<path d="M${x1} ${y}H${x2}"/><path d="M${x1+6} ${y-10}v20M${x1+11} ${y-7}v14M${x2-6} ${y-10}v20M${x2-11} ${y-7}v14"/>`;}

  const illustrations = {
    "rdl-barbell": () => shell("Romanian Deadlift", `${personHead(120,42)}<path d="M120 54l-12 40 38 18 22 42M108 94l-22 45M108 94l45 18M86 139l-5 26M168 154l7 20"/>${barbell(78,136,178)}`),
    "rdl-dumbbell": () => shell("Dumbbell Romanian Deadlift", `${personHead(120,42)}<path d="M120 54l-12 40 38 18 22 42M108 94l-22 45M108 94l45 18M86 139l-5 26M168 154l7 20"/><rect x="72" y="132" width="18" height="10" rx="3"/><rect x="145" y="109" width="18" height="10" rx="3"/>`),
    "lat-pulldown": () => shell("Lat Pulldown", `<path d="M55 30v125M55 35h165M220 35v35M190 70h60M220 70v20"/>${personHead(160,82)}<path d="M160 94v42M160 105l-33-25M160 105l33-25M127 80l-20-5M193 80l20-5M146 136l-18 27M174 136l18 27M125 139h70"/>`),
    "triceps-pushdown": () => shell("Triceps Pushdown", `<rect x="55" y="28" width="42" height="132" rx="6"/><path d="M76 38v96M76 38h110M186 38v55M176 93h20"/>${personHead(214,67)}<path d="M214 79v55M214 91l-24 20M190 111v34M214 134l-14 31M214 134l17 31"/>`),
    "leg-press": () => shell("Leg Press", `<path d="M52 151l66-85M118 66l77-31M110 73l80 60M190 133l40-48"/><rect x="43" y="133" width="58" height="18" rx="8"/>${personHead(115,116)}<path d="M108 124l-28 19M116 125l31-22M147 103l32 7M179 110l20-22"/><path d="M196 62l32 55"/>`),
    "dumbbell-curl": () => shell("Dumbbell Curl", `${personHead(160,42)}<path d="M160 55v65M160 70l-28 25M132 95l18 18M160 70l28 25M188 95l-18 18M145 120l-17 45M175 120l17 45"/><rect x="143" y="106" width="17" height="9" rx="3"/><rect x="160" y="106" width="17" height="9" rx="3"/>`),
    "bench-barbell": () => shell("Barbell Bench Press", `<path d="M65 139h155M92 139v18M195 139v18"/>${personHead(120,112)}<path d="M130 115l65 8M130 115l-28 18M195 123l20 16"/>${barbell(70,78,245)}<path d="M137 110l-18-32M182 120l17-42"/>`),
    "bench-dumbbell": () => shell("Dumbbell Bench Press", `<path d="M65 139h155M92 139v18M195 139v18"/>${personHead(120,112)}<path d="M130 115l65 8M130 115l-28 18M195 123l20 16M137 110l-18-32M182 120l17-42"/><rect x="108" y="70" width="22" height="10" rx="3"/><rect x="188" y="70" width="22" height="10" rx="3"/>`),
    "bench-smith": () => shell("Smith Machine Bench Press", `<path d="M55 28v137M255 28v137M55 35h200M55 158h200M65 79h180"/><path d="M80 139h145M102 139v18M200 139v18"/>${personHead(128,112)}<path d="M138 115l62 8M138 115l-28 18M144 109l-18-30M188 120l17-41"/>`),
    "chest-press-machine": () => shell("Machine Chest Press", `<path d="M82 45v112M82 52h120M202 52v105M105 105h58M110 105v45M105 150h65"/>${personHead(135,82)}<path d="M135 94v44M135 105l-30 5M105 110l-24-8M135 105l30 5M165 110l24-8M123 138l-10 20M147 138l10 20"/>`),
    "seated-row-cable": () => shell("Seated Cable Row", `<rect x="45" y="38" width="40" height="110" rx="5"/><path d="M65 48h130M195 48v48M195 96h25"/><path d="M108 139h90"/>${personHead(135,92)}<path d="M135 104v35M135 115l30-13M165 102l30-6M135 139l-20 22M135 139l35 22"/>`),
    "barbell-row": () => shell("Barbell Row", `${personHead(120,52)}<path d="M120 64l20 38 48 8M140 102l-15 48M188 110l16 46M140 102l-35 24M140 102l40 24"/>${barbell(94,126,204)}`),
    "dumbbell-row": () => shell("One-Arm Dumbbell Row", `<path d="M70 135h120M95 135v18M175 135v18"/>${personHead(145,65)}<path d="M145 77l-28 34M117 111l-28 24M117 111l43 9M160 120l15 36M117 111l-5 41"/><rect x="153" y="115" width="20" height="10" rx="3"/>`),
    "push-up": () => shell("Push-Up", `${personHead(94,95)}<path d="M105 99l92 29M105 99l-28 34M197 128l30 24M77 133h-24M227 152h26"/>`),
    "plank": () => shell("Plank", `${personHead(95,92)}<path d="M106 97l92 30M106 97l-25 36M198 127l31 25M81 133H55M229 152h27"/>`),
    "pull-up": () => shell("Pull-Up", `<path d="M75 40h170M95 40v15M225 40v15"/>${personHead(160,86)}<path d="M160 98v47M160 105l-40-48M160 105l40-48M145 145l-18 27M175 145l18 27"/>`),
    "dip": () => shell("Dip", `<path d="M85 78h60M175 78h60M95 78v88M225 78v88"/>${personHead(160,70)}<path d="M160 82v55M160 94l-28 16M132 110l-16-29M160 94l28 16M188 110l16-29M150 137l-12 30M170 137l12 30"/>`),
    "bodyweight-squat": () => shell("Bodyweight Squat", `${personHead(160,46)}<path d="M160 58v50M160 73l-31 18M160 73l31 18M160 108l-35 24M125 132l-20 31M160 108l35 24M195 132l20 31"/>`),
    "lunge": () => shell("Lunge", `${personHead(155,44)}<path d="M155 56v58M155 72l-28 20M155 72l28 20M155 114l-40 21M115 135l-30 24M155 114l41 30M196 144l28 4"/>`)
  };

  function illustrationMarkup(ex, resolved) {
    const factory = illustrations[resolved.visual];
    if (!factory) return fallbackMarkup(ex, resolved);
    return `<div class="sn-v38-specific" data-visual-kind="illustration">${factory()}</div>`;
  }

  function fallbackMarkup(ex, resolved = resolveVisual(ex)) {
    return `<div class="sn-v38-fallback" data-visual-kind="fallback">
      <div class="sn-v38-eq-icon">${equipmentIcon(resolved.equipment)}</div>
      <div><strong>${esc(ex?.name || "Exercise")}</strong><span>Exercise demonstration coming soon</span><small>${esc(resolved.equipment)} • ${esc(ex?.muscle || "Exercise")}</small></div>
    </div>`;
  }

  function imageMarkup(ex, resolved) {
    return `<div class="sn-v38-image-wrap"><img class="sn-v38-image" loading="lazy" decoding="async" src="${esc(resolved.image)}" alt="${esc(ex?.name || "Exercise")} demonstration" data-v38-img></div>`;
  }

  function visualMarkup(ex, compact = false) {
    const resolved = resolveVisual(ex);
    const media = resolved.kind === "image" ? imageMarkup(ex, resolved) : resolved.kind === "illustration" ? illustrationMarkup(ex, resolved) : fallbackMarkup(ex, resolved);
    return `<section class="sn-v38-exercise-visual ${compact ? "compact" : ""}" data-exercise-id="${esc(resolved.id)}">
      <div class="sn-v38-visual-head"><div><span>EXERCISE DEMO</span><strong>${esc(ex?.name || "Exercise")}</strong></div><small>${esc(resolved.equipment)}</small></div>
      <div class="sn-v38-media">${media}</div>
    </section>`;
  }

  function bindImageErrors(root, ex) {
    root.querySelectorAll("[data-v38-img]").forEach(img => {
      img.addEventListener("error", () => {
        const media = img.closest(".sn-v38-media");
        if (media) media.innerHTML = fallbackMarkup(ex);
      }, { once:true });
    });
  }

  function currentExercise() {
    if (SN?.active?.exercises?.length) return SN.active.exercises[Number(SN.active.index || 0)] || null;
    return state?.activeWorkout?.exercises?.[Number(state?.workoutIndex || 0)] || null;
  }

  function currentIndex() {
    return SN?.active?.exercises?.length ? Number(SN.active.index || 0) : Number(state?.workoutIndex || 0);
  }

  function previousExercise() {
    const index = currentIndex();
    if (index <= 0) return;
    if (SN?.active?.exercises?.length) {
      SN.active.index = index - 1;
      SN.write?.(SN.keys.active, SN.active);
    } else state.workoutIndex = index - 1;
    render();
  }

  function installStyles() {
    if (document.getElementById("sn-v38-exercise-visual-styles")) return;
    const style = document.createElement("style");
    style.id = "sn-v38-exercise-visual-styles";
    style.textContent = `
      .workout-screen>.exercise-visual,.sn-exercise-focus-panel{display:none!important}
      .sn-v38-exercise-visual{margin:14px 0 18px;border:1px solid var(--line);border-radius:22px;background:var(--surface);overflow:hidden;box-shadow:0 12px 28px rgba(17,24,39,.05)}
      .sn-v38-visual-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;padding:14px 16px 10px}.sn-v38-visual-head>div{display:grid;gap:3px}.sn-v38-visual-head span{font-size:9px;font-weight:900;letter-spacing:.1em;color:var(--blue)}.sn-v38-visual-head strong{font-size:15px;color:var(--text)}.sn-v38-visual-head small{font-size:10px;color:var(--muted);font-weight:800}
      .sn-v38-media{aspect-ratio:16/9;min-height:170px;display:flex;align-items:center;justify-content:center;padding:8px 14px 16px;background:linear-gradient(180deg,var(--surface),rgba(59,130,246,.025));overflow:hidden}
      .sn-v38-specific{width:100%;height:100%;display:flex;align-items:center;justify-content:center}.sn-v38-specific svg{display:block;width:100%;height:100%;max-height:230px;object-fit:contain}
      .sn-v38-image-wrap{width:100%;height:100%;display:flex;align-items:center;justify-content:center}.sn-v38-image{width:100%;height:100%;object-fit:contain;display:block;border-radius:16px}
      .sn-v38-fallback{width:100%;min-height:160px;display:flex;align-items:center;justify-content:center;gap:18px;padding:22px;border:1px dashed rgba(139,145,155,.45);border-radius:18px;background:rgba(139,145,155,.045);color:var(--text)}.sn-v38-eq-icon{width:70px;height:70px;flex:0 0 70px;border-radius:20px;background:rgba(59,130,246,.08);color:var(--blue);display:grid;place-items:center}.sn-v38-eq-icon svg{width:42px;height:42px}.sn-v38-fallback>div:last-child{display:grid;gap:4px}.sn-v38-fallback strong{font-size:15px}.sn-v38-fallback span{font-size:12px;color:var(--muted)}.sn-v38-fallback small{font-size:10px;color:var(--muted);font-weight:800}
      .sn-v38-exercise-visual.compact{margin:10px 0 14px;box-shadow:none}.sn-v38-exercise-visual.compact .sn-v38-media{min-height:135px}.sn-v38-exercise-visual.compact .sn-v38-visual-head{padding:12px 14px 8px}
      .sn-v38-prev-row{display:grid;grid-template-columns:1fr;gap:10px;margin:10px 0}.sn-v38-prev{min-height:46px!important;font-weight:850!important}.sn-v38-prev:disabled{opacity:.38}
      @media(max-width:560px){.sn-v38-media{min-height:150px;padding:6px 10px 12px}.sn-v38-fallback{min-height:135px;padding:16px;gap:12px}.sn-v38-eq-icon{width:58px;height:58px;flex-basis:58px}.sn-v38-eq-icon svg{width:34px;height:34px}.sn-v38-visual-head strong{font-size:14px}}
      .dark .sn-v38-exercise-visual{box-shadow:0 12px 28px rgba(0,0,0,.18)}
    `;
    document.head.appendChild(style);
  }

  function patchWorkout() {
    if (patching || state?.page !== "activeWorkout") return;
    const screen = document.querySelector(".workout-screen");
    const ex = currentExercise();
    if (!screen || !ex) return;
    patching = true;
    try {
      screen.querySelectorAll(":scope > .exercise-visual,.sn-exercise-focus-panel,.sn-v38-exercise-visual").forEach(n => n.remove());
      const anchor = screen.querySelector(".sn-exercise-head") || screen.querySelector(".exercise-title");
      if (anchor) {
        anchor.insertAdjacentHTML(anchor.classList.contains("sn-exercise-head") ? "afterend" : "beforebegin", visualMarkup(ex));
        const visual = screen.querySelector(".sn-v38-exercise-visual");
        if (visual) bindImageErrors(visual, ex);
      }
      screen.querySelector(".sn-prev-row")?.remove();
      if (!screen.querySelector("#snV38Previous")) {
        const actions = screen.querySelector(".sn-workout-actions") || screen.querySelector(".workout-actions");
        if (actions) {
          const row = document.createElement("div");
          row.className = "sn-v38-prev-row";
          row.innerHTML = `<button class="secondary sn-v38-prev" id="snV38Previous" ${currentIndex() <= 0 ? "disabled" : ""}>← Previous exercise</button>`;
          actions.insertAdjacentElement("beforebegin", row);
          row.querySelector("#snV38Previous")?.addEventListener("click", previousExercise);
        }
      }
    } finally { patching = false; }
  }

  function patchExerciseModal() {
    const modal = document.querySelector("#snProductModal .sn-modal");
    if (!modal || modal.querySelector(".sn-v38-exercise-visual")) return;
    const title = modal.querySelector(".sn-modal-head h2")?.textContent?.trim();
    if (!title) return;
    const ex = exerciseLibrary.find(item => String(item.name).toLowerCase() === title.toLowerCase());
    if (!ex) return;
    modal.querySelector(".sn-modal-head")?.insertAdjacentHTML("afterend", visualMarkup(ex, true));
    const visual = modal.querySelector(".sn-v38-exercise-visual");
    if (visual) bindImageErrors(visual, ex);
  }

  function hydrateExerciseData() {
    if (!Array.isArray(exerciseLibrary)) return;
    exerciseLibrary.forEach(ex => {
      const resolved = resolveVisual(ex);
      // Every exercise gets a stable unique reference. `image` remains null unless a real
      // exercise-specific asset exists; the renderer will never substitute unrelated art.
      ex.imageRef = `exercise:${resolved.id}`;
      if (!("image" in ex)) ex.image = resolved.image || null;
      ex.visualKey = resolved.visual;
      ex.equipment = resolved.equipment;
      ex.primaryMuscle = ex.primaryMuscle || ex.muscle || "Other";
    });
  }

  function runAudit() {
    if (!Array.isArray(exerciseLibrary)) return [];
    const audit = exerciseLibrary.map(ex => {
      const r = resolveVisual(ex);
      return {id:r.id,name:ex.name,equipment:r.equipment,muscle:ex.muscle||"Other",status:r.verified ? "exercise-specific illustration" : "safe equipment fallback — proper demo still needed",image:r.image || null,visual:r.visual};
    });
    window.START_NOW_EXERCISE_VISUAL_AUDIT = audit;
    if (SN) SN.exerciseVisualAudit = audit;
    const specific = audit.filter(x => x.status.startsWith("exercise-specific")).length;
    console.info(`[START/NOW v38] Exercise visual audit: ${specific} specific/verified, ${audit.length-specific} safe fallbacks. No unrelated generic machine fallback is used.`);
    return audit;
  }

  window.START_NOW_EXERCISE_IMAGES = exerciseImages;
  window.START_NOW_RESOLVE_EXERCISE_VISUAL = resolveVisual;
  window.START_NOW_RENDER_EXERCISE_VISUAL = visualMarkup;

  installStyles();
  hydrateExerciseData();
  runAudit();
  const observer = new MutationObserver(() => queueMicrotask(() => { patchWorkout(); patchExerciseModal(); }));
  const appRoot = document.getElementById("app");
  if (appRoot) observer.observe(appRoot, {childList:true,subtree:true});
  observer.observe(document.body, {childList:true,subtree:true});
  patchWorkout();
  patchExerciseModal();
})();