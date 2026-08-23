// START/NOW v39 — accurate exercise visuals. No unrelated generic-machine fallback.
(() => {
  const SN = window.SN36;
  const COLORS = { ink: "#111827", muted: "#8B919B", line: "#D8DDE4", bg: "#F7F9FC", blue: "#3B82F6" };
  let patching = false;

  const esc = (value = "") => typeof escapeHtml === "function" ? escapeHtml(String(value)) : String(value);
  const slug = (value = "") => String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const exerciseId = ex => ex?.id || SN?.exerciseId?.(ex) || slug(ex?.name || "exercise");

  function equipment(ex) {
    const name = String(ex?.name || "").toLowerCase();
    if (/smith/.test(name)) return "Smith Machine";
    if (/lat pulldown|pulldown|pushdown|cable|face pull|wood chop|pallof/.test(name)) return "Cable";
    if (/dumbbell/.test(name)) return "Dumbbell";
    if (/barbell|ez-bar|ez bar/.test(name)) return "Barbell";
    if (/kettlebell/.test(name)) return "Kettlebell";
    if (/leg press|machine|pec deck|leg extension|leg curl|hip abduction|hip adduction|glute drive|hack squat/.test(name)) return "Machine";
    if (/push-up|push up|pull-up|pull up|chin-up|chin up|dip|plank|bodyweight|bird dog|dead bug|bear crawl|glute bridge|donkey kick|lunge/.test(name)) return "Bodyweight";
    if (/treadmill|bike|elliptical|stair|rowing machine|ski erg|jump rope/.test(name)) return "Cardio";
    return SN?.meta?.(ex)?.equipment || "Gym";
  }

  // Stable ID-first resolver. Different equipment/setup variants deliberately use different keys.
  const EXERCISE_VISUALS = {
    "barbell-bench-press": ["bench-barbell", "Barbell"],
    "incline-barbell-bench-press": ["bench-barbell", "Barbell"],
    "decline-barbell-bench-press": ["bench-barbell", "Barbell"],
    "dumbbell-bench-press": ["bench-dumbbell", "Dumbbell"],
    "incline-dumbbell-bench-press": ["bench-dumbbell", "Dumbbell"],
    "decline-dumbbell-bench-press": ["bench-dumbbell", "Dumbbell"],
    "smith-machine-bench-press": ["bench-smith", "Smith Machine"],
    "smith-machine-incline-press": ["bench-smith", "Smith Machine"],
    "machine-chest-press": ["chest-press-machine", "Machine"],
    "chest-press": ["chest-press-machine", "Machine"],
    "pec-deck-fly": ["pec-deck", "Machine"],
    "dumbbell-fly": ["dumbbell-fly", "Dumbbell"],
    "incline-dumbbell-fly": ["dumbbell-fly", "Dumbbell"],
    "lat-pulldown": ["lat-pulldown", "Cable"],
    "seated-row": ["seated-row-cable", "Cable"],
    "cable-row": ["seated-row-cable", "Cable"],
    "barbell-row": ["barbell-row", "Barbell"],
    "bent-over-barbell-row": ["barbell-row", "Barbell"],
    "one-arm-dumbbell-row": ["dumbbell-row", "Dumbbell"],
    "single-arm-dumbbell-row": ["dumbbell-row", "Dumbbell"],
    "dumbbell-row": ["dumbbell-row", "Dumbbell"],
    "romanian-deadlift": ["rdl-barbell", "Barbell"],
    "barbell-romanian-deadlift": ["rdl-barbell", "Barbell"],
    "dumbbell-romanian-deadlift": ["rdl-dumbbell", "Dumbbell"],
    "leg-press": ["leg-press", "Machine"],
    "leg-extension": ["leg-extension", "Machine"],
    "seated-leg-curl": ["leg-curl", "Machine"],
    "lying-leg-curl": ["leg-curl", "Machine"],
    "leg-curl": ["leg-curl", "Machine"],
    "machine-calf-raise": ["calf-raise-machine", "Machine"],
    "seated-calf-raise": ["calf-raise-machine", "Machine"],
    "standing-calf-raise": ["calf-raise", "Gym"],
    "machine-shoulder-press": ["shoulder-press-machine", "Machine"],
    "seated-dumbbell-shoulder-press": ["shoulder-press-dumbbell", "Dumbbell"],
    "standing-dumbbell-shoulder-press": ["shoulder-press-dumbbell", "Dumbbell"],
    "barbell-overhead-press": ["shoulder-press-barbell", "Barbell"],
    "seated-barbell-press": ["shoulder-press-barbell", "Barbell"],
    "arnold-press": ["shoulder-press-dumbbell", "Dumbbell"],
    "dumbbell-lateral-raise": ["lateral-raise-dumbbell", "Dumbbell"],
    "cable-lateral-raise": ["lateral-raise-cable", "Cable"],
    "machine-lateral-raise": ["lateral-raise-machine", "Machine"],
    "machine-reverse-fly": ["reverse-fly-machine", "Machine"],
    "rear-delt-cable-fly": ["reverse-fly-cable", "Cable"],
    "face-pull": ["face-pull", "Cable"],
    "barbell-curl": ["barbell-curl", "Barbell"],
    "dumbbell-curl": ["dumbbell-curl", "Dumbbell"],
    "alternating-dumbbell-curl": ["dumbbell-curl", "Dumbbell"],
    "hammer-curl": ["dumbbell-curl", "Dumbbell"],
    "triceps-pushdown": ["triceps-pushdown", "Cable"],
    "rope-triceps-pushdown": ["triceps-pushdown", "Cable"],
    "push-up": ["push-up", "Bodyweight"],
    "wide-grip-push-up": ["push-up", "Bodyweight"],
    "close-grip-push-up": ["push-up", "Bodyweight"],
    "incline-push-up": ["push-up", "Bodyweight"],
    "decline-push-up": ["push-up", "Bodyweight"],
    "plank": ["plank", "Bodyweight"],
    "pull-up": ["pull-up", "Bodyweight"],
    "chin-up": ["pull-up", "Bodyweight"],
    "chest-dip": ["dip", "Bodyweight"],
    "dip": ["dip", "Bodyweight"],
    "bodyweight-squat": ["bodyweight-squat", "Bodyweight"],
    "reverse-lunge": ["lunge", "Bodyweight"],
    "walking-lunge": ["lunge", "Bodyweight"],
    "supported-reverse-lunge": ["lunge", "Bodyweight"]
  };

  // Conservative aliases only for legacy/custom items whose stable ID does not match.
  const ALIASES = [
    [/dumbbell.*romanian deadlift|romanian deadlift.*dumbbell/i, "rdl-dumbbell", "Dumbbell"],
    [/romanian deadlift|\brdl\b/i, "rdl-barbell", "Barbell"],
    [/lat pulldown/i, "lat-pulldown", "Cable"],
    [/triceps? pushdown/i, "triceps-pushdown", "Cable"],
    [/leg press/i, "leg-press", "Machine"],
    [/leg extension/i, "leg-extension", "Machine"],
    [/leg curl/i, "leg-curl", "Machine"],
    [/machine shoulder press/i, "shoulder-press-machine", "Machine"],
    [/dumbbell shoulder press|arnold press/i, "shoulder-press-dumbbell", "Dumbbell"],
    [/barbell.*overhead press|barbell shoulder press/i, "shoulder-press-barbell", "Barbell"],
    [/machine lateral raise/i, "lateral-raise-machine", "Machine"],
    [/cable lateral raise/i, "lateral-raise-cable", "Cable"],
    [/dumbbell lateral raise|lateral raise/i, "lateral-raise-dumbbell", "Dumbbell"],
    [/machine reverse fly|reverse pec deck/i, "reverse-fly-machine", "Machine"],
    [/face pull/i, "face-pull", "Cable"],
    [/barbell curl/i, "barbell-curl", "Barbell"],
    [/dumbbell curl|hammer curl/i, "dumbbell-curl", "Dumbbell"],
    [/smith.*bench|bench.*smith/i, "bench-smith", "Smith Machine"],
    [/dumbbell.*bench|bench.*dumbbell/i, "bench-dumbbell", "Dumbbell"],
    [/barbell.*bench|bench.*barbell/i, "bench-barbell", "Barbell"],
    [/machine chest press|^chest press$/i, "chest-press-machine", "Machine"],
    [/pec deck/i, "pec-deck", "Machine"],
    [/dumbbell fly/i, "dumbbell-fly", "Dumbbell"],
    [/seated (cable )?row|cable row/i, "seated-row-cable", "Cable"],
    [/barbell row/i, "barbell-row", "Barbell"],
    [/dumbbell row/i, "dumbbell-row", "Dumbbell"],
    [/push[- ]?up/i, "push-up", "Bodyweight"],
    [/\bplank\b/i, "plank", "Bodyweight"],
    [/pull[- ]?up|chin[- ]?up/i, "pull-up", "Bodyweight"],
    [/\bdip\b/i, "dip", "Bodyweight"],
    [/bodyweight squat/i, "bodyweight-squat", "Bodyweight"],
    [/\blunge\b/i, "lunge", "Bodyweight"]
  ];

  function resolve(ex) {
    const id = exerciseId(ex);
    const explicit = EXERCISE_VISUALS[id];
    if (explicit) return { id, status: "specific", visual: explicit[0], equipment: explicit[1], image: ex?.image || null };
    for (const [pattern, visual, eq] of ALIASES) {
      if (pattern.test(String(ex?.name || ""))) return { id, status: "specific", visual, equipment: eq, image: ex?.image || null };
    }
    return { id, status: "fallback", visual: null, equipment: equipment(ex), image: ex?.image || null };
  }

  function icon(type) {
    const a = `fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"`;
    if (type === "Dumbbell") return `<svg viewBox="0 0 40 40" ${a}><path d="M5 16v8M9 12v16M13 16v8M27 16v8M31 12v16M35 16v8M13 20h14"/></svg>`;
    if (type === "Barbell") return `<svg viewBox="0 0 40 40" ${a}><path d="M3 15v10M7 11v18M12 15v10M28 15v10M33 11v18M37 15v10M12 20h16"/></svg>`;
    if (type === "Cable") return `<svg viewBox="0 0 40 40" ${a}><rect x="7" y="5" width="10" height="30" rx="2"/><path d="M12 10h18M30 10v9M25 19h10M30 19l-5 12M30 19l5 12"/></svg>`;
    if (type === "Smith Machine") return `<svg viewBox="0 0 40 40" ${a}><path d="M8 5v30M32 5v30M8 8h24M8 32h24M11 18h18M14 15v6M26 15v6"/></svg>`;
    if (type === "Bodyweight") return `<svg viewBox="0 0 40 40" ${a}><circle cx="20" cy="8" r="4"/><path d="M20 12v10M10 18l10 4 10-4M14 35l6-13 6 13"/></svg>`;
    if (type === "Cardio") return `<svg viewBox="0 0 40 40" ${a}><path d="M4 22h7l4-10 7 18 5-10h9"/></svg>`;
    return `<svg viewBox="0 0 40 40" ${a}><rect x="9" y="5" width="22" height="30" rx="3"/><path d="M14 11h12M14 17h12M14 23h12M14 29h12"/></svg>`;
  }

  const head = (x, y, r = 10) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/>`;
  const barbell = (x1, y, x2) => `<path d="M${x1} ${y}H${x2}"/><path d="M${x1+6} ${y-10}v20M${x1+11} ${y-7}v14M${x2-6} ${y-10}v20M${x2-11} ${y-7}v14"/>`;
  const shell = (label, body) => `<svg viewBox="0 0 320 190" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(label)} illustration"><rect x="1" y="1" width="318" height="188" rx="22" fill="${COLORS.bg}" stroke="${COLORS.line}"/><g fill="none" stroke="${COLORS.ink}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;

  const ART = {
    "rdl-barbell": () => shell("Romanian Deadlift", `${head(120,42)}<path d="M120 54l-12 40 38 18 22 42M108 94l-22 45M108 94l45 18M86 139l-5 26M168 154l7 20"/>${barbell(78,136,178)}`),
    "rdl-dumbbell": () => shell("Dumbbell Romanian Deadlift", `${head(120,42)}<path d="M120 54l-12 40 38 18 22 42M108 94l-22 45M108 94l45 18M86 139l-5 26M168 154l7 20"/><rect x="72" y="132" width="18" height="10" rx="3"/><rect x="145" y="109" width="18" height="10" rx="3"/>`),
    "lat-pulldown": () => shell("Lat Pulldown", `<path d="M55 30v125M55 35h165M220 35v35M190 70h60M220 70v20"/>${head(160,82)}<path d="M160 94v42M160 105l-33-25M160 105l33-25M127 80l-20-5M193 80l20-5M146 136l-18 27M174 136l18 27M125 139h70"/>`),
    "triceps-pushdown": () => shell("Triceps Pushdown", `<rect x="55" y="28" width="42" height="132" rx="6"/><path d="M76 38v96M76 38h110M186 38v55M176 93h20"/>${head(214,67)}<path d="M214 79v55M214 91l-24 20M190 111v34M214 134l-14 31M214 134l17 31"/>`),
    "leg-press": () => shell("Leg Press", `<path d="M52 151l66-85M118 66l77-31M110 73l80 60M190 133l40-48"/><rect x="43" y="133" width="58" height="18" rx="8"/>${head(115,116)}<path d="M108 124l-28 19M116 125l31-22M147 103l32 7M179 110l20-22M196 62l32 55"/>`),
    "leg-extension": () => shell("Leg Extension", `<path d="M90 55v102M90 60h80M118 115h72M118 115v38M118 153h78"/>${head(145,84)}<path d="M145 96v35M145 131l35 5M180 136l25 18M132 131l-12 24"/><path d="M204 151h25"/>`),
    "leg-curl": () => shell("Leg Curl", `<path d="M78 132h145M98 132v24M205 132v24"/>${head(110,104)}<path d="M120 108l60 9M180 117l34 22M120 108l-20 23"/><path d="M214 139l18-15"/>`),
    "calf-raise-machine": () => shell("Calf Raise Machine", `<path d="M95 36v126M95 44h95M190 44v45M170 89h40"/>${head(150,75)}<path d="M150 87v55M150 99l-25 12M150 99l25 12M138 142l-5 27M162 142l5 27"/><path d="M120 169h60"/>`),
    "calf-raise": () => shell("Standing Calf Raise", `${head(160,45)}<path d="M160 57v69M160 70l-25 18M160 70l25 18M145 126l-5 40M175 126l5 40M130 166h60"/>`),
    "bench-barbell": () => shell("Barbell Bench Press", `<path d="M65 139h155M92 139v18M195 139v18"/>${head(120,112)}<path d="M130 115l65 8M130 115l-28 18M195 123l20 16M137 110l-18-32M182 120l17-42"/>${barbell(70,78,245)}`),
    "bench-dumbbell": () => shell("Dumbbell Bench Press", `<path d="M65 139h155M92 139v18M195 139v18"/>${head(120,112)}<path d="M130 115l65 8M130 115l-28 18M195 123l20 16M137 110l-18-32M182 120l17-42"/><rect x="108" y="70" width="22" height="10" rx="3"/><rect x="188" y="70" width="22" height="10" rx="3"/>`),
    "bench-smith": () => shell("Smith Machine Bench Press", `<path d="M55 28v137M255 28v137M55 35h200M55 158h200M65 79h180M80 139h145M102 139v18M200 139v18"/>${head(128,112)}<path d="M138 115l62 8M138 115l-28 18M144 109l-18-30M188 120l17-41"/>`),
    "chest-press-machine": () => shell("Machine Chest Press", `<path d="M82 45v112M82 52h120M202 52v105M105 105h58M110 105v45M105 150h65"/>${head(135,82)}<path d="M135 94v44M135 105l-30 5M105 110l-24-8M135 105l30 5M165 110l24-8M123 138l-10 20M147 138l10 20"/>`),
    "pec-deck": () => shell("Pec Deck Fly", `<path d="M95 46v112M95 53h115M210 53v105M115 116h70"/>${head(150,84)}<path d="M150 96v42M150 108l-35-15M150 108l35-15M115 93l-25 5M185 93l25 5M138 138l-10 22M162 138l10 22"/>`),
    "dumbbell-fly": () => shell("Dumbbell Fly", `<path d="M65 139h155M92 139v18M195 139v18"/>${head(120,112)}<path d="M130 115l65 8M130 115l-28 18M137 110l-40-30M182 120l45-34"/><rect x="86" y="74" width="20" height="10" rx="3"/><rect x="220" y="80" width="20" height="10" rx="3"/>`),
    "seated-row-cable": () => shell("Seated Cable Row", `<rect x="45" y="38" width="40" height="110" rx="5"/><path d="M65 48h130M195 48v48M195 96h25M108 139h90"/>${head(135,92)}<path d="M135 104v35M135 115l30-13M165 102l30-6M135 139l-20 22M135 139l35 22"/>`),
    "barbell-row": () => shell("Barbell Row", `${head(120,52)}<path d="M120 64l20 38 48 8M140 102l-15 48M188 110l16 46M140 102l-35 24M140 102l40 24"/>${barbell(94,126,204)}`),
    "dumbbell-row": () => shell("Dumbbell Row", `<path d="M70 135h120M95 135v18M175 135v18"/>${head(145,65)}<path d="M145 77l-28 34M117 111l-28 24M117 111l43 9M160 120l15 36M117 111l-5 41"/><rect x="153" y="115" width="20" height="10" rx="3"/>`),
    "shoulder-press-machine": () => shell("Machine Shoulder Press", `<path d="M92 48v112M92 55h112M204 55v105M115 131h72"/>${head(150,102)}<path d="M150 114v35M150 120l-28-28M150 120l28-28M122 92l-7-25M178 92l7-25"/>`),
    "shoulder-press-dumbbell": () => shell("Dumbbell Shoulder Press", `${head(160,54)}<path d="M160 66v62M160 80l-30-25M160 80l30-25M145 128l-15 36M175 128l15 36"/><rect x="117" y="46" width="22" height="10" rx="3"/><rect x="181" y="46" width="22" height="10" rx="3"/>`),
    "shoulder-press-barbell": () => shell("Barbell Overhead Press", `${head(160,65)}<path d="M160 77v55M160 91l-28-31M160 91l28-31M145 132l-15 34M175 132l15 34"/>${barbell(95,43,225)}`),
    "lateral-raise-dumbbell": () => shell("Dumbbell Lateral Raise", `${head(160,55)}<path d="M160 67v65M160 82l-55 2M160 82l55 2M145 132l-15 34M175 132l15 34"/><rect x="92" y="79" width="20" height="10" rx="3"/><rect x="208" y="79" width="20" height="10" rx="3"/>`),
    "lateral-raise-cable": () => shell("Cable Lateral Raise", `<rect x="48" y="35" width="35" height="125" rx="5"/><path d="M65 45v105M65 145h50"/>${head(175,62)}<path d="M175 74v58M175 88l-52-5M175 88l28 20M160 132l-14 34M190 132l14 34M123 83l-35 61"/>`),
    "lateral-raise-machine": () => shell("Machine Lateral Raise", `<path d="M90 45v115M90 52h120M210 52v108M115 132h70"/>${head(150,92)}<path d="M150 104v43M150 115l-35-6M150 115l35-6M137 147l-10 18M163 147l10 18"/>`),
    "reverse-fly-machine": () => shell("Machine Reverse Fly", `<path d="M90 45v115M90 52h120M210 52v108M115 132h70"/>${head(150,92)}<path d="M150 104v43M150 115l-38-14M150 115l38-14M137 147l-10 18M163 147l10 18"/>`),
    "reverse-fly-cable": () => shell("Cable Reverse Fly", `<path d="M50 35v125M270 35v125M50 45h220"/>${head(160,68)}<path d="M160 80v57M160 94l-58-16M160 94l58-16M145 137l-12 30M175 137l12 30"/>`),
    "face-pull": () => shell("Face Pull", `<rect x="45" y="30" width="40" height="130" rx="5"/><path d="M65 40h110M175 40v45M175 85h30"/>${head(225,88)}<path d="M225 100v48M225 112l-31-18M194 94l-20-9M225 112l23 14M214 148l-10 18M236 148l10 18"/>`),
    "barbell-curl": () => shell("Barbell Curl", `${head(160,50)}<path d="M160 62v65M160 76l-25 34M160 76l25 34M145 127l-14 37M175 127l14 37"/>${barbell(118,111,202)}`),
    "dumbbell-curl": () => shell("Dumbbell Curl", `${head(160,50)}<path d="M160 62v65M160 76l-25 34M160 76l25 34M145 127l-14 37M175 127l14 37"/><rect x="124" y="105" width="20" height="10" rx="3"/><rect x="176" y="105" width="20" height="10" rx="3"/>`),
    "push-up": () => shell("Push-Up", `${head(94,95)}<path d="M105 99l92 29M105 99l-28 34M197 128l30 24M77 133h-24M227 152h26"/>`),
    "plank": () => shell("Plank", `${head(95,92)}<path d="M106 97l92 30M106 97l-25 36M198 127l31 25M81 133H55M229 152h27"/>`),
    "pull-up": () => shell("Pull-Up", `<path d="M75 40h170M95 40v15M225 40v15"/>${head(160,86)}<path d="M160 98v47M160 105l-40-48M160 105l40-48M145 145l-18 27M175 145l18 27"/>`),
    "dip": () => shell("Dip", `<path d="M85 78h60M175 78h60M95 78v88M225 78v88"/>${head(160,70)}<path d="M160 82v55M160 94l-28 16M132 110l-16-29M160 94l28 16M188 110l16-29M150 137l-12 30M170 137l12 30"/>`),
    "bodyweight-squat": () => shell("Bodyweight Squat", `${head(160,46)}<path d="M160 58v50M160 73l-31 18M160 73l31 18M160 108l-35 24M125 132l-20 31M160 108l35 24M195 132l20 31"/>`),
    "lunge": () => shell("Lunge", `${head(155,44)}<path d="M155 56v58M155 72l-28 20M155 72l28 20M155 114l-40 21M115 135l-30 24M155 114l41 30M196 144l28 4"/>`)
  };

  function fallback(ex, r) {
    return `<div class="sn-v39-fallback"><div class="sn-v39-icon">${icon(r.equipment)}</div><div><strong>${esc(ex?.name || "Exercise")}</strong><span>No demonstration available yet</span><small>${esc(r.equipment)} • ${esc(ex?.muscle || "Exercise")}</small></div></div>`;
  }

  function media(ex, r) {
    if (r.image) return `<div class="sn-v39-image-wrap"><img src="${esc(r.image)}" alt="${esc(ex?.name || "Exercise")} demonstration" class="sn-v39-image" loading="lazy" decoding="async" data-v39-img></div>`;
    const make = ART[r.visual];
    return make ? `<div class="sn-v39-specific">${make()}</div>` : fallback(ex, r);
  }

  function card(ex, compact = false) {
    const r = resolve(ex);
    return `<section class="sn-v39-exercise-visual ${compact ? "compact" : ""}" data-v39-exercise="${esc(r.id)}"><div class="sn-v39-head"><div><span>EXERCISE DEMO</span><strong>${esc(ex?.name || "Exercise")}</strong></div><small>${esc(r.equipment)}</small></div><div class="sn-v39-media">${media(ex, r)}</div></section>`;
  }

  function bindImageErrors(root, ex) {
    root.querySelectorAll("[data-v39-img]").forEach(img => img.addEventListener("error", () => {
      const holder = img.closest(".sn-v39-media");
      if (holder) holder.innerHTML = fallback(ex, resolve(ex));
    }, { once: true }));
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
    if (document.getElementById("sn-v39-styles")) return;
    const style = document.createElement("style");
    style.id = "sn-v39-styles";
    style.textContent = `
      .workout-screen>.exercise-visual,.sn-exercise-focus-panel,.sn-v38-exercise-visual{display:none!important}
      .sn-v39-exercise-visual{margin:14px 0 18px;border:1px solid var(--line);border-radius:22px;background:var(--surface);overflow:hidden;box-shadow:0 12px 28px rgba(17,24,39,.05)}
      .sn-v39-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;padding:14px 16px 10px}.sn-v39-head>div{display:grid;gap:3px}.sn-v39-head span{font-size:9px;font-weight:900;letter-spacing:.1em;color:var(--blue)}.sn-v39-head strong{font-size:15px;color:var(--text)}.sn-v39-head small{font-size:10px;color:var(--muted);font-weight:800}
      .sn-v39-media{aspect-ratio:16/9;min-height:170px;display:flex;align-items:center;justify-content:center;padding:8px 14px 16px;background:linear-gradient(180deg,var(--surface),rgba(59,130,246,.025));overflow:hidden}
      .sn-v39-specific,.sn-v39-image-wrap{width:100%;height:100%;display:flex;align-items:center;justify-content:center}.sn-v39-specific svg,.sn-v39-image{display:block;width:100%;height:100%;max-height:230px;object-fit:contain;border-radius:16px}
      .sn-v39-fallback{width:100%;min-height:160px;display:flex;align-items:center;justify-content:center;gap:18px;padding:22px;border:1px dashed rgba(139,145,155,.45);border-radius:18px;background:rgba(139,145,155,.045);color:var(--text)}.sn-v39-icon{width:70px;height:70px;flex:0 0 70px;border-radius:20px;background:rgba(59,130,246,.08);color:var(--blue);display:grid;place-items:center}.sn-v39-icon svg{width:42px;height:42px}.sn-v39-fallback>div:last-child{display:grid;gap:4px}.sn-v39-fallback strong{font-size:15px}.sn-v39-fallback span{font-size:12px;color:var(--muted)}.sn-v39-fallback small{font-size:10px;color:var(--muted);font-weight:800}
      .sn-v39-exercise-visual.compact{margin:10px 0 14px;box-shadow:none}.sn-v39-exercise-visual.compact .sn-v39-media{min-height:135px}.sn-v39-exercise-visual.compact .sn-v39-head{padding:12px 14px 8px}
      .sn-v39-prev-row{display:grid;grid-template-columns:1fr;margin:10px 0}.sn-v39-prev{min-height:46px!important;font-weight:850!important}.sn-v39-prev:disabled{opacity:.38}
      @media(max-width:560px){.sn-v39-media{min-height:150px;padding:6px 10px 12px}.sn-v39-fallback{min-height:135px;padding:16px;gap:12px}.sn-v39-icon{width:58px;height:58px;flex-basis:58px}.sn-v39-icon svg{width:34px;height:34px}.sn-v39-head strong{font-size:14px}}
      .dark .sn-v39-exercise-visual{box-shadow:0 12px 28px rgba(0,0,0,.18)}
    `;
    document.head.appendChild(style);
  }

  function patchWorkout() {
    if (patching || state?.page !== "activeWorkout") return;
    const screen = document.querySelector(".workout-screen");
    const ex = currentExercise();
    if (!screen || !ex) return;
    const id = exerciseId(ex);
    const existing = screen.querySelector(".sn-v39-exercise-visual");
    const existingId = existing?.dataset?.v39Exercise;
    const hasPrevious = !!screen.querySelector("#snV39Previous");
    const correctPreviousState = currentIndex() <= 0 ? screen.querySelector("#snV39Previous")?.disabled === true : screen.querySelector("#snV39Previous")?.disabled === false;
    if (existing && existingId === id && hasPrevious && correctPreviousState) return;

    patching = true;
    try {
      screen.querySelectorAll(":scope > .exercise-visual,.sn-exercise-focus-panel,.sn-v38-exercise-visual,.sn-v39-exercise-visual").forEach(node => node.remove());
      const anchor = screen.querySelector(".sn-exercise-head") || screen.querySelector(".exercise-title");
      if (anchor) {
        anchor.insertAdjacentHTML(anchor.classList.contains("sn-exercise-head") ? "afterend" : "beforebegin", card(ex));
        const visual = screen.querySelector(".sn-v39-exercise-visual");
        if (visual) bindImageErrors(visual, ex);
      }
      screen.querySelectorAll(".sn-prev-row,.sn-v38-prev-row,.sn-v39-prev-row").forEach(node => node.remove());
      const actions = screen.querySelector(".sn-workout-actions") || screen.querySelector(".workout-actions");
      if (actions) {
        const row = document.createElement("div");
        row.className = "sn-v39-prev-row";
        row.innerHTML = `<button class="secondary sn-v39-prev" id="snV39Previous" ${currentIndex() <= 0 ? "disabled" : ""}>← Previous exercise</button>`;
        actions.insertAdjacentElement("beforebegin", row);
        row.querySelector("#snV39Previous")?.addEventListener("click", previousExercise);
      }
    } finally { patching = false; }
  }

  function patchExerciseModal() {
    const modal = document.querySelector("#snProductModal .sn-modal");
    if (!modal || modal.querySelector(".sn-v39-exercise-visual")) return;
    const title = modal.querySelector(".sn-modal-head h2")?.textContent?.trim();
    if (!title) return;
    const ex = exerciseLibrary.find(item => String(item.name).toLowerCase() === title.toLowerCase());
    if (!ex) return;
    modal.querySelector(".sn-modal-head")?.insertAdjacentHTML("afterend", card(ex, true));
    const visual = modal.querySelector(".sn-v39-exercise-visual");
    if (visual) bindImageErrors(visual, ex);
  }

  function hydrate() {
    if (!Array.isArray(exerciseLibrary)) return;
    exerciseLibrary.forEach(ex => {
      const r = resolve(ex);
      ex.imageRef = `exercise:${r.id}`;
      if (!("image" in ex)) ex.image = null;
      ex.visualKey = r.visual;
      ex.equipment = r.equipment;
      ex.primaryMuscle = ex.primaryMuscle || ex.muscle || "Other";
    });
  }

  function audit() {
    if (!Array.isArray(exerciseLibrary)) return [];
    const rows = exerciseLibrary.map(ex => {
      const r = resolve(ex);
      return { id: r.id, name: ex.name, muscle: ex.muscle || "Other", equipment: r.equipment, image: r.image || null, visual: r.visual, status: r.status === "specific" ? "exercise-specific illustration" : "safe equipment fallback — proper demo still needed" };
    });
    window.START_NOW_EXERCISE_VISUAL_AUDIT = rows;
    window.START_NOW_EXERCISES_NEEDING_VISUALS = rows.filter(row => row.status.includes("still needed"));
    if (SN) { SN.exerciseVisualAudit = rows; SN.exercisesNeedingVisuals = window.START_NOW_EXERCISES_NEEDING_VISUALS; }
    console.info(`[START/NOW v39] ${rows.length - window.START_NOW_EXERCISES_NEEDING_VISUALS.length}/${rows.length} exercises have verified movement illustrations; ${window.START_NOW_EXERCISES_NEEDING_VISUALS.length} use safe, non-misleading fallbacks.`);
    return rows;
  }

  window.START_NOW_EXERCISE_IMAGES = EXERCISE_VISUALS;
  window.START_NOW_RESOLVE_EXERCISE_VISUAL = resolve;
  window.START_NOW_RENDER_EXERCISE_VISUAL = card;

  installStyles();
  hydrate();
  audit();

  const observer = new MutationObserver(() => queueMicrotask(() => { patchWorkout(); patchExerciseModal(); }));
  const appRoot = document.getElementById("app");
  if (appRoot) observer.observe(appRoot, { childList: true, subtree: true });
  observer.observe(document.body, { childList: true, subtree: true });
  patchWorkout();
  patchExerciseModal();
})();