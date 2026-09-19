// START/NOW v148 — movement-, muscle-, and workout-aware exercise swaps.
(() => {
  const SN = window.SN36;
  if (!SN) return;

  const clone = value => JSON.parse(JSON.stringify(value));
  const escape = value => String(value ?? "").replace(/[&<>'"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]));
  const text = value => String(value ?? "").trim();
  const lower = value => text(value).toLowerCase();
  const currentExercise = () => SN.active?.exercises?.[SN.active.index || 0] || null;

  const FAMILY_LABELS = {
    "chest-press": "chest press", "chest-fly": "chest fly", "chest-pullover": "chest pullover",
    "vertical-press": "overhead press", "angled-press": "angled shoulder press", "lateral-raise": "side-delt raise", "front-raise": "front-delt raise", "rear-delt": "rear-delt pull",
    "vertical-pull": "vertical back pull", "horizontal-row": "back row", "straight-arm-pull": "straight-arm lat pull", "back-hinge": "back-focused hip hinge",
    shrug: "shrug", carry: "loaded carry", "supinated-curl": "biceps curl", "neutral-curl": "hammer curl",
    "triceps-pushdown": "triceps pushdown", "overhead-triceps": "overhead triceps extension", "lying-triceps": "lying triceps extension", "triceps-press": "compound triceps press",
    "wrist-flexion": "wrist curl", grip: "grip hold", "bilateral-squat": "two-leg squat", "unilateral-knee": "single-leg knee-dominant movement",
    "leg-press": "leg press", "knee-extension": "knee extension", "static-knee": "static quad exercise", "knee-flexion": "hamstring curl", "hip-hinge": "hamstring hip hinge",
    "hip-thrust": "hip thrust or bridge", "glute-kickback": "glute kickback", "hip-abduction": "hip abduction", "calf-raise": "calf raise", tibialis: "tibialis raise",
    "core-flexion": "core flexion", "core-leg-raise": "lower-core raise", "core-anti-extension": "core stability", "core-lateral": "side-core stability", "core-rotation": "core rotation",
    "full-body-power": "full-body power", "sled-conditioning": "sled conditioning", "rope-conditioning": "rope conditioning",
    "cardio-walk-run": "walk or run cardio", "cardio-cycle": "cycling cardio", "cardio-climb": "climbing cardio", "cardio-row": "rowing cardio", "cardio-general": "cardio"
  };

  function primaryMuscle(exercise) {
    const supplied = text(exercise?.muscleGroups?.primary || exercise?.primaryMuscle || exercise?.muscle || SN.meta?.(exercise)?.primary || "Other");
    if (supplied !== "Legs") return supplied;
    const name = lower(exercise?.name);
    if (/leg curl|romanian|stiff[- ]leg|good morning|nordic/.test(name)) return "Hamstrings";
    if (/calf|tibialis/.test(name)) return "Calves";
    if (/hip thrust|glute bridge|glute drive|kickback|abduction/.test(name)) return "Glutes";
    if (/leg press|squat|lunge|step[- ]?(up|down)|leg extension/.test(name)) return "Quads";
    return supplied;
  }

  function movementProfile(exercise) {
    const name = lower(exercise?.name);
    const muscle = primaryMuscle(exercise);
    let family = `muscle-${lower(muscle).replace(/\s+/g, "-")}`;
    let variant = "general";

    if (muscle === "Chest") {
      if (/fly|pec deck/.test(name)) family = "chest-fly";
      else if (/pullover/.test(name)) family = "chest-pullover";
      else { family = "chest-press"; variant = /incline|low-to-high/.test(name) ? "incline" : /decline|dip|high-to-low/.test(name) ? "decline" : "flat"; }
    } else if (muscle === "Shoulders") {
      if (/lateral raise|upright row/.test(name)) family = "lateral-raise";
      else if (/front raise/.test(name)) family = "front-raise";
      else if (/landmine/.test(name)) family = "angled-press";
      else family = "vertical-press";
    } else if (muscle === "Rear Delts") {
      family = "rear-delt";
      variant = /row/.test(name) ? "row" : /face pull|pull-apart/.test(name) ? "pull" : "fly";
    } else if (muscle === "Back") {
      if (/straight-arm|pullover/.test(name)) family = "straight-arm-pull";
      else if (/pull-up|chin-up|pulldown/.test(name)) family = "vertical-pull";
      else if (/row/.test(name)) family = "horizontal-row";
      else family = "back-hinge";
    } else if (muscle === "Traps") {
      family = /carry/.test(name) ? "carry" : "shrug";
    } else if (muscle === "Biceps") {
      family = /hammer|cross-body|rope/.test(name) ? "neutral-curl" : "supinated-curl";
      variant = /preacher|spider|concentration/.test(name) ? "supported" : /incline|bayesian/.test(name) ? "lengthened" : "standard";
    } else if (muscle === "Triceps") {
      if (/pushdown/.test(name)) family = "triceps-pushdown";
      else if (/overhead/.test(name)) family = "overhead-triceps";
      else if (/skull/.test(name)) family = "lying-triceps";
      else family = "triceps-press";
    } else if (muscle === "Forearms") {
      family = /pinch|hang/.test(name) ? "grip" : "wrist-flexion";
      variant = /reverse/.test(name) ? "extension" : "flexion";
    } else if (muscle === "Quads") {
      if (/leg extension/.test(name)) family = "knee-extension";
      else if (/leg press/.test(name)) family = "leg-press";
      else if (/wall sit|spanish squat/.test(name)) family = "static-knee";
      else if (/bulgarian|split squat|lunge|step[- ]?(up|down)|curtsy/.test(name)) family = "unilateral-knee";
      else family = "bilateral-squat";
    } else if (muscle === "Hamstrings") {
      family = /leg curl|nordic|glute-ham raise/.test(name) ? "knee-flexion" : "hip-hinge";
      variant = /single-leg/.test(name) ? "unilateral" : "bilateral";
    } else if (muscle === "Glutes") {
      if (/abduction|lateral band|fire hydrant/.test(name)) family = "hip-abduction";
      else if (/kickback|donkey kick/.test(name)) family = "glute-kickback";
      else if (/step-down|curtsy/.test(name)) family = "unilateral-knee";
      else family = "hip-thrust";
      variant = /single-leg/.test(name) ? "unilateral" : "bilateral";
    } else if (muscle === "Calves") {
      family = /tibialis/.test(name) ? "tibialis" : "calf-raise";
      variant = /seated/.test(name) ? "seated" : "standing";
    } else if (muscle === "Core") {
      if (/russian twist|wood chop|rotation/.test(name)) family = "core-rotation";
      else if (/side plank|pallof|suitcase/.test(name)) family = "core-lateral";
      else if (/reverse crunch|knee raise|leg raise|v-up|toe touch|pike/.test(name)) family = "core-leg-raise";
      else if (/plank|dead bug|bird dog|hollow|ab wheel|bear crawl|mountain climber/.test(name)) family = "core-anti-extension";
      else family = "core-flexion";
    } else if (muscle === "Full Body") {
      if (/sled/.test(name)) family = "sled-conditioning";
      else if (/battle rope/.test(name)) family = "rope-conditioning";
      else family = "full-body-power";
    } else if (muscle === "Cardio") {
      if (/treadmill|run|walk|jump rope/.test(name)) family = "cardio-walk-run";
      else if (/bike/.test(name)) family = "cardio-cycle";
      else if (/stair|elliptical/.test(name)) family = "cardio-climb";
      else if (/row|ski/.test(name)) family = "cardio-row";
      else family = "cardio-general";
    }

    return { muscle, family, variant, label: FAMILY_LABELS[family] || `${muscle} movement` };
  }

  function secondaryMuscles(exercise) {
    const direct = exercise?.muscleGroups?.secondary || exercise?.secondaryMuscles;
    const values = Array.isArray(direct) ? direct : (SN.meta?.(exercise)?.secondary || []);
    return new Set(values.map(text).filter(Boolean));
  }

  function overlapCount(a, b) {
    const left = secondaryMuscles(a);
    return [...secondaryMuscles(b)].filter(item => left.has(item)).length;
  }

  function isCorrelatedSwap(source, candidate) {
    if (!source || !candidate || SN.exerciseMatches(candidate, source)) return false;
    const from = movementProfile(source);
    const to = movementProfile(candidate);
    return from.muscle === to.muscle && from.family === to.family;
  }

  function usedExerciseIds() {
    const active = SN.active;
    const used = new Set(active?.usedExerciseIds || []);
    if (!active?.exercises) return used;
    const currentIndex = active.index || 0;
    active.exercises.forEach((exercise, index) => { if (index !== currentIndex) used.add(SN.exerciseId(exercise)); });
    return used;
  }

  function workoutEquipmentPreference() {
    const counts = new Map();
    (SN.active?.exercises || []).forEach((exercise, index) => {
      if (index === (SN.active?.index || 0)) return;
      const equipment = SN.equipment(exercise);
      counts.set(equipment, (counts.get(equipment) || 0) + 1);
    });
    return counts;
  }

  function scoreCandidate(source, candidate, contextEquipment = new Map()) {
    const from = movementProfile(source);
    const to = movementProfile(candidate);
    let score = 100;
    if (from.variant === to.variant) score += 24;
    score += overlapCount(source, candidate) * 5;
    if (SN.equipment(candidate) === SN.equipment(source)) score += 10;
    score += Math.min(6, contextEquipment.get(SN.equipment(candidate)) || 0);
    return score;
  }

  function eligibleExercises(exercise, library = exerciseLibrary) {
    const used = usedExerciseIds();
    const equipmentContext = workoutEquipmentPreference();
    return library
      .filter(candidate => isCorrelatedSwap(exercise, candidate))
      .filter(candidate => !used.has(SN.exerciseId(candidate)))
      .map(candidate => ({ candidate, score: scoreCandidate(exercise, candidate, equipmentContext) }))
      .sort((a, b) => b.score - a.score || String(a.candidate.name || "").localeCompare(String(b.candidate.name || "")))
      .map(item => item.candidate);
  }

  function saveActive() { if (SN.active) SN.write(SN.keys.active, SN.active); }

  function applySwap(replacement, modal) {
    const old = currentExercise();
    if (!old || !replacement || !SN.active || !isCorrelatedSwap(old, replacement)) return;
    const hadCompletedSets = (old.sets || []).some(set => set.done);
    if (hadCompletedSets) SN.active.usedExerciseIds = [...new Set([...(SN.active.usedExerciseIds || []), SN.exerciseId(old)])];
    const range = SN.repRange(replacement);
    const normalized = SN.normalizeExercise?.(replacement, { workoutId: SN.active.workoutId }) || clone(replacement);
    SN.active.exercises[SN.active.index || 0] = {
      ...normalized, repMin: range.min, repMax: range.max,
      originalPlannedSets: old.originalPlannedSets || old.sets?.length || 1,
      swappedFrom: old.name, skipped: false, note: "",
      sets: (old.sets || []).map(set => ({...set, done: false}))
    };
    saveActive();
    modal.remove();
    render();
  }

  function openImprovedSwap() {
    const exercise = currentExercise();
    if (!exercise || !SN.active) return;
    document.getElementById("snProductModal")?.remove();
    const profile = movementProfile(exercise);
    const candidates = eligibleExercises(exercise);
    const modal = document.createElement("div");
    modal.className = "sn-modal-backdrop";
    modal.id = "snProductModal";
    modal.innerHTML = `
      <div class="sn-modal">
        <div class="sn-modal-head"><div><span>SWAP EXERCISE</span><h2>Replace ${escape(exercise.name)}</h2></div><button data-close aria-label="Close swap exercise">×</button></div>
        <p class="sn-modal-help">Only unused ${escape(profile.muscle)} exercises that perform the same ${escape(profile.label)} role in this workout are shown.</p>
        <input id="snSwapSearch" class="sn-modal-search" type="search" inputmode="search" autocomplete="off" placeholder="Search matching replacements" aria-label="Search replacement exercises" style="width:100%;box-sizing:border-box;margin:0 0 12px" />
        <div class="sn-option-list" id="snSwapOptions"></div>
      </div>`;
    document.body.appendChild(modal);
    const list = modal.querySelector("#snSwapOptions");
    const search = modal.querySelector("#snSwapSearch");

    function renderOptions(query = "") {
      const term = lower(query);
      const filtered = !term ? candidates : candidates.filter(candidate => `${candidate.name || ""} ${primaryMuscle(candidate)} ${SN.meta(candidate).equipment || ""}`.toLowerCase().includes(term));
      if (!filtered.length) {
        list.innerHTML = `<div class="sn-modal-help" style="padding:14px 4px">No unused exercises with the same muscle and movement role match your search.</div>`;
        return;
      }
      list.innerHTML = filtered.map(candidate => {
        const candidateProfile = movementProfile(candidate);
        return `<button class="sn-exercise-choice" data-swap="${escape(SN.exerciseId(candidate))}"><span><strong>${escape(candidate.name)}</strong><small>${escape(candidateProfile.muscle)} • ${escape(candidateProfile.label)} • ${escape(SN.meta(candidate).equipment)}</small></span><b>Swap →</b></button>`;
      }).join("");
      list.querySelectorAll("[data-swap]").forEach(button => {
        button.addEventListener("click", () => {
          const replacement = candidates.find(candidate => SN.exerciseId(candidate) === button.dataset.swap);
          applySwap(replacement, modal);
        });
      });
    }

    renderOptions();
    search.addEventListener("input", event => renderOptions(event.currentTarget.value));
    modal.querySelector("[data-close]").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", event => { if (event.target === modal) modal.remove(); });
    setTimeout(() => search.focus({preventScroll:true}), 0);
  }

  const engine = { primaryMuscle, movementProfile, isCorrelatedSwap, scoreCandidate, eligibleExercises };
  window.START_NOW_SWAP_ENGINE = engine;
  SN.alternatives = (exercise, limit = 6) => eligibleExercises(exercise).slice(0, limit);

  document.addEventListener("click", event => {
    const button = event.target.closest?.("#snSwapExercise");
    if (!button || !SN.active) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    openImprovedSwap();
  }, true);
})();
