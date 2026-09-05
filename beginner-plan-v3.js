// START/NOW beginner plan builder v3 — goal-aware plan structures, real variation, editable before saving.
(() => {
  const originalRenderWorkouts = renderWorkouts;
  const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const starterState = {
    step: 0,
    goal: "confidence",
    selectedDays: ["Monday", "Wednesday", "Friday"],
    equipment: "full-gym",
    session: 45,
    generated: [],
    variant: 0,
    editIndex: null
  };

  const goalLabels = {
    confidence: "Learn the gym & feel confident",
    strength: "Get stronger",
    muscle: "Build muscle",
    fitness: "General fitness"
  };

  const equipmentLabels = {
    "full-gym": "Full gym",
    machines: "Mostly machines",
    home: "Home / bodyweight"
  };

  const goalNotes = {
    confidence: "Simple, repeatable movements with extra emphasis on exercises that are easy to learn.",
    strength: "More emphasis on big movement patterns with slightly lower rep targets and more working sets.",
    muscle: "More muscle-group coverage, push/pull/legs variety, and accessory work with moderate rep targets.",
    fitness: "Balanced training that spreads full-body work across the week and prioritizes consistency."
  };

  function installStyles() {
    if (document.getElementById("snBeginnerV3Styles")) return;
    const style = document.createElement("style");
    style.id = "snBeginnerV3Styles";
    style.textContent = `
      .beginner-answer-summary{margin:14px 0;padding:13px 14px;border:1px solid var(--line);border-radius:16px;background:#fafaf7}
      .beginner-answer-summary strong{display:block;font-size:12px;margin-bottom:6px;color:var(--text)}
      .beginner-answer-summary p{margin:0;color:var(--muted);font-size:11px;line-height:1.45}
      .beginner-review-workout{grid-template-columns:34px minmax(0,1fr) auto!important;align-items:start}
      .beginner-review-edit{min-height:34px;padding:0 10px;border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--text);font-size:11px;font-weight:850}
      .beginner-review-exercises{display:grid;gap:5px;margin-top:7px}
      .beginner-review-exercise{display:flex;gap:7px;align-items:center;font-size:11px;color:#666}
      .beginner-review-exercise b{color:var(--text);font-weight:800}
      .beginner-review-workout.editing{grid-template-columns:1fr!important;padding:14px;background:linear-gradient(145deg,var(--surface),rgba(59,130,246,.04));border-color:rgba(59,130,246,.24)}
      .beginner-inline-editor{display:grid;gap:12px}
      .beginner-inline-editor-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
      .beginner-inline-editor-head strong{font-size:14px}
      .beginner-inline-done{min-height:36px;padding:0 12px;border:0;border-radius:10px;background:var(--text);color:var(--surface);font-size:11px;font-weight:900}
      .beginner-edit-grid{display:grid;grid-template-columns:1fr 150px;gap:9px}
      .beginner-edit-field label{display:block;font-size:10px;font-weight:900;color:var(--muted);letter-spacing:.04em;margin:0 0 5px}
      .beginner-edit-field input,.beginner-edit-field select,.beginner-exercise-select,.beginner-number-input{width:100%;min-height:42px;border:1px solid var(--line);border-radius:11px;background:var(--surface);color:var(--text);padding:0 10px;font:inherit;font-size:12px}
      .beginner-edit-exercise-list{display:grid;gap:8px}
      .beginner-edit-exercise-row{display:grid;grid-template-columns:minmax(0,1fr) 62px 62px 38px;gap:7px;align-items:center}
      .beginner-edit-exercise-row .beginner-number-input{text-align:center;padding:0 4px}
      .beginner-remove-exercise{width:38px;height:42px;border:1px solid var(--line);border-radius:11px;background:var(--surface);color:var(--muted);font-size:18px}
      .beginner-add-exercise{min-height:42px;border:1px dashed rgba(59,130,246,.4);border-radius:12px;background:rgba(59,130,246,.05);color:var(--blue);font-size:12px;font-weight:900}
      .beginner-review-controls{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:12px 0 0}
      .beginner-try-another{min-height:46px;border:1px solid var(--line);border-radius:13px;background:var(--surface);color:var(--text);font-weight:850}
      .beginner-review-hint{margin:10px 0 0;color:var(--muted);font-size:11px;line-height:1.4;text-align:center}
      .dark .beginner-answer-summary{background:#202326}.dark .beginner-review-exercise{color:#a8abb0}
      @media(max-width:460px){
        .beginner-edit-grid{grid-template-columns:1fr}
        .beginner-edit-exercise-row{grid-template-columns:minmax(0,1fr) 58px 58px 36px}
        .beginner-review-controls{grid-template-columns:1fr}
      }
    `;
    document.head.appendChild(style);
  }

  function cloneExercise(ex, overrides = {}) {
    return { ...ex, ...overrides };
  }

  function fallbackExercise(name, muscle, cue = "Use a manageable resistance and move with control.") {
    return {
      id: `starter-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name,
      muscle,
      sets: 2,
      reps: 10,
      weight: 0,
      cue
    };
  }

  function findExercise(name, muscle) {
    const target = String(name).toLowerCase();
    const exact = exerciseLibrary.find(ex => String(ex.name).toLowerCase() === target);
    const partial = exerciseLibrary.find(ex => String(ex.name).toLowerCase().includes(target));
    return cloneExercise(exact || partial || fallbackExercise(name, muscle));
  }

  const SPECS = {
    machines: [
      ["Chest Press", "Chest", "push"], ["Machine Chest Press", "Chest", "push"], ["Pec Deck Fly", "Chest", "chest-iso"], ["Cable Fly", "Chest", "chest-iso"],
      ["Seated Row", "Back", "pull"], ["Lat Pulldown", "Back", "pull"], ["Machine Row", "Back", "pull"], ["Assisted Pull-Up", "Back", "pull"],
      ["Machine Reverse Fly", "Rear Delts", "rear"], ["Face Pull", "Rear Delts", "rear"],
      ["Leg Press", "Legs", "quad"], ["Hack Squat", "Quads", "quad"], ["Leg Extension", "Quads", "quad"],
      ["Leg Curl", "Hamstrings", "hinge"], ["Seated Leg Curl", "Hamstrings", "hinge"], ["Lying Leg Curl", "Hamstrings", "hinge"],
      ["Hip Abduction", "Glutes", "glute"], ["Glute Drive", "Glutes", "glute"], ["Calf Raise", "Calves", "calves"], ["Seated Calf Raise", "Calves", "calves"],
      ["Shoulder Press", "Shoulders", "shoulder"], ["Machine Shoulder Press", "Shoulders", "shoulder"], ["Machine Lateral Raise", "Shoulders", "side-delt"],
      ["Biceps Curl", "Biceps", "biceps"], ["Preacher Curl Machine", "Biceps", "biceps"], ["Triceps Pushdown", "Triceps", "triceps"], ["Triceps Extension Machine", "Triceps", "triceps"],
      ["Cable Crunch", "Core", "core"], ["Ab Crunch Machine", "Core", "core"]
    ],
    "full-gym": [
      ["Dumbbell Bench Press", "Chest", "push"], ["Chest Press", "Chest", "push"], ["Barbell Bench Press", "Chest", "push"], ["Incline Dumbbell Bench Press", "Chest", "chest-iso"], ["Cable Fly", "Chest", "chest-iso"], ["Pec Deck Fly", "Chest", "chest-iso"],
      ["Seated Row", "Back", "pull"], ["Lat Pulldown", "Back", "pull"], ["One-Arm Dumbbell Row", "Back", "pull"], ["Chest-Supported Dumbbell Row", "Back", "pull"], ["Face Pull", "Rear Delts", "rear"], ["Reverse Fly", "Rear Delts", "rear"],
      ["Leg Press", "Legs", "quad"], ["Goblet Squat", "Quads", "quad"], ["Hack Squat", "Quads", "quad"], ["Leg Extension", "Quads", "quad"],
      ["Dumbbell Romanian Deadlift", "Hamstrings", "hinge"], ["Leg Curl", "Hamstrings", "hinge"], ["Seated Leg Curl", "Hamstrings", "hinge"], ["Hip Thrust", "Glutes", "hinge"],
      ["Hip Abduction", "Glutes", "glute"], ["Dumbbell Hip Thrust", "Glutes", "glute"], ["Cable Kickback", "Glutes", "glute"], ["Calf Raise", "Calves", "calves"], ["Seated Calf Raise", "Calves", "calves"],
      ["Seated Dumbbell Shoulder Press", "Shoulders", "shoulder"], ["Shoulder Press", "Shoulders", "shoulder"], ["Landmine Press", "Shoulders", "shoulder"], ["Lateral Raise", "Shoulders", "side-delt"], ["Cable Lateral Raise", "Shoulders", "side-delt"],
      ["Biceps Curl", "Biceps", "biceps"], ["Hammer Curl", "Biceps", "biceps"], ["Cable Curl", "Biceps", "biceps"], ["Triceps Pushdown", "Triceps", "triceps"], ["Overhead Cable Triceps Extension", "Triceps", "triceps"],
      ["Cable Crunch", "Core", "core"], ["Plank", "Core", "core"], ["Dead Bug", "Core", "core"]
    ],
    home: [
      ["Bodyweight Squat", "Quads", "quad"], ["Supported Reverse Lunge", "Quads", "quad"], ["Split Squat", "Quads", "quad"],
      ["Incline Push-Up", "Chest", "push"], ["Push-Up", "Chest", "push"], ["Close-Grip Push-Up", "Chest", "push"],
      ["Supported Backpack Row", "Back", "pull"], ["Backpack Row", "Back", "pull"], ["Towel Row", "Back", "pull"],
      ["Glute Bridge", "Glutes", "hinge"], ["Single-Leg Glute Bridge", "Glutes", "hinge"], ["Backpack Romanian Deadlift", "Hamstrings", "hinge"],
      ["Single-Leg Glute Bridge", "Glutes", "glute"], ["Donkey Kick", "Glutes", "glute"],
      ["Wall Shoulder Tap", "Shoulders", "shoulder"], ["Pike Push-Up", "Shoulders", "shoulder"], ["Lateral Raise with Bottles", "Shoulders", "side-delt"],
      ["Backpack Curl", "Biceps", "biceps"], ["Close-Grip Push-Up", "Triceps", "triceps"],
      ["Bodyweight Calf Raise", "Calves", "calves"], ["Single-Leg Calf Raise", "Calves", "calves"],
      ["Dead Bug", "Core", "core"], ["Bird Dog", "Core", "core"], ["Elevated Plank", "Core", "core"]
    ]
  };

  function specObjects() {
    return SPECS[starterState.equipment].map(([name, muscle, role]) => ({ name, muscle, role }));
  }

  function prescription(light = false) {
    if (light) return { sets: starterState.goal === "strength" ? 2 : 1, reps: starterState.goal === "strength" ? 8 : starterState.goal === "muscle" ? 12 : 10 };
    if (starterState.goal === "strength") return { sets: starterState.session >= 45 ? 3 : 2, reps: 8 };
    if (starterState.goal === "muscle") return { sets: starterState.session >= 45 ? 3 : 2, reps: 12 };
    if (starterState.goal === "fitness") return { sets: 2, reps: 12 };
    return { sets: 2, reps: 10 };
  }

  function roleCandidates(role) {
    const specs = specObjects().filter(spec => spec.role === role);
    return specs.length ? specs : specObjects();
  }

  function exerciseForRole(role, used, offset, light = false, seed = 0) {
    const choices = roleCandidates(role);
    const rotation = starterState.variant * 3 + seed + offset;
    let picked = choices[rotation % choices.length];
    for (let i = 0; i < choices.length; i++) {
      const candidate = choices[(rotation + i) % choices.length];
      if (!used.has(candidate.name)) { picked = candidate; break; }
    }
    used.add(picked.name);
    const rx = prescription(light);
    return cloneExercise(findExercise(picked.name, picked.muscle), { sets: rx.sets, reps: rx.reps, weight: 0 });
  }

  function maxExercises() {
    return starterState.session <= 30 ? 4 : starterState.session <= 45 ? 5 : 6;
  }

  function workoutFromPattern(name, day, pattern, light = false, note = "", seed = 0) {
    const used = new Set();
    const count = Math.min(maxExercises(), pattern.length);
    const exercises = pattern.slice(0, count).map((role, index) => exerciseForRole(role, used, index, light, seed));
    return { name, day, exercises, light, note };
  }

  function patternsForGoal() {
    if (starterState.goal === "strength") {
      return {
        fullA: ["quad", "push", "pull", "hinge", "shoulder", "core"],
        fullB: ["hinge", "pull", "push", "quad", "shoulder", "core"],
        fullC: ["quad", "shoulder", "pull", "hinge", "push", "core"],
        upper: ["push", "pull", "shoulder", "pull", "biceps", "triceps"],
        lower: ["quad", "hinge", "glute", "quad", "calves", "core"],
        push: ["push", "shoulder", "chest-iso", "triceps", "side-delt", "core"],
        pull: ["pull", "pull", "rear", "biceps", "biceps", "core"],
        legs: ["quad", "hinge", "glute", "quad", "calves", "core"],
        armsCore: ["biceps", "triceps", "side-delt", "rear", "core", "calves"]
      };
    }
    if (starterState.goal === "muscle") {
      return {
        fullA: ["quad", "push", "pull", "hinge", "side-delt", "core"],
        fullB: ["hinge", "pull", "chest-iso", "quad", "biceps", "triceps"],
        fullC: ["quad", "push", "pull", "glute", "side-delt", "calves"],
        upper: ["push", "pull", "chest-iso", "shoulder", "biceps", "triceps"],
        lower: ["quad", "hinge", "glute", "quad", "calves", "core"],
        push: ["push", "chest-iso", "shoulder", "side-delt", "triceps", "triceps"],
        pull: ["pull", "pull", "rear", "biceps", "biceps", "core"],
        legs: ["quad", "hinge", "glute", "quad", "calves", "core"],
        armsCore: ["biceps", "triceps", "side-delt", "rear", "biceps", "core"]
      };
    }
    if (starterState.goal === "fitness") {
      return {
        fullA: ["quad", "push", "pull", "hinge", "core", "calves"],
        fullB: ["hinge", "pull", "shoulder", "quad", "core", "glute"],
        fullC: ["quad", "push", "pull", "glute", "core", "calves"],
        upper: ["push", "pull", "shoulder", "rear", "biceps", "core"],
        lower: ["quad", "hinge", "glute", "calves", "core", "quad"],
        push: ["push", "shoulder", "triceps", "side-delt", "core", "chest-iso"],
        pull: ["pull", "rear", "biceps", "pull", "core", "calves"],
        legs: ["quad", "hinge", "glute", "calves", "core", "quad"],
        armsCore: ["biceps", "triceps", "side-delt", "core", "rear", "calves"]
      };
    }
    return {
      fullA: ["quad", "push", "pull", "hinge", "core", "calves"],
      fullB: ["quad", "pull", "shoulder", "hinge", "biceps", "core"],
      fullC: ["quad", "push", "pull", "glute", "triceps", "calves"],
      upper: ["push", "pull", "shoulder", "rear", "biceps", "triceps"],
      lower: ["quad", "hinge", "glute", "quad", "calves", "core"],
      push: ["push", "shoulder", "chest-iso", "triceps", "side-delt", "core"],
      pull: ["pull", "pull", "rear", "biceps", "core", "calves"],
      legs: ["quad", "hinge", "glute", "quad", "calves", "core"],
      armsCore: ["biceps", "triceps", "side-delt", "rear", "core", "calves"]
    };
  }

  function layoutsForCount(count, p) {
    const fullBody = [
      { name: "Full Body A", pattern: p.fullA },
      { name: "Full Body B", pattern: p.fullB },
      { name: "Full Body C", pattern: p.fullC }
    ];

    if (count === 1) return [[{ name: "Full Body", pattern: p.fullA }]];

    if (count === 2) {
      const layouts = [
        [{ name: "Full Body A", pattern: p.fullA }, { name: "Full Body B", pattern: p.fullB }],
        [{ name: "Upper", pattern: p.upper }, { name: "Lower", pattern: p.lower }],
        [{ name: "Push + Legs", pattern: [...p.push.slice(0,3), ...p.legs.slice(0,3)] }, { name: "Pull + Legs", pattern: [...p.pull.slice(0,3), ...p.legs.slice(2,5)] }]
      ];
      return starterState.goal === "strength" || starterState.goal === "muscle" ? [layouts[1], layouts[0], layouts[2]] : layouts;
    }

    if (count === 3) {
      const layouts = [
        fullBody,
        [{ name: "Push", pattern: p.push }, { name: "Pull", pattern: p.pull }, { name: "Legs", pattern: p.legs }],
        [{ name: "Upper", pattern: p.upper }, { name: "Lower", pattern: p.lower }, { name: "Full Body", pattern: p.fullC }]
      ];
      return starterState.goal === "muscle" ? [layouts[1], layouts[0], layouts[2]] : layouts;
    }

    if (count === 4) {
      const layouts = [
        [{ name: "Upper A", pattern: p.upper }, { name: "Lower A", pattern: p.lower }, { name: "Upper B", pattern: [...p.upper].reverse() }, { name: "Lower B", pattern: [...p.lower].reverse() }],
        [{ name: "Push", pattern: p.push }, { name: "Pull", pattern: p.pull }, { name: "Legs", pattern: p.legs }, { name: "Full Body", pattern: p.fullC }],
        [{ name: "Full Body A", pattern: p.fullA }, { name: "Upper", pattern: p.upper }, { name: "Lower", pattern: p.lower }, { name: "Full Body B", pattern: p.fullB }]
      ];
      return starterState.goal === "fitness" || starterState.goal === "confidence" ? [layouts[2], layouts[0], layouts[1]] : layouts;
    }

    if (count === 5) {
      const layouts = [
        [{ name: "Push", pattern: p.push }, { name: "Pull", pattern: p.pull }, { name: "Legs", pattern: p.legs }, { name: "Upper", pattern: p.upper }, { name: "Lower", pattern: p.lower }],
        [{ name: "Upper A", pattern: p.upper }, { name: "Lower A", pattern: p.lower }, { name: "Full Body", pattern: p.fullC, light: true }, { name: "Upper B", pattern: [...p.upper].reverse() }, { name: "Lower B", pattern: [...p.lower].reverse() }],
        [{ name: "Full Body A", pattern: p.fullA }, { name: "Push", pattern: p.push }, { name: "Pull", pattern: p.pull }, { name: "Legs", pattern: p.legs }, { name: "Full Body B", pattern: p.fullB, light: true }]
      ];
      return starterState.goal === "muscle" ? layouts : [layouts[1], layouts[0], layouts[2]];
    }

    if (count === 6) {
      return [
        [{ name: "Push A", pattern: p.push }, { name: "Pull A", pattern: p.pull }, { name: "Legs A", pattern: p.legs }, { name: "Push B", pattern: [...p.push].reverse(), light: true }, { name: "Pull B", pattern: [...p.pull].reverse(), light: true }, { name: "Legs B", pattern: [...p.legs].reverse(), light: true }],
        [{ name: "Upper A", pattern: p.upper }, { name: "Lower A", pattern: p.lower }, { name: "Full Body A", pattern: p.fullA, light: true }, { name: "Upper B", pattern: [...p.upper].reverse() }, { name: "Lower B", pattern: [...p.lower].reverse() }, { name: "Full Body B", pattern: p.fullB, light: true }],
        [{ name: "Push", pattern: p.push }, { name: "Pull", pattern: p.pull }, { name: "Legs", pattern: p.legs }, { name: "Upper", pattern: p.upper, light: true }, { name: "Lower", pattern: p.lower, light: true }, { name: "Full Body", pattern: p.fullC, light: true }]
      ];
    }

    return [
      [{ name: "Push A", pattern: p.push }, { name: "Pull A", pattern: p.pull }, { name: "Legs A", pattern: p.legs }, { name: "Upper", pattern: p.upper }, { name: "Lower", pattern: p.lower }, { name: "Push B", pattern: [...p.push].reverse(), light: true }, { name: "Pull B", pattern: [...p.pull].reverse(), light: true }],
      [{ name: "Upper A", pattern: p.upper }, { name: "Lower A", pattern: p.lower }, { name: "Full Body A", pattern: p.fullA }, { name: "Upper B", pattern: [...p.upper].reverse(), light: true }, { name: "Lower B", pattern: [...p.lower].reverse(), light: true }, { name: "Full Body B", pattern: p.fullB, light: true }, { name: "Arms & Core", pattern: p.armsCore, light: true }],
      [{ name: "Push", pattern: p.push }, { name: "Pull", pattern: p.pull }, { name: "Legs", pattern: p.legs }, { name: "Full Body A", pattern: p.fullA, light: true }, { name: "Upper", pattern: p.upper, light: true }, { name: "Lower", pattern: p.lower, light: true }, { name: "Full Body B", pattern: p.fullB, light: true }]
    ];
  }

  function buildPlan() {
    const days = [...starterState.selectedDays];
    const p = patternsForGoal();
    const layouts = layoutsForCount(days.length, p);
    const layout = layouts[starterState.variant % layouts.length];

    starterState.generated = days.map((day, index) => {
      const item = layout[index];
      const light = Boolean(item.light);
      return workoutFromPattern(
        item.name,
        day,
        item.pattern,
        light,
        light ? "Lower volume because this plan has several training days." : goalNotes[starterState.goal],
        index * 2
      );
    });
    starterState.editIndex = null;
  }

  function injectBeginnerCard() {
    const heading = document.querySelector(".workouts-heading-row");
    if (!heading || document.getElementById("beginnerPlanCard")) return;
    const card = document.createElement("section");
    card.id = "beginnerPlanCard";
    card.className = "card beginner-plan-card";
    card.innerHTML = `
      <div class="beginner-badge">NEW TO THE GYM?</div>
      <div class="beginner-plan-copy">
        <div class="beginner-plan-icon">✦</div>
        <div><h2>Build it for me</h2><p>Answer 4 easy questions and Level Up Fitness will build a routine from your actual answers.</p></div>
      </div>
      <div class="beginner-points"><span>✓ Goal-based plan</span><span>✓ Matches your equipment</span><span>✓ Editable before saving</span></div>
      <button class="primary" id="openBeginnerSetup">Make my beginner plan →</button>`;
    heading.insertAdjacentElement("afterend", card);
    document.getElementById("openBeginnerSetup").addEventListener("click", openWizard);
  }

  renderWorkouts = function () {
    originalRenderWorkouts();
    injectBeginnerCard();
  };

  function resetStarter() {
    Object.assign(starterState, {
      step: 0,
      goal: "confidence",
      selectedDays: ["Monday", "Wednesday", "Friday"],
      equipment: "full-gym",
      session: 45,
      generated: [],
      variant: 0,
      editIndex: null
    });
  }

  function openWizard() {
    resetStarter();
    document.body.classList.add("beginner-modal-open");
    const overlay = document.createElement("div");
    overlay.className = "beginner-modal-overlay";
    overlay.id = "beginnerWizard";
    overlay.innerHTML = `<div class="beginner-modal" role="dialog" aria-modal="true" aria-labelledby="beginnerWizardTitle"></div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", e => { if (e.target === overlay) closeWizard(); });
    renderWizardStep();
  }

  function closeWizard() {
    document.getElementById("beginnerWizard")?.remove();
    document.body.classList.remove("beginner-modal-open");
  }

  function modal() { return document.querySelector("#beginnerWizard .beginner-modal"); }

  function optionButton(value, current, title, copy, group) {
    return `<button type="button" class="beginner-option ${String(value) === String(current) ? "selected" : ""}" data-${group}="${value}"><span class="beginner-option-check">${String(value) === String(current) ? "✓" : ""}</span><span><strong>${title}</strong><small>${copy}</small></span></button>`;
  }

  function dayButton(day) {
    const selected = starterState.selectedDays.includes(day);
    return `<button type="button" class="beginner-day ${selected ? "selected" : ""}" data-training-day="${day}" aria-pressed="${selected}"><span class="beginner-day-short">${day.slice(0,3)}</span><span class="beginner-day-check">${selected ? "✓" : ""}</span></button>`;
  }

  function shell(title, subtitle, body, nextLabel = "Continue") {
    return `
      <div class="beginner-modal-top">
        <button type="button" class="beginner-close" id="closeBeginnerWizard" aria-label="Close">×</button>
        <div class="beginner-step-dots">${[0,1,2,3].map(i => `<span class="${i <= starterState.step ? "active" : ""}"></span>`).join("")}</div>
      </div>
      <div class="beginner-kicker">BEGINNER SETUP</div>
      <h1 id="beginnerWizardTitle">${title}</h1>
      <p class="beginner-subtitle">${subtitle}</p>
      <div class="beginner-options">${body}</div>
      <div class="beginner-modal-actions">
        ${starterState.step > 0 ? `<button type="button" class="secondary beginner-back" id="beginnerBack">Back</button>` : ""}
        <button type="button" class="primary beginner-next" id="beginnerNext">${nextLabel}</button>
      </div>
      <p class="beginner-step-error" id="beginnerStepError" role="alert"></p>`;
  }

  function renderWizardStep() {
    const el = modal();
    if (!el) return;

    if (starterState.step === 0) {
      el.innerHTML = shell("What do you want help with?", "Your answer changes the exercise choices, sets, reps, and plan structure.", [
        optionButton("confidence", starterState.goal, "Learn the gym", "Simple, repeatable exercises so you know exactly what to do.", "goal"),
        optionButton("strength", starterState.goal, "Get stronger", "More focus on big movements with slightly lower rep targets.", "goal"),
        optionButton("muscle", starterState.goal, "Build muscle", "More muscle-group coverage and accessory work.", "goal"),
        optionButton("fitness", starterState.goal, "General fitness", "Balanced training built around consistency.", "goal")
      ].join(""));
    } else if (starterState.step === 1) {
      el.innerHTML = shell("Which days can you work out?", "Pick the exact days that fit your week. Your preview will use these days and you can still edit it before saving.", `<div class="beginner-day-grid">${ALL_DAYS.map(dayButton).join("")}</div><div class="beginner-day-helper"><strong>${starterState.selectedDays.length} selected</strong><span>${starterState.selectedDays.join(" • ") || "Choose at least one day"}</span></div>`);
    } else if (starterState.step === 2) {
      el.innerHTML = shell("Where will you train?", "This directly changes which exercises Level Up Fitness can choose.", [
        optionButton("full-gym", starterState.equipment, "Full gym", "Mix beginner-friendly machines, cables, and dumbbells.", "equipment"),
        optionButton("machines", starterState.equipment, "Mostly machines", "Keep the routine machine-focused and easy to learn.", "equipment"),
        optionButton("home", starterState.equipment, "Home / bodyweight", "Use bodyweight and simple at-home movements.", "equipment")
      ].join(""));
    } else if (starterState.step === 3) {
      el.innerHTML = shell("How long should workouts feel?", "This changes how many exercises Level Up Fitness puts in each workout.", [
        optionButton(30, starterState.session, "About 30 minutes", "Short and focused — around 4 exercises.", "session"),
        optionButton(45, starterState.session, "About 45 minutes", "Balanced — around 5 exercises.", "session"),
        optionButton(60, starterState.session, "About 60 minutes", "More room — around 6 exercises.", "session")
      ].join(""), "Build my plan →");
    } else {
      renderPlanReview();
      return;
    }

    bindWizardControls();
  }

  function bindWizardControls() {
    document.getElementById("closeBeginnerWizard")?.addEventListener("click", closeWizard);
    document.getElementById("beginnerBack")?.addEventListener("click", () => { starterState.step--; renderWizardStep(); });

    document.querySelectorAll("[data-goal]").forEach(btn => btn.addEventListener("click", () => { starterState.goal = btn.dataset.goal; starterState.variant = 0; renderWizardStep(); }));
    document.querySelectorAll("[data-training-day]").forEach(btn => btn.addEventListener("click", () => {
      const day = btn.dataset.trainingDay;
      if (starterState.selectedDays.includes(day)) starterState.selectedDays = starterState.selectedDays.filter(item => item !== day);
      else starterState.selectedDays = ALL_DAYS.filter(item => item === day || starterState.selectedDays.includes(item));
      starterState.variant = 0;
      renderWizardStep();
    }));
    document.querySelectorAll("[data-equipment]").forEach(btn => btn.addEventListener("click", () => { starterState.equipment = btn.dataset.equipment; starterState.variant = 0; renderWizardStep(); }));
    document.querySelectorAll("[data-session]").forEach(btn => btn.addEventListener("click", () => { starterState.session = Number(btn.dataset.session); starterState.variant = 0; renderWizardStep(); }));

    document.getElementById("beginnerNext")?.addEventListener("click", () => {
      if (starterState.step === 1 && starterState.selectedDays.length < 1) {
        const error = document.getElementById("beginnerStepError");
        if (error) error.textContent = "Choose at least one workout day.";
        return;
      }
      starterState.step++;
      if (starterState.step === 4) buildPlan();
      renderWizardStep();
    });
  }

  function editableCandidates() {
    const seen = new Set();
    return specObjects().map(spec => {
      const ex = findExercise(spec.name, spec.muscle);
      if (seen.has(ex.name)) return null;
      seen.add(ex.name);
      return ex;
    }).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
  }

  function exerciseOptions(currentName) {
    const candidates = editableCandidates();
    if (!candidates.some(ex => ex.name === currentName)) candidates.unshift(findExercise(currentName, "Full body"));
    return candidates.map(ex => `<option value="${escapeHtml(ex.name)}" ${ex.name === currentName ? "selected" : ""}>${escapeHtml(ex.name)}</option>`).join("");
  }

  function renderWorkoutEditor(workout, index) {
    return `
      <div class="beginner-inline-editor">
        <div class="beginner-inline-editor-head"><strong>Edit this workout</strong><button type="button" class="beginner-inline-done" data-done-edit="${index}">Done</button></div>
        <div class="beginner-edit-grid">
          <div class="beginner-edit-field"><label>WORKOUT NAME</label><input type="text" maxlength="40" value="${escapeHtml(workout.name)}" data-workout-name="${index}"></div>
          <div class="beginner-edit-field"><label>DAY</label><select data-workout-day="${index}">${starterState.selectedDays.map(day => `<option value="${day}" ${day === workout.day ? "selected" : ""}>${day}</option>`).join("")}</select></div>
        </div>
        <div class="beginner-edit-exercise-list">
          ${workout.exercises.map((ex, exIndex) => `
            <div class="beginner-edit-exercise-row">
              <select class="beginner-exercise-select" data-exercise-select="${index}:${exIndex}">${exerciseOptions(ex.name)}</select>
              <input class="beginner-number-input" type="number" min="1" max="5" value="${Number(ex.sets) || 1}" aria-label="Sets" data-exercise-sets="${index}:${exIndex}">
              <input class="beginner-number-input" type="number" min="5" max="30" value="${Number(ex.reps) || 10}" aria-label="Reps" data-exercise-reps="${index}:${exIndex}">
              <button type="button" class="beginner-remove-exercise" aria-label="Remove ${escapeHtml(ex.name)}" data-remove-exercise="${index}:${exIndex}">×</button>
            </div>`).join("")}
        </div>
        ${workout.exercises.length < 8 ? `<button type="button" class="beginner-add-exercise" data-add-exercise="${index}">＋ Add exercise</button>` : ""}
        <div class="beginner-review-hint">Exercise row numbers are <strong>sets</strong> then <strong>reps</strong>. Nothing is saved until you press Use this plan.</div>
      </div>`;
  }

  function renderPlanReview() {
    const el = modal();
    if (!el) return;
    const totalExercises = starterState.generated.reduce((sum, workout) => sum + workout.exercises.length, 0);

    el.innerHTML = `
      <div class="beginner-modal-top"><button type="button" class="beginner-close" id="closeBeginnerWizard" aria-label="Close">×</button><div class="beginner-ready-check">✓</div></div>
      <div class="beginner-kicker">PREVIEW — NOT SAVED YET</div>
      <h1 id="beginnerWizardTitle">Here’s what your answers built.</h1>
      <p class="beginner-subtitle">Review everything first. Edit any workout, swap exercises, change sets/reps, change its day, or generate another version. Your schedule does not change until you press <strong>Use this plan</strong>.</p>

      <div class="beginner-summary-pills">
        <span>${goalLabels[starterState.goal]}</span><span>${starterState.selectedDays.length} days/week</span><span>${starterState.session} min</span><span>${equipmentLabels[starterState.equipment]}</span>
      </div>
      <div class="beginner-answer-summary"><strong>WHY IT LOOKS LIKE THIS</strong><p>${goalNotes[starterState.goal]} ${starterState.equipment === "machines" ? "You chose mostly machines, so the exercise choices stay machine-focused." : starterState.equipment === "home" ? "You chose home/bodyweight, so the plan avoids gym-only equipment." : "You chose a full gym, so the plan can mix machines and simple free-weight movements."} ${starterState.session} minutes gives you about ${maxExercises()} exercises per session.</p></div>

      ${starterState.selectedDays.length >= 6 ? `<div class="beginner-reassurance"><strong>Some workouts use reduced volume.</strong><p>You selected ${starterState.selectedDays.length} training days, so a few sessions use fewer sets instead of making every day a high-volume workout.</p></div>` : ""}

      <div class="beginner-review-list">
        ${starterState.generated.map((workout, index) => starterState.editIndex === index ? `
          <div class="beginner-review-workout editing">${renderWorkoutEditor(workout, index)}</div>` : `
          <div class="beginner-review-workout">
            <div class="beginner-review-number">${index + 1}</div>
            <div class="beginner-review-copy">
              <strong>${escapeHtml(workout.name)}</strong>
              <span>${workout.day} • ${workout.exercises.length} exercises • ${workout.light ? "reduced volume" : `${workout.exercises[0]?.sets || 2} sets each`}</span>
              <div class="beginner-review-exercises">${workout.exercises.map(ex => `<div class="beginner-review-exercise"><b>${escapeHtml(ex.name)}</b><span>${ex.sets} × ${ex.reps}</span></div>`).join("")}</div>
            </div>
            <button type="button" class="beginner-review-edit" data-edit-workout="${index}">Edit</button>
          </div>`).join("")}
      </div>

      <div class="beginner-review-controls">
        <button type="button" class="beginner-try-another" id="tryAnotherPlan">↻ Try a different plan</button>
        <button type="button" class="beginner-try-another" id="changeBeginnerAnswers">← Change my answers</button>
      </div>
      <div class="beginner-plan-meta">${totalExercises} exercise slots across the week • Preview only</div>
      <div class="beginner-modal-actions review-actions"><button type="button" class="primary beginner-next" id="saveBeginnerPlan">Use this plan</button></div>`;

    bindReviewControls();
  }

  function parsePair(value) {
    const [a, b] = String(value).split(":").map(Number);
    return [a, b];
  }

  function bindReviewControls() {
    document.getElementById("closeBeginnerWizard")?.addEventListener("click", closeWizard);
    document.getElementById("saveBeginnerPlan")?.addEventListener("click", saveGeneratedPlan);
    document.getElementById("changeBeginnerAnswers")?.addEventListener("click", () => { starterState.step = 3; starterState.editIndex = null; renderWizardStep(); });
    document.getElementById("tryAnotherPlan")?.addEventListener("click", () => { starterState.variant++; buildPlan(); renderPlanReview(); });

    document.querySelectorAll("[data-edit-workout]").forEach(btn => btn.addEventListener("click", () => { starterState.editIndex = Number(btn.dataset.editWorkout); renderPlanReview(); }));
    document.querySelectorAll("[data-done-edit]").forEach(btn => btn.addEventListener("click", () => { starterState.editIndex = null; renderPlanReview(); }));

    document.querySelectorAll("[data-workout-name]").forEach(input => input.addEventListener("input", () => {
      const index = Number(input.dataset.workoutName);
      starterState.generated[index].name = input.value.trimStart().slice(0, 40) || "My Workout";
    }));

    document.querySelectorAll("[data-workout-day]").forEach(select => select.addEventListener("change", () => {
      const index = Number(select.dataset.workoutDay);
      const oldWorkout = starterState.generated[index];
      const oldDay = oldWorkout.day;
      const nextDay = select.value;
      const otherIndex = starterState.generated.findIndex((w, i) => i !== index && w.day === nextDay);
      oldWorkout.day = nextDay;
      if (otherIndex >= 0) starterState.generated[otherIndex].day = oldDay;
      starterState.generated.sort((a, b) => ALL_DAYS.indexOf(a.day) - ALL_DAYS.indexOf(b.day));
      starterState.editIndex = starterState.generated.indexOf(oldWorkout);
      renderPlanReview();
    }));

    document.querySelectorAll("[data-exercise-select]").forEach(select => select.addEventListener("change", () => {
      const [wIndex, exIndex] = parsePair(select.dataset.exerciseSelect);
      const old = starterState.generated[wIndex].exercises[exIndex];
      const spec = specObjects().find(item => item.name === select.value);
      const replacement = findExercise(select.value, spec?.muscle || old.muscle);
      starterState.generated[wIndex].exercises[exIndex] = { ...replacement, sets: old.sets, reps: old.reps, weight: 0 };
      renderPlanReview();
    }));

    document.querySelectorAll("[data-exercise-sets]").forEach(input => input.addEventListener("change", () => {
      const [wIndex, exIndex] = parsePair(input.dataset.exerciseSets);
      const value = Math.min(5, Math.max(1, Number(input.value) || 1));
      starterState.generated[wIndex].exercises[exIndex].sets = value;
      input.value = value;
    }));

    document.querySelectorAll("[data-exercise-reps]").forEach(input => input.addEventListener("change", () => {
      const [wIndex, exIndex] = parsePair(input.dataset.exerciseReps);
      const value = Math.min(30, Math.max(5, Number(input.value) || 10));
      starterState.generated[wIndex].exercises[exIndex].reps = value;
      input.value = value;
    }));

    document.querySelectorAll("[data-remove-exercise]").forEach(btn => btn.addEventListener("click", () => {
      const [wIndex, exIndex] = parsePair(btn.dataset.removeExercise);
      if (starterState.generated[wIndex].exercises.length <= 2) {
        if (typeof showToast === "function") showToast("Keep at least 2 exercises in a workout");
        return;
      }
      starterState.generated[wIndex].exercises.splice(exIndex, 1);
      renderPlanReview();
    }));

    document.querySelectorAll("[data-add-exercise]").forEach(btn => btn.addEventListener("click", () => {
      const index = Number(btn.dataset.addExercise);
      const workout = starterState.generated[index];
      const used = new Set(workout.exercises.map(ex => ex.name));
      const candidates = editableCandidates().filter(ex => !used.has(ex.name));
      const candidate = candidates[(starterState.variant + index) % Math.max(candidates.length, 1)];
      if (!candidate) return;
      const rx = prescription(Boolean(workout.light));
      workout.exercises.push({ ...candidate, sets: rx.sets, reps: rx.reps, weight: 0 });
      starterState.editIndex = index;
      renderPlanReview();
    }));
  }

  function saveGeneratedPlan() {
    if (!starterState.generated.length) return;
    const generatedDays = new Set(starterState.generated.map(w => w.day));
    state.customWorkouts = state.customWorkouts.map(workout => ({ ...workout, days: (workout.days || []).filter(day => !generatedDays.has(day)) }));

    const stamp = Date.now();
    const newWorkouts = starterState.generated.map((workout, index) => ({
      id: `starter-plan-${stamp}-${index}`,
      name: workout.name || `Workout ${index + 1}`,
      builtIn: false,
      beginnerGenerated: true,
      days: [workout.day],
      exercises: workout.exercises.map(ex => ({ ...ex }))
    }));

    state.customWorkouts.push(...newWorkouts);
    saveCustomWorkouts();
    closeWizard();
    state.page = "workouts";
    render();
    showToast("Plan saved — it is now your current schedule");
  }

  installStyles();
})();
