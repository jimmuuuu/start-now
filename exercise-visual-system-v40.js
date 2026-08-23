// START/NOW v40 — instructional exercise diagrams. Accuracy over decoration.
(() => {
  const SN = window.SN36;
  const LIB = window.START_NOW_EXERCISE_ILLUSTRATIONS_V40 || {};
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
    return ex?.equipment || SN?.meta?.(ex)?.equipment || "Gym";
  }

  // A real approved image can be added here later without changing the renderer.
  // Example: "leg-press": "assets/exercises/leg-press.webp"
  const APPROVED_ASSETS = {};

  // Stable exercise-ID -> approved instructional movement key.
  const MAP = {
    "romanian-deadlift":"rdl-barbell","barbell-romanian-deadlift":"rdl-barbell","dumbbell-romanian-deadlift":"rdl-dumbbell",
    "barbell-bench-press":"bench-barbell","incline-barbell-bench-press":"bench-barbell","decline-barbell-bench-press":"bench-barbell",
    "dumbbell-bench-press":"bench-dumbbell","incline-dumbbell-bench-press":"bench-dumbbell","decline-dumbbell-bench-press":"bench-dumbbell",
    "machine-chest-press":"chest-press-machine","chest-press":"chest-press-machine",
    "pec-deck-fly":"pec-deck","dumbbell-fly":"dumbbell-fly","incline-dumbbell-fly":"dumbbell-fly",
    "lat-pulldown":"lat-pulldown","seated-row":"seated-row-cable","seated-cable-row":"seated-row-cable","cable-row":"seated-row-cable",
    "barbell-row":"barbell-row","bent-over-barbell-row":"barbell-row","one-arm-dumbbell-row":"dumbbell-row","single-arm-dumbbell-row":"dumbbell-row","dumbbell-row":"dumbbell-row",
    "leg-press":"leg-press","leg-extension":"leg-extension","seated-leg-extension":"leg-extension",
    "leg-curl":"leg-curl","seated-leg-curl":"leg-curl","lying-leg-curl":"leg-curl",
    "machine-shoulder-press":"shoulder-press-machine","seated-dumbbell-shoulder-press":"shoulder-press-dumbbell","standing-dumbbell-shoulder-press":"shoulder-press-dumbbell","arnold-press":"shoulder-press-dumbbell","barbell-overhead-press":"shoulder-press-barbell","seated-barbell-press":"shoulder-press-barbell",
    "dumbbell-lateral-raise":"lateral-raise-dumbbell","cable-lateral-raise":"lateral-raise-cable","machine-lateral-raise":"lateral-raise-machine",
    "machine-reverse-fly":"reverse-fly-machine","reverse-pec-deck":"reverse-fly-machine","rear-delt-cable-fly":"reverse-fly-cable","face-pull":"face-pull",
    "barbell-curl":"barbell-curl","dumbbell-curl":"dumbbell-curl","alternating-dumbbell-curl":"dumbbell-curl","hammer-curl":"dumbbell-curl","incline-dumbbell-curl":"dumbbell-curl",
    "preacher-curl":"preacher-curl","machine-preacher-curl":"preacher-curl","preacher-curl-machine":"preacher-curl",
    "triceps-pushdown":"triceps-pushdown","rope-triceps-pushdown":"triceps-pushdown","cable-triceps-pushdown":"triceps-pushdown",
    "push-up":"push-up","wide-grip-push-up":"push-up","close-grip-push-up":"push-up","incline-push-up":"push-up","decline-push-up":"push-up",
    "pull-up":"pull-up","chin-up":"pull-up","assisted-pull-up":"pull-up",
    "chest-dip":"dip","dip":"dip","assisted-dip":"dip",
    "bodyweight-squat":"bodyweight-squat","air-squat":"bodyweight-squat",
    "reverse-lunge":"lunge","walking-lunge":"lunge","supported-reverse-lunge":"lunge","forward-lunge":"lunge",
    "plank":"plank","forearm-plank":"plank",
    "hip-thrust":"hip-thrust","barbell-hip-thrust":"hip-thrust","machine-hip-thrust":"hip-thrust","glute-drive":"hip-thrust",
    "glute-bridge":"glute-bridge","bodyweight-glute-bridge":"glute-bridge",
    "crunch":"crunch","ab-crunch":"crunch","machine-crunch":"crunch",
    "standing-calf-raise":"calf-raise","seated-calf-raise":"calf-raise","machine-calf-raise":"calf-raise",
    "hip-abduction-machine":"hip-abduction","machine-hip-abduction":"hip-abduction","hip-abduction":"hip-abduction",
    "hip-adduction-machine":"hip-adduction","machine-hip-adduction":"hip-adduction","hip-adduction":"hip-adduction"
  };

  // Conservative legacy/custom-name matching. If a match is uncertain, we do not guess.
  const ALIASES = [
    [/dumbbell.*romanian deadlift|romanian deadlift.*dumbbell/i,"rdl-dumbbell"],[/romanian deadlift|\brdl\b/i,"rdl-barbell"],
    [/machine chest press|^chest press$/i,"chest-press-machine"],[/pec deck/i,"pec-deck"],[/dumbbell fly/i,"dumbbell-fly"],
    [/lat pulldown/i,"lat-pulldown"],[/seated (cable )?row|cable row/i,"seated-row-cable"],[/barbell row/i,"barbell-row"],[/dumbbell row/i,"dumbbell-row"],
    [/leg press/i,"leg-press"],[/leg extension/i,"leg-extension"],[/leg curl/i,"leg-curl"],
    [/machine shoulder press/i,"shoulder-press-machine"],[/dumbbell shoulder press|arnold press/i,"shoulder-press-dumbbell"],[/barbell overhead press|barbell shoulder press/i,"shoulder-press-barbell"],
    [/machine lateral raise/i,"lateral-raise-machine"],[/cable lateral raise/i,"lateral-raise-cable"],[/dumbbell lateral raise/i,"lateral-raise-dumbbell"],
    [/machine reverse fly|reverse pec deck/i,"reverse-fly-machine"],[/rear delt cable fly/i,"reverse-fly-cable"],[/face pull/i,"face-pull"],
    [/preacher curl/i,"preacher-curl"],[/barbell curl/i,"barbell-curl"],[/dumbbell curl|hammer curl/i,"dumbbell-curl"],
    [/triceps? pushdown/i,"triceps-pushdown"],[/push[- ]?up/i,"push-up"],[/pull[- ]?up|chin[- ]?up/i,"pull-up"],[/\bdip\b/i,"dip"],
    [/bodyweight squat|air squat/i,"bodyweight-squat"],[/\blunge\b/i,"lunge"],[/\bplank\b/i,"plank"],
    [/hip thrust|glute drive/i,"hip-thrust"],[/glute bridge/i,"glute-bridge"],[/\bcrunch\b/i,"crunch"],[/calf raise/i,"calf-raise"],
    [/hip abduction/i,"hip-abduction"],[/hip adduction/i,"hip-adduction"]
  ];

  const INFO = {
    "rdl-barbell": {steps:["Stand tall with the bar close to your thighs.","Push your hips back while keeping the bar close to your legs.","Stop when you feel a strong hamstring stretch, then stand by driving the hips forward."],tips:["Keep your back neutral.","Think hips back, not squat down."]},
    "rdl-dumbbell": {steps:["Hold the dumbbells at your sides in front of your thighs.","Hinge at the hips and let the dumbbells travel close to your legs.","Drive the hips forward to return to standing."],tips:["Keep the knees softly bent.","Do not round your lower back."]},
    "bench-barbell": {steps:["Lie on the bench with feet planted and hands even on the bar.","Lower the bar under control toward the mid-chest.","Press the bar back up without bouncing it."],tips:["Keep shoulders set against the bench.","Use a load you can control through the full range."]},
    "bench-dumbbell": {steps:["Lie back with one dumbbell in each hand.","Lower the dumbbells beside the chest with control.","Press them up until the arms are nearly straight."],tips:["Keep wrists stacked over elbows.","Do not force an uncomfortable shoulder range."]},
    "chest-press-machine": {steps:["Adjust the seat so the handles line up around chest height.","Press the handles forward smoothly.","Return under control until you feel a comfortable chest stretch."],tips:["Keep your upper back on the pad.","Do not slam the weight stack."]},
    "pec-deck": {steps:["Set the seat so your arms line up with the machine pads or handles.","Bring the arms together in front of your chest.","Open back slowly to the start position."],tips:["Keep a soft bend in the elbows.","Avoid letting the shoulders roll forward."]},
    "dumbbell-fly": {steps:["Lie on a bench with dumbbells above your chest.","Open your arms in a wide arc with a slight elbow bend.","Bring the dumbbells back together using the chest."],tips:["Keep the elbow angle mostly fixed.","Use lighter weight than a press."]},
    "lat-pulldown": {steps:["Sit securely and take the bar with a comfortable grip.","Pull the bar down toward the upper chest while driving the elbows down.","Control the bar back to the top."],tips:["Avoid swinging your torso.","Keep the shoulders away from your ears."]},
    "seated-row-cable": {steps:["Sit tall and reach for the handle without rounding excessively.","Pull the handle toward your torso by driving your elbows back.","Return slowly until the arms are long again."],tips:["Keep your chest tall.","Do not turn the movement into a full-body swing."]},
    "barbell-row": {steps:["Hinge forward and hold the bar below your knees or around shin level.","Pull the bar toward your lower ribs.","Lower it under control while keeping the torso angle steady."],tips:["Keep your back neutral.","Avoid jerking the bar from the floor."]},
    "dumbbell-row": {steps:["Brace one side on a bench or stable support.","Pull the dumbbell toward your hip.","Lower it until the arm is long without twisting your torso."],tips:["Keep hips and shoulders mostly square.","Lead with the elbow."]},
    "leg-press": {steps:["Set your feet securely on the platform and keep your back supported.","Lower the platform by bending the knees to a comfortable depth.","Push through the feet to extend the legs without locking hard."],tips:["Keep knees tracking with the toes.","Do not let your lower back curl off the pad."]},
    "leg-extension": {steps:["Adjust the pad above the ankles and line your knees with the machine pivot.","Extend the knees until the legs are nearly straight.","Lower the pad slowly back down."],tips:["Do not kick the weight up.","Use a controlled range that feels comfortable at the knees."]},
    "leg-curl": {steps:["Set the machine so the pad sits comfortably near the lower legs.","Curl the pad by bending the knees.","Return slowly until the legs are almost straight."],tips:["Keep the hips against the pad.","Avoid using momentum."]},
    "shoulder-press-machine": {steps:["Adjust the seat so the handles start around shoulder level.","Press the handles overhead smoothly.","Lower them under control back to the start."],tips:["Keep ribs from flaring excessively.","Stop if the shoulder position feels pinched."]},
    "shoulder-press-dumbbell": {steps:["Start with the dumbbells around shoulder height.","Press them overhead in a controlled path.","Lower them back to shoulder height."],tips:["Keep your torso stable.","Do not force the dumbbells together overhead."]},
    "shoulder-press-barbell": {steps:["Start with the bar around the upper chest or shoulders.","Press it overhead while keeping your torso stacked.","Lower the bar under control."],tips:["Keep the core braced.","Use a comfortable grip width."]},
    "lateral-raise-dumbbell": {steps:["Hold the dumbbells beside your thighs.","Raise the arms out to the sides to about shoulder height.","Lower slowly back to the start."],tips:["Keep the weight light enough to avoid swinging.","Lead with the elbows rather than shrugging."]},
    "lateral-raise-cable": {steps:["Stand beside the low cable with the handle in the outside hand.","Raise the arm out to the side.","Lower it slowly back toward the hip."],tips:["Stay tall and avoid leaning for momentum.","Keep the shoulder relaxed away from the ear."]},
    "lateral-raise-machine": {steps:["Set the seat so the machine pads line up comfortably with your arms.","Raise the arms outward against the pads.","Lower under control."],tips:["Do not shrug.","Use a smooth range rather than bouncing the stack."]},
    "reverse-fly-machine": {steps:["Sit facing the machine and place the arms on the handles or pads.","Open the arms out and back.","Return slowly to the start."],tips:["Keep the chest supported or torso steady.","Think rear shoulders, not a hard shrug."]},
    "reverse-fly-cable": {steps:["Set the cables so the handles can cross in front of you.","Open the arms out to the sides and slightly back.","Return slowly without letting the stacks slam."],tips:["Keep elbows softly bent.","Avoid excessive torso movement."]},
    "face-pull": {steps:["Set the cable around face height and hold the rope or handles.","Pull toward your face while separating the hands.","Return slowly until the arms are long again."],tips:["Keep elbows high but comfortable.","Do not lean back to create momentum."]},
    "barbell-curl": {steps:["Stand tall with the bar in front of your thighs.","Curl the bar upward by bending the elbows.","Lower it slowly until the arms are nearly straight."],tips:["Keep elbows close to your sides.","Avoid swinging your torso."]},
    "dumbbell-curl": {steps:["Start with the dumbbells by your sides.","Curl the weights upward while keeping the upper arms mostly still.","Lower slowly to full control."],tips:["Do not throw the shoulders forward.","Use a weight you can curl without swinging."]},
    "preacher-curl": {steps:["Place your upper arms firmly on the preacher pad.","Curl the handle or weight upward.","Lower slowly until the elbows are nearly straight."],tips:["Keep the upper arms on the pad.","Avoid dropping quickly into the bottom position."]},
    "triceps-pushdown": {steps:["Set the cable high and hold the attachment with elbows near your sides.","Press the handle down until the arms are nearly straight.","Return slowly without letting the elbows drift far forward."],tips:["Keep the upper arms mostly still.","Do not lean your entire body onto the handle."]},
    "push-up": {steps:["Start in a straight-body plank with hands under or slightly outside the shoulders.","Lower your chest toward the floor under control.","Press the floor away to return to the top."],tips:["Keep hips from sagging.","Use an incline if needed to maintain good form."]},
    "pull-up": {steps:["Hang from the bar with a secure grip.","Pull your body upward by driving the elbows down.","Lower under control to a full comfortable hang."],tips:["Avoid excessive swinging.","Use assistance if needed to keep the reps controlled."]},
    "dip": {steps:["Support yourself securely on the handles.","Lower by bending the elbows to a comfortable depth.","Press back up without bouncing."],tips:["Keep the shoulders controlled.","Use assistance if full bodyweight is too difficult."]},
    "bodyweight-squat": {steps:["Stand with feet in a comfortable squat stance.","Sit down and back while bending the knees.","Drive through the feet to stand tall again."],tips:["Keep knees tracking with the toes.","Use a depth you can control comfortably."]},
    "lunge": {steps:["Step into a stable split stance.","Lower both knees while keeping your balance.","Push through the front foot to return."],tips:["Keep the front knee tracking with the foot.","Use support if balance limits your form."]},
    "plank": {steps:["Set your forearms or hands under the shoulders.","Create a straight line from head through hips to feet.","Hold while breathing normally and keeping the trunk stable."],tips:["Do not let the hips sag.","Stop the set when you can no longer hold the position cleanly."]},
    "hip-thrust": {steps:["Set your upper back against the bench or pad and place your feet securely.","Drive through the feet to raise the hips.","Squeeze the glutes near the top and lower under control."],tips:["Keep the ribs controlled rather than over-arching.","Use a foot position that feels stable at the knees."]},
    "glute-bridge": {steps:["Lie on your back with knees bent and feet planted.","Drive through the feet to lift the hips.","Lower under control to the floor."],tips:["Finish with the glutes rather than over-arching the lower back.","Keep the feet stable."]},
    "crunch": {steps:["Lie down with knees bent and brace your midsection.","Curl the upper torso slightly toward the hips.","Lower slowly back to the start."],tips:["Keep the movement small and controlled.","Avoid pulling hard on your neck."]},
    "calf-raise": {steps:["Stand or sit with the feet supported and heels able to move.","Rise onto the balls of your feet.","Lower the heels slowly through a comfortable range."],tips:["Pause briefly near the top.","Avoid bouncing through the bottom."]},
    "hip-abduction": {steps:["Sit securely with the outside of the legs against the machine pads.","Open the knees outward under control.","Return slowly toward the start."],tips:["Keep the torso steady.","Avoid bouncing the pads apart."]},
    "hip-adduction": {steps:["Sit securely with the inside of the legs against the machine pads.","Bring the knees inward under control.","Return slowly to the open position."],tips:["Use a comfortable range.","Keep the torso steady against the seat."]}
  };

  function resolve(ex) {
    const id = exerciseId(ex);
    const asset = ex?.image || APPROVED_ASSETS[id] || null;
    if (asset) return {id, kind:"asset", asset, equipment:equipment(ex), key:MAP[id] || null};
    const direct = MAP[id];
    if (direct && LIB[direct]) return {id, kind:"diagram", key:direct, equipment:equipment(ex)};
    const name = String(ex?.name || "");
    for (const [pattern,key] of ALIASES) if (pattern.test(name) && LIB[key]) return {id, kind:"diagram", key, equipment:equipment(ex)};
    return {id, kind:"muscle", key:null, equipment:equipment(ex)};
  }

  function equipmentIcon(type) {
    const a='fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
    if(type==="Dumbbell")return `<svg viewBox="0 0 40 40" ${a}><path d="M5 16v8M9 12v16M13 16v8M27 16v8M31 12v16M35 16v8M13 20h14"/></svg>`;
    if(type==="Barbell")return `<svg viewBox="0 0 40 40" ${a}><path d="M3 15v10M7 11v18M12 15v10M28 15v10M33 11v18M37 15v10M12 20h16"/></svg>`;
    if(type==="Cable")return `<svg viewBox="0 0 40 40" ${a}><rect x="7" y="5" width="10" height="30" rx="2"/><path d="M12 10h18M30 10v9M25 19h10M30 19l-5 12M30 19l5 12"/></svg>`;
    if(type==="Bodyweight")return `<svg viewBox="0 0 40 40" ${a}><circle cx="20" cy="8" r="4"/><path d="M20 12v10M10 18l10 4 10-4M14 35l6-13 6 13"/></svg>`;
    return `<svg viewBox="0 0 40 40" ${a}><rect x="9" y="5" width="22" height="30" rx="3"/><path d="M14 11h12M14 17h12M14 23h12M14 29h12"/></svg>`;
  }

  function muscleFallback(ex, r) {
    let body = "";
    try { if (typeof bodySvg === "function") body = bodySvg({exercises:[ex]}); } catch(_) {}
    return `<div class="sn-v40-fallback"><div class="sn-v40-fallback-art">${body || `<div class="sn-v40-eq-icon">${equipmentIcon(r.equipment)}</div>`}</div><div class="sn-v40-fallback-copy"><strong>${esc(ex?.name || "Exercise")}</strong><span>Movement demonstration coming soon</span><small>${esc(r.equipment)} • ${esc(ex?.muscle || "Exercise")}</small><p>The muscle map is shown instead of an inaccurate exercise image.</p></div></div>`;
  }

  function approvedAsset(ex, r) {
    return `<div class="sn-v40-asset-wrap"><img src="${esc(r.asset)}" alt="${esc(ex?.name || "Exercise")} demonstration" loading="lazy" decoding="async" class="sn-v40-asset" data-v40-image></div>`;
  }

  function diagram(ex, r) {
    const item = LIB[r.key];
    if (!item) return muscleFallback(ex,r);
    return `<div class="sn-v40-poses"><div class="sn-v40-pose"><span>START</span>${item.start()}</div><div class="sn-v40-arrow" aria-hidden="true">→</div><div class="sn-v40-pose"><span>FINISH</span>${item.finish()}</div></div>`;
  }

  function card(ex, compact=false) {
    const r = resolve(ex);
    const m = SN?.meta?.(ex) || {primary:ex?.muscle || "Exercise",secondary:[]};
    const media = r.kind === "asset" ? approvedAsset(ex,r) : r.kind === "diagram" ? diagram(ex,r) : muscleFallback(ex,r);
    return `<section class="sn-v40-card ${compact?"compact":""}" data-v40-exercise="${esc(r.id)}"><div class="sn-v40-card-head"><div><span>EXERCISE GUIDE</span><strong>${esc(ex?.name || "Exercise")}</strong></div><small>${esc(r.equipment)}</small></div><div class="sn-v40-media">${media}</div><div class="sn-v40-muscles"><span>Primary</span><strong>${esc(m.primary || ex?.muscle || "Exercise")}</strong>${(m.secondary||[]).slice(0,2).map(x=>`<em>${esc(x)}</em>`).join("")}</div></section>`;
  }

  function safeInfo(ex) {
    const r = resolve(ex);
    const info = INFO[r.key] || null;
    const meta = SN?.meta?.(ex) || {primary:ex?.muscle || "Exercise",secondary:[],instructions:ex?.cue || "Use a controlled range of motion."};
    const genericSteps = [meta.instructions || ex?.cue || "Set up in a stable position.","Perform the movement slowly and under control.","Return to the starting position without using momentum."];
    const mistakes = SN?.mistakes?.(ex) || [];
    return {r,meta,steps:info?.steps || genericSteps,tips:info?.tips || mistakes.slice(0,2).map(x=>`Avoid ${String(x).replace(/^Avoid\s+/i,"").replace(/^Letting\s+/i,"letting ")}.`)};
  }

  function bindImageError(root, ex) {
    root.querySelectorAll("[data-v40-image]").forEach(img=>img.addEventListener("error",()=>{
      const holder=img.closest(".sn-v40-media");
      if(holder) holder.innerHTML=muscleFallback(ex,{...resolve(ex),kind:"muscle",asset:null});
    },{once:true}));
  }

  function currentExercise(){if(SN?.active?.exercises?.length)return SN.active.exercises[Number(SN.active.index||0)]||null;return state?.activeWorkout?.exercises?.[Number(state?.workoutIndex||0)]||null;}
  function currentIndex(){return SN?.active?.exercises?.length?Number(SN.active.index||0):Number(state?.workoutIndex||0);}
  function previousExercise(){const i=currentIndex();if(i<=0)return;if(SN?.active?.exercises?.length){SN.active.index=i-1;SN.write?.(SN.keys.active,SN.active);}else state.workoutIndex=i-1;render();}

  function installStyles(){
    if(document.getElementById("sn-v40-styles"))return;
    const style=document.createElement("style");style.id="sn-v40-styles";style.textContent=`
      .workout-screen>.exercise-visual,.sn-exercise-focus-panel,.sn-v38-exercise-visual,.sn-v39-exercise-visual{display:none!important}
      .sn-v40-card{margin:14px 0 18px;border:1px solid var(--line);border-radius:24px;background:var(--surface);overflow:hidden;box-shadow:0 12px 30px rgba(17,24,39,.055)}
      .sn-v40-card-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;padding:15px 17px 10px}.sn-v40-card-head>div{display:grid;gap:3px}.sn-v40-card-head span{font-size:9px;font-weight:900;letter-spacing:.11em;color:var(--blue)}.sn-v40-card-head strong{font-size:16px;color:var(--text)}.sn-v40-card-head small{font-size:10px;color:var(--muted);font-weight:850}
      .sn-v40-media{padding:8px 14px 12px;background:linear-gradient(180deg,var(--surface),rgba(59,130,246,.025));overflow:hidden}
      .sn-v40-poses{display:grid;grid-template-columns:minmax(0,1fr) 30px minmax(0,1fr);align-items:center;gap:8px}.sn-v40-pose{display:grid;gap:6px;min-width:0}.sn-v40-pose>span{font-size:9px;font-weight:900;letter-spacing:.1em;color:var(--muted);text-align:center}.sn-v40-pose svg{display:block;width:100%;height:auto;max-height:220px}.sn-v40-arrow{width:30px;height:30px;border-radius:999px;background:rgba(59,130,246,.10);color:var(--blue);display:grid;place-items:center;font-size:20px;font-weight:900}
      .sn-v40-muscles{display:flex;align-items:center;gap:7px;flex-wrap:wrap;padding:0 16px 15px}.sn-v40-muscles span{font-size:9px;font-weight:900;letter-spacing:.08em;color:var(--muted);text-transform:uppercase}.sn-v40-muscles strong{font-size:12px;color:var(--text)}.sn-v40-muscles em{font-size:10px;font-style:normal;color:var(--muted);padding:4px 7px;border-radius:999px;background:var(--soft)}
      .sn-v40-fallback{display:grid;grid-template-columns:minmax(120px,.7fr) minmax(0,1fr);gap:16px;align-items:center;min-height:190px;border:1px dashed rgba(148,163,184,.48);border-radius:20px;padding:16px;background:rgba(148,163,184,.04)}.sn-v40-fallback-art{display:flex;align-items:center;justify-content:center;min-width:0}.sn-v40-fallback-art .sn-simple-muscle-wrap,.sn-v40-fallback-art .sn-dynamic-body-wrap{max-width:180px!important;width:100%!important;margin:0!important}.sn-v40-fallback-art .sn-simple-muscle-label,.sn-v40-fallback-art .sn-body-label{display:none!important}.sn-v40-fallback-copy{display:grid;gap:5px}.sn-v40-fallback-copy strong{font-size:15px;color:var(--text)}.sn-v40-fallback-copy span{font-size:12px;color:var(--muted)}.sn-v40-fallback-copy small{font-size:10px;color:var(--muted);font-weight:800}.sn-v40-fallback-copy p{margin:4px 0 0;font-size:11px;line-height:1.45;color:var(--muted)}.sn-v40-eq-icon{width:72px;height:72px;border-radius:20px;background:rgba(59,130,246,.08);color:var(--blue);display:grid;place-items:center}.sn-v40-eq-icon svg{width:42px;height:42px}
      .sn-v40-asset-wrap{display:flex;align-items:center;justify-content:center;aspect-ratio:16/9;min-height:180px}.sn-v40-asset{width:100%;height:100%;max-height:260px;object-fit:contain;border-radius:18px}
      .sn-v40-prev-row{display:grid;margin:10px 0}.sn-v40-prev{min-height:46px!important;font-weight:850!important}.sn-v40-prev:disabled{opacity:.38}
      .sn-v40-card.compact{margin:10px 0 16px;box-shadow:none}.sn-v40-card.compact .sn-v40-card-head{display:none}.sn-v40-card.compact .sn-v40-media{padding-top:14px}
      .sn-v40-instruction-stack{display:grid;gap:10px;margin:0 0 14px}.sn-v40-instruction{padding:15px 16px;border:1px solid var(--line);border-radius:18px;background:var(--surface)}.sn-v40-instruction h3{margin:0 0 8px;font-size:13px}.sn-v40-instruction p{margin:0;color:var(--muted);font-size:12px;line-height:1.55}.sn-v40-instruction ol,.sn-v40-instruction ul{margin:0;padding-left:19px;color:var(--muted);font-size:12px;line-height:1.55}.sn-v40-instruction li+li{margin-top:5px}.sn-v40-muscle-tags{display:flex;gap:6px;flex-wrap:wrap}.sn-v40-muscle-tags span{padding:6px 9px;border-radius:999px;background:rgba(59,130,246,.09);color:var(--text);font-size:11px;font-weight:750}
      @media(max-width:620px){.sn-v40-poses{grid-template-columns:1fr 24px 1fr;gap:5px}.sn-v40-arrow{width:24px;height:24px;font-size:16px}.sn-v40-media{padding:7px 8px 10px}.sn-v40-fallback{grid-template-columns:105px 1fr;min-height:160px;padding:12px;gap:10px}.sn-v40-fallback-art .sn-simple-muscle-wrap,.sn-v40-fallback-art .sn-dynamic-body-wrap{max-width:120px!important}.sn-v40-card-head strong{font-size:14px}}
      .dark .sn-v40-card{box-shadow:0 12px 30px rgba(0,0,0,.2)}
    `;document.head.appendChild(style);
  }

  function patchWorkout(){
    if(patching||state?.page!=="activeWorkout")return;const screen=document.querySelector(".workout-screen"),ex=currentExercise();if(!screen||!ex)return;const id=exerciseId(ex),existing=screen.querySelector(".sn-v40-card");const button=screen.querySelector("#snV40Previous");if(existing?.dataset?.v40Exercise===id&&button&&button.disabled===(currentIndex()<=0))return;
    patching=true;try{
      screen.querySelectorAll(":scope > .exercise-visual,.sn-exercise-focus-panel,.sn-v38-exercise-visual,.sn-v39-exercise-visual,.sn-v40-card").forEach(n=>n.remove());
      const anchor=screen.querySelector(".sn-exercise-head")||screen.querySelector(".exercise-title");if(anchor){anchor.insertAdjacentHTML(anchor.classList.contains("sn-exercise-head")?"afterend":"beforebegin",card(ex));const node=screen.querySelector(".sn-v40-card");if(node)bindImageError(node,ex);}
      screen.querySelectorAll(".sn-prev-row,.sn-v38-prev-row,.sn-v39-prev-row,.sn-v40-prev-row").forEach(n=>n.remove());const actions=screen.querySelector(".sn-workout-actions")||screen.querySelector(".workout-actions");if(actions){const row=document.createElement("div");row.className="sn-v40-prev-row";row.innerHTML=`<button class="secondary sn-v40-prev" id="snV40Previous" ${currentIndex()<=0?"disabled":""}>← Previous exercise</button>`;actions.insertAdjacentElement("beforebegin",row);row.querySelector("#snV40Previous")?.addEventListener("click",previousExercise);}
    }finally{patching=false;}
  }

  function patchExerciseModal(){
    const modal=document.querySelector("#snProductModal .sn-modal");if(!modal)return;const title=modal.querySelector(".sn-modal-head h2")?.textContent?.trim();if(!title)return;const ex=exerciseLibrary.find(x=>String(x.name).toLowerCase()===title.toLowerCase());if(!ex)return;
    if(!modal.querySelector(".sn-v40-card")){modal.querySelectorAll(".sn-v39-exercise-visual,.sn-v38-exercise-visual").forEach(n=>n.remove());modal.querySelector(".sn-modal-head")?.insertAdjacentHTML("afterend",card(ex,true));const visual=modal.querySelector(".sn-v40-card");if(visual)bindImageError(visual,ex);}
    if(modal.querySelector(".sn-v40-instruction-stack"))return;
    const {meta,steps,tips}=safeInfo(ex);const oldBlocks=[...modal.querySelectorAll(".sn-detail-block")];oldBlocks.filter(b=>["How to do it","Works","Common mistakes"].includes(b.querySelector("h3")?.textContent?.trim())).forEach(b=>b.remove());
    const stack=document.createElement("div");stack.className="sn-v40-instruction-stack";stack.innerHTML=`<div class="sn-v40-instruction"><h3>Primary muscles</h3><div class="sn-v40-muscle-tags"><span>${esc(meta.primary||ex.muscle||"Exercise")}</span>${(meta.secondary||[]).slice(0,3).map(x=>`<span>${esc(x)}</span>`).join("")}</div></div><div class="sn-v40-instruction"><h3>How to perform it</h3><ol>${steps.slice(0,4).map(x=>`<li>${esc(x)}</li>`).join("")}</ol></div><div class="sn-v40-instruction"><h3>Form tips</h3><ul>${tips.slice(0,3).map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`;
    const visual=modal.querySelector(".sn-v40-card");visual?.insertAdjacentElement("afterend",stack);
  }

  function hydrate(){if(!Array.isArray(exerciseLibrary))return;exerciseLibrary.forEach(ex=>{const r=resolve(ex);ex.imageRef=`exercise:${r.id}`;ex.visualKey=r.key;ex.equipment=r.equipment;ex.primaryMuscle=ex.primaryMuscle||ex.muscle||"Other";if(!("image" in ex))ex.image=null;});}
  function audit(){if(!Array.isArray(exerciseLibrary))return[];const rows=exerciseLibrary.map(ex=>{const r=resolve(ex);return{id:r.id,name:ex.name,muscle:ex.muscle||"Other",equipment:r.equipment,visual:r.key,image:r.asset||null,status:r.kind==="asset"?"approved exercise asset":r.kind==="diagram"?"approved instructional diagram":"muscle-map fallback — movement diagram still needed"};});window.START_NOW_EXERCISE_VISUAL_AUDIT=rows;window.START_NOW_EXERCISES_NEEDING_VISUALS=rows.filter(x=>x.status.includes("still needed"));if(SN){SN.exerciseVisualAudit=rows;SN.exercisesNeedingVisuals=window.START_NOW_EXERCISES_NEEDING_VISUALS;}console.info(`[START/NOW v40] ${rows.length-window.START_NOW_EXERCISES_NEEDING_VISUALS.length}/${rows.length} exercises have approved movement visuals. Remaining exercises use muscle-map fallbacks, never unrelated machines.`);return rows;}

  window.START_NOW_EXERCISE_IMAGES=APPROVED_ASSETS;
  window.START_NOW_EXERCISE_VISUAL_MAP=MAP;
  window.START_NOW_RESOLVE_EXERCISE_VISUAL=resolve;
  window.START_NOW_RENDER_EXERCISE_VISUAL=card;
  installStyles();hydrate();audit();
  const observer=new MutationObserver(()=>queueMicrotask(()=>{patchWorkout();patchExerciseModal();}));const root=document.getElementById("app");if(root)observer.observe(root,{childList:true,subtree:true});observer.observe(document.body,{childList:true,subtree:true});patchWorkout();patchExerciseModal();
})();