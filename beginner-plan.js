// Beginner-friendly "Build it for me" workout setup.
// Loaded after the main app so it can use the existing workout library and saved-workout system.
(() => {
  const originalRenderWorkouts = renderWorkouts;
  const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const starterState = {
    step: 0,
    goal: "confidence",
    selectedDays: ["Monday", "Wednesday", "Friday"],
    equipment: "full-gym",
    session: 45,
    generated: []
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

  function cloneExercise(ex, overrides = {}) {
    return { ...ex, ...overrides };
  }

  function libraryExercise(name, fallback, overrides = {}) {
    const exact = exerciseLibrary.find(ex => ex.name.toLowerCase() === name.toLowerCase());
    const partial = exerciseLibrary.find(ex => ex.name.toLowerCase().includes(name.toLowerCase()));
    return cloneExercise(exact || partial || fallback, overrides);
  }

  function bodyweight(id, name, muscle, reps, cue) {
    return { id, name, muscle, sets: 2, reps, weight: 0, cue };
  }

  const BW = {
    squat: bodyweight("starter-bodyweight-squat", "Bodyweight Squat", "Quads", 10, "Move slowly, keep your feet planted, and use a comfortable depth."),
    pushup: bodyweight("starter-incline-pushup", "Incline Push-Up", "Chest", 8, "Use a bench or sturdy raised surface and keep your body in one line."),
    bridge: bodyweight("starter-glute-bridge", "Glute Bridge", "Glutes", 12, "Press through your feet and squeeze your glutes at the top."),
    row: bodyweight("starter-backpack-row", "Supported Backpack Row", "Back", 10, "Keep the load light and pull toward your ribs with control."),
    lunge: bodyweight("starter-reverse-lunge", "Supported Reverse Lunge", "Quads", 8, "Hold onto something stable if needed and step back under control."),
    deadbug: bodyweight("starter-dead-bug", "Dead Bug", "Core", 8, "Keep your lower back gently pressed down and move slowly."),
    birddog: bodyweight("starter-bird-dog", "Bird Dog", "Core", 8, "Reach long without twisting your hips."),
    calf: bodyweight("starter-calf-raise", "Bodyweight Calf Raise", "Calves", 12, "Pause at the top and lower slowly."),
    shoulder: bodyweight("starter-wall-shoulder-tap", "Wall Shoulder Tap", "Shoulders", 10, "Stay tall and move one hand at a time without rushing."),
    plank: bodyweight("starter-elevated-plank", "Elevated Plank", "Core", 20, "Use a raised surface and hold a comfortable, steady position.")
  };

  function gymExercise(name, fallbackName, muscle, reps = 10, sets = 2) {
    const fallback = {
      id: `starter-${fallbackName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name: fallbackName,
      muscle,
      sets,
      reps,
      weight: 0,
      cue: "Use a light weight and move through a comfortable range with control."
    };
    return libraryExercise(name, fallback, { sets, reps });
  }

  function machinePool() {
    return {
      chest: gymExercise("Chest Press", "Chest Press", "Chest", 10),
      row: gymExercise("Seated Row", "Seated Row", "Back", 10),
      pulldown: gymExercise("Lat Pulldown", "Lat Pulldown", "Back", 10),
      legpress: gymExercise("Leg Press", "Leg Press", "Legs", 10),
      legcurl: gymExercise("Leg Curl", "Leg Curl", "Hamstrings", 12),
      legext: gymExercise("Leg Extension", "Leg Extension", "Quads", 12),
      shoulder: gymExercise("Shoulder Press", "Shoulder Press", "Shoulders", 10),
      lateral: gymExercise("Lateral Raise", "Lateral Raise", "Shoulders", 12),
      biceps: gymExercise("Biceps Curl", "Biceps Curl", "Biceps", 12),
      triceps: gymExercise("Triceps Pushdown", "Triceps Pushdown", "Triceps", 12),
      calf: gymExercise("Calf Raise", "Calf Raise", "Calves", 12),
      abduction: gymExercise("Hip Abduction", "Hip Abduction", "Glutes", 12),
      core: gymExercise("Cable Crunch", "Cable Crunch", "Core", 12)
    };
  }

  function buildTemplates() {
    const isHome = starterState.equipment === "home";
    const m = machinePool();

    if (isHome) {
      return [
        { name: "Beginner Full Body A", exercises: [BW.squat, BW.pushup, BW.row, BW.bridge, BW.deadbug] },
        { name: "Beginner Full Body B", exercises: [BW.lunge, BW.shoulder, BW.row, BW.calf, BW.birddog] },
        { name: "Beginner Full Body C", exercises: [BW.squat, BW.pushup, BW.bridge, BW.row, BW.plank] },
        { name: "Beginner Upper", exercises: [BW.pushup, BW.row, BW.shoulder, BW.birddog, BW.plank] },
        { name: "Beginner Lower", exercises: [BW.squat, BW.lunge, BW.bridge, BW.calf, BW.deadbug] },
        { name: "Beginner Technique Day", light: true, exercises: [BW.squat, BW.row, BW.bridge, BW.deadbug] },
        { name: "Beginner Easy Full Body", light: true, exercises: [BW.pushup, BW.lunge, BW.birddog, BW.calf] }
      ];
    }

    return [
      { name: "Beginner Full Body A", exercises: [m.legpress, m.chest, m.row, m.legcurl, m.core] },
      { name: "Beginner Full Body B", exercises: [m.legpress, m.pulldown, m.shoulder, m.abduction, m.biceps] },
      { name: "Beginner Full Body C", exercises: [m.legext, m.chest, m.row, m.legcurl, m.triceps, m.calf] },
      { name: "Beginner Upper", exercises: [m.chest, m.row, m.shoulder, m.pulldown, m.biceps, m.triceps] },
      { name: "Beginner Lower", exercises: [m.legpress, m.legcurl, m.legext, m.abduction, m.calf, m.core] },
      { name: "Beginner Technique Day", light: true, exercises: [m.chest, m.row, m.legpress, m.core] },
      { name: "Beginner Easy Full Body", light: true, exercises: [m.pulldown, m.legcurl, m.shoulder, m.calf] }
    ];
  }

  function planTemplates() {
    const days = [...starterState.selectedDays];
    const count = days.length;
    const t = buildTemplates();

    if (count === 1) return [{ ...t[0], day: days[0] }];
    if (count === 2) return [
      { ...t[0], day: days[0] },
      { ...t[1], day: days[1] }
    ];
    if (count === 3) return [
      { ...t[0], day: days[0] },
      { ...t[1], day: days[1] },
      { ...t[2], day: days[2] }
    ];
    if (count === 4) return [
      { ...t[3], name: "Beginner Upper A", day: days[0] },
      { ...t[4], name: "Beginner Lower A", day: days[1] },
      { ...t[3], name: "Beginner Upper B", day: days[2] },
      { ...t[4], name: "Beginner Lower B", day: days[3] }
    ];

    const expanded = [
      { ...t[3], name: "Beginner Upper A" },
      { ...t[4], name: "Beginner Lower A" },
      { ...t[5] },
      { ...t[3], name: "Beginner Upper B" },
      { ...t[4], name: "Beginner Lower B" },
      { ...t[6] },
      { ...t[5], name: "Beginner Recovery + Technique" }
    ];

    return days.map((day, index) => ({ ...expanded[index], day }));
  }

  function applySessionLength(exercises, light = false) {
    const maxExercises = starterState.session <= 30 ? 4 : starterState.session <= 45 ? 5 : 6;
    return exercises.slice(0, maxExercises).map(ex => ({ ...ex, sets: light ? 1 : 2 }));
  }

  function buildPlan() {
    starterState.generated = planTemplates().map(item => ({
      ...item,
      exercises: applySessionLength(item.exercises, Boolean(item.light))
    }));
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
        <div>
          <h2>Build it for me</h2>
          <p>Answer 4 easy questions and START/NOW will make your first weekly routine for you.</p>
        </div>
      </div>
      <div class="beginner-points"><span>✓ Beginner exercises</span><span>✓ Sets & reps included</span><span>✓ You choose the days</span></div>
      <button class="primary" id="openBeginnerSetup">Make my beginner plan →</button>
    `;
    heading.insertAdjacentElement("afterend", card);
    document.getElementById("openBeginnerSetup").addEventListener("click", openWizard);
  }

  renderWorkouts = function () {
    originalRenderWorkouts();
    injectBeginnerCard();
  };

  function resetStarter() {
    starterState.step = 0;
    starterState.goal = "confidence";
    starterState.selectedDays = ["Monday", "Wednesday", "Friday"];
    starterState.equipment = "full-gym";
    starterState.session = 45;
    starterState.generated = [];
  }

  function openWizard() {
    resetStarter();
    document.body.classList.add("beginner-modal-open");
    const overlay = document.createElement("div");
    overlay.className = "beginner-modal-overlay";
    overlay.id = "beginnerWizard";
    overlay.innerHTML = `<div class="beginner-modal" role="dialog" aria-modal="true" aria-labelledby="beginnerWizardTitle"></div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", e => {
      if (e.target === overlay) closeWizard();
    });
    renderWizardStep();
  }

  function closeWizard() {
    document.getElementById("beginnerWizard")?.remove();
    document.body.classList.remove("beginner-modal-open");
  }

  function modal() {
    return document.querySelector("#beginnerWizard .beginner-modal");
  }

  function optionButton(value, current, title, copy, group) {
    return `<button type="button" class="beginner-option ${String(value) === String(current) ? "selected" : ""}" data-${group}="${value}"><span class="beginner-option-check">${String(value) === String(current) ? "✓" : ""}</span><span><strong>${title}</strong><small>${copy}</small></span></button>`;
  }

  function dayButton(day) {
    const selected = starterState.selectedDays.includes(day);
    return `<button type="button" class="beginner-day ${selected ? "selected" : ""}" data-training-day="${day}" aria-pressed="${selected}"><span class="beginner-day-short">${day.slice(0, 3)}</span><span class="beginner-day-check">${selected ? "✓" : ""}</span></button>`;
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
      <p class="beginner-step-error" id="beginnerStepError" role="alert"></p>
    `;
  }

  function renderWizardStep() {
    const el = modal();
    if (!el) return;

    if (starterState.step === 0) {
      el.innerHTML = shell(
        "What do you want help with?",
        "You do not need to know workout terms. Pick the answer that sounds most like you.",
        [
          optionButton("confidence", starterState.goal, "Learn the gym", "I mainly want a simple plan so I know what to do.", "goal"),
          optionButton("strength", starterState.goal, "Get stronger", "Build basic strength with easy-to-learn exercises.", "goal"),
          optionButton("muscle", starterState.goal, "Build muscle", "Use a balanced routine that gradually gets harder.", "goal"),
          optionButton("fitness", starterState.goal, "General fitness", "Feel better, move more, and build a consistent habit.", "goal")
        ].join("")
      );
    } else if (starterState.step === 1) {
      el.innerHTML = shell(
        "Which days can you work out?",
        "Pick any days that fit your week — from 1 day up to all 7. If you choose 5–7 days, some sessions will automatically be lighter.",
        `<div class="beginner-day-grid">${ALL_DAYS.map(dayButton).join("")}</div><div class="beginner-day-helper"><strong>${starterState.selectedDays.length} selected</strong><span>${starterState.selectedDays.join(" • ") || "Choose at least one day"}</span></div>`
      );
    } else if (starterState.step === 2) {
      el.innerHTML = shell(
        "Where will you train?",
        "We will choose exercises that match what you actually have access to.",
        [
          optionButton("full-gym", starterState.equipment, "Full gym", "Machines, cables, dumbbells, and other gym equipment.", "equipment"),
          optionButton("machines", starterState.equipment, "Mostly machines", "Keep things simple with beginner-friendly machines.", "equipment"),
          optionButton("home", starterState.equipment, "Home / bodyweight", "No gym required.", "equipment")
        ].join("")
      );
    } else if (starterState.step === 3) {
      el.innerHTML = shell(
        "How long should workouts feel?",
        "Pick a time you can realistically make room for.",
        [
          optionButton(30, starterState.session, "About 30 minutes", "Short and simple — around 4 exercises.", "session"),
          optionButton(45, starterState.session, "About 45 minutes", "Balanced — around 5 exercises.", "session"),
          optionButton(60, starterState.session, "About 60 minutes", "A little more time — around 6 exercises.", "session")
        ].join(""),
        "Build my plan →"
      );
    } else {
      renderPlanReview();
      return;
    }

    bindWizardControls();
  }

  function bindWizardControls() {
    document.getElementById("closeBeginnerWizard")?.addEventListener("click", closeWizard);
    document.getElementById("beginnerBack")?.addEventListener("click", () => {
      starterState.step--;
      renderWizardStep();
    });

    document.querySelectorAll("[data-goal]").forEach(btn => btn.addEventListener("click", () => {
      starterState.goal = btn.dataset.goal;
      renderWizardStep();
    }));

    document.querySelectorAll("[data-training-day]").forEach(btn => btn.addEventListener("click", () => {
      const day = btn.dataset.trainingDay;
      if (starterState.selectedDays.includes(day)) {
        starterState.selectedDays = starterState.selectedDays.filter(item => item !== day);
      } else {
        starterState.selectedDays = ALL_DAYS.filter(item => item === day || starterState.selectedDays.includes(item));
      }
      renderWizardStep();
    }));

    document.querySelectorAll("[data-equipment]").forEach(btn => btn.addEventListener("click", () => {
      starterState.equipment = btn.dataset.equipment;
      renderWizardStep();
    }));

    document.querySelectorAll("[data-session]").forEach(btn => btn.addEventListener("click", () => {
      starterState.session = Number(btn.dataset.session);
      renderWizardStep();
    }));

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

  function renderPlanReview() {
    const el = modal();
    if (!el) return;
    const totalExercises = starterState.generated.reduce((sum, workout) => sum + workout.exercises.length, 0);
    el.innerHTML = `
      <div class="beginner-modal-top">
        <button type="button" class="beginner-close" id="closeBeginnerWizard" aria-label="Close">×</button>
        <div class="beginner-ready-check">✓</div>
      </div>
      <div class="beginner-kicker">YOUR FIRST ROUTINE</div>
      <h1 id="beginnerWizardTitle">Your plan is ready.</h1>
      <p class="beginner-subtitle">No guessing. We picked beginner-friendly exercises, sets, and reps for the exact days you chose.</p>

      <div class="beginner-summary-pills">
        <span>${starterState.selectedDays.length} days/week</span><span>${starterState.session} min</span><span>${equipmentLabels[starterState.equipment]}</span>
      </div>

      ${starterState.selectedDays.length >= 5 ? `<div class="beginner-reassurance"><strong>More days does not mean every day has to be hard.</strong><p>Because you selected ${starterState.selectedDays.length} days, START/NOW made some sessions lighter so the beginner plan stays manageable.</p></div>` : ""}

      <div class="beginner-review-list">
        ${starterState.generated.map((workout, index) => `
          <div class="beginner-review-workout">
            <div class="beginner-review-number">${index + 1}</div>
            <div class="beginner-review-copy">
              <strong>${workout.name}</strong>
              <span>${workout.day} • ${workout.exercises.length} exercises • ${workout.light ? "1 easy set each" : "2 sets each"}</span>
              <small>${workout.exercises.map(ex => ex.name).join(" • ")}</small>
            </div>
          </div>`).join("")}
      </div>

      <div class="beginner-reassurance">
        <strong>Start with manageable weight.</strong>
        <p>Your first goal is learning the movements and building a routine you can repeat. Increase weight gradually when the reps feel comfortable and controlled.</p>
      </div>

      <div class="beginner-plan-meta">${goalLabels[starterState.goal]} • ${totalExercises} exercise slots across the week</div>
      <div class="beginner-modal-actions review-actions">
        <button type="button" class="secondary beginner-back" id="beginnerBack">Change answers</button>
        <button type="button" class="primary beginner-next" id="saveBeginnerPlan">Use this plan</button>
      </div>
    `;
    document.getElementById("closeBeginnerWizard").addEventListener("click", closeWizard);
    document.getElementById("beginnerBack").addEventListener("click", () => {
      starterState.step = 3;
      renderWizardStep();
    });
    document.getElementById("saveBeginnerPlan").addEventListener("click", saveGeneratedPlan);
  }

  function saveGeneratedPlan() {
    const generatedDays = new Set(starterState.generated.map(w => w.day));

    state.customWorkouts = state.customWorkouts.map(workout => ({
      ...workout,
      days: (workout.days || []).filter(day => !generatedDays.has(day))
    }));

    const stamp = Date.now();
    const newWorkouts = starterState.generated.map((workout, index) => ({
      id: `starter-plan-${stamp}-${index}`,
      name: workout.name,
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
    showToast("Beginner plan added to your week");
  }
})();