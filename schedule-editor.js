// Simple schedule editor: lets users rearrange their current plan and change workout days without rebuilding it.
(() => {
  const WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const originalRenderWorkouts = renderWorkouts;
  let draft = {};
  let editableWorkouts = [];
  let editingDay = null;

  function planStamp(workout) {
    const match = String(workout?.id || "").match(/^starter-plan-(\d+)-/);
    return match ? Number(match[1]) : 0;
  }

  function currentPlanWorkouts() {
    const generated = state.customWorkouts.filter(workout => workout.beginnerGenerated && planStamp(workout));
    if (!generated.length) return [];
    const newestStamp = Math.max(...generated.map(planStamp));
    return generated.filter(workout => planStamp(workout) === newestStamp);
  }

  function workoutsForEditor() {
    const currentPlan = currentPlanWorkouts();
    if (currentPlan.length) return currentPlan;
    return state.customWorkouts.filter(workout => !workout.archived);
  }

  function injectEditButton() {
    const head = document.querySelector(".schedule-head");
    if (!head || document.getElementById("editWeeklySchedule")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.id = "editWeeklySchedule";
    button.className = "edit-schedule-btn";
    button.innerHTML = `<span>✎</span> Edit schedule`;
    button.addEventListener("click", openEditor);
    head.appendChild(button);

    const sub = head.querySelector(".schedule-sub");
    if (sub) sub.textContent = "Tap Edit schedule anytime to move workouts to different days.";
  }

  renderWorkouts = function () {
    originalRenderWorkouts();
    injectEditButton();
  };

  function buildDraft() {
    editableWorkouts = workoutsForEditor();
    const ids = new Set(editableWorkouts.map(workout => workout.id));
    draft = {};
    WEEK.forEach(day => {
      const workout = state.customWorkouts.find(item => ids.has(item.id) && (item.days || []).includes(day));
      draft[day] = workout?.id || null;
    });
  }

  function openEditor() {
    buildDraft();
    editingDay = null;
    document.body.classList.add("schedule-editor-open");

    const overlay = document.createElement("div");
    overlay.id = "scheduleEditor";
    overlay.className = "schedule-editor-overlay";
    overlay.innerHTML = `<div class="schedule-editor-modal" role="dialog" aria-modal="true" aria-labelledby="scheduleEditorTitle"></div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", event => {
      if (event.target === overlay) closeEditor();
    });
    renderEditor();
  }

  function closeEditor() {
    document.getElementById("scheduleEditor")?.remove();
    document.body.classList.remove("schedule-editor-open");
  }

  function modal() {
    return document.querySelector("#scheduleEditor .schedule-editor-modal");
  }

  function workoutById(id) {
    return editableWorkouts.find(workout => workout.id === id) || null;
  }

  function short(day) {
    return day.slice(0, 3);
  }

  function renderEditor() {
    const el = modal();
    if (!el) return;

    if (editingDay) {
      renderWorkoutPicker(editingDay);
      return;
    }

    const assignedCount = WEEK.filter(day => draft[day]).length;
    el.innerHTML = `
      <div class="schedule-editor-top">
        <button type="button" class="schedule-editor-close" id="closeScheduleEditor" aria-label="Close">×</button>
        <div class="schedule-editor-kicker">YOUR WEEK</div>
        <div class="schedule-editor-spacer"></div>
      </div>

      <h1 id="scheduleEditorTitle">Edit your schedule.</h1>
      <p class="schedule-editor-subtitle">Tap any day to change the workout. Moving a workout to an occupied day automatically swaps them for you.</p>

      <div class="schedule-editor-summary"><strong>${assignedCount} workout day${assignedCount === 1 ? "" : "s"}</strong><span>Changes are saved only when you tap Save schedule.</span></div>

      <div class="schedule-day-list">
        ${WEEK.map(day => {
          const workout = workoutById(draft[day]);
          return `
            <button type="button" class="schedule-edit-row ${workout ? "has-workout" : "is-rest"}" data-edit-day="${day}">
              <div class="schedule-edit-day"><strong>${short(day)}</strong><span>${day}</span></div>
              <div class="schedule-edit-main">
                <strong>${workout ? escapeHtml(workout.name) : "Rest day"}</strong>
                <span>${workout ? `${workout.exercises?.length || 0} exercises • ${escapeHtml(workoutMuscles(workout))}` : "No workout scheduled"}</span>
              </div>
              <div class="schedule-edit-action">Change <span>›</span></div>
            </button>`;
        }).join("")}
      </div>

      <div class="schedule-editor-actions">
        <button type="button" class="secondary" id="cancelScheduleChanges">Cancel</button>
        <button type="button" class="primary" id="saveScheduleChanges">Save schedule</button>
      </div>
    `;

    document.getElementById("closeScheduleEditor")?.addEventListener("click", closeEditor);
    document.getElementById("cancelScheduleChanges")?.addEventListener("click", closeEditor);
    document.getElementById("saveScheduleChanges")?.addEventListener("click", saveSchedule);
    document.querySelectorAll("[data-edit-day]").forEach(button => {
      button.addEventListener("click", () => {
        editingDay = button.dataset.editDay;
        renderEditor();
      });
    });
  }

  function renderWorkoutPicker(day) {
    const el = modal();
    if (!el) return;
    const currentId = draft[day];

    el.innerHTML = `
      <div class="schedule-editor-top">
        <button type="button" class="schedule-editor-back" id="backToSchedule">←</button>
        <div class="schedule-editor-kicker">${escapeHtml(day.toUpperCase())}</div>
        <button type="button" class="schedule-editor-close" id="closeScheduleEditor" aria-label="Close">×</button>
      </div>

      <h1 id="scheduleEditorTitle">What do you want to do?</h1>
      <p class="schedule-editor-subtitle">Choose a workout for ${escapeHtml(day)}, or make it a rest day.</p>

      <div class="schedule-picker-list">
        <button type="button" class="schedule-picker-option rest-option ${!currentId ? "selected" : ""}" data-pick-workout="">
          <span class="schedule-picker-icon">☾</span>
          <span><strong>Rest day</strong><small>No workout scheduled</small></span>
          <span class="schedule-picker-check">${!currentId ? "✓" : ""}</span>
        </button>
        ${editableWorkouts.map(workout => `
          <button type="button" class="schedule-picker-option ${currentId === workout.id ? "selected" : ""}" data-pick-workout="${escapeHtml(workout.id)}">
            <span class="schedule-picker-icon workout">🏋</span>
            <span><strong>${escapeHtml(workout.name)}</strong><small>${workout.exercises?.length || 0} exercises • ${escapeHtml(workoutMuscles(workout))}</small></span>
            <span class="schedule-picker-check">${currentId === workout.id ? "✓" : ""}</span>
          </button>`).join("")}
      </div>

      <p class="schedule-swap-note">Tip: if that workout is already on another day, START/NOW will swap the two days automatically.</p>
    `;

    document.getElementById("backToSchedule")?.addEventListener("click", () => {
      editingDay = null;
      renderEditor();
    });
    document.getElementById("closeScheduleEditor")?.addEventListener("click", closeEditor);
    document.querySelectorAll("[data-pick-workout]").forEach(button => {
      button.addEventListener("click", () => chooseWorkoutForDay(day, button.dataset.pickWorkout || null));
    });
  }

  function chooseWorkoutForDay(day, workoutId) {
    if (!workoutId) {
      draft[day] = null;
      editingDay = null;
      renderEditor();
      return;
    }

    const oldWorkoutOnTargetDay = draft[day];
    const otherDay = WEEK.find(other => other !== day && draft[other] === workoutId);

    draft[day] = workoutId;

    if (otherDay) {
      draft[otherDay] = oldWorkoutOnTargetDay || null;
    }

    editingDay = null;
    renderEditor();
  }

  function saveSchedule() {
    // The schedule editor is the single source of truth for the weekly schedule.
    // Keep workouts in the library, but clear their old day assignments first.
    state.customWorkouts = state.customWorkouts.map(workout => ({ ...workout, days: [] }));

    WEEK.forEach(day => {
      const id = draft[day];
      if (!id) return;
      const workout = state.customWorkouts.find(item => item.id === id);
      if (workout) workout.days.push(day);
    });

    saveCustomWorkouts();
    closeEditor();
    state.page = "workouts";
    render();
    showToast("Schedule updated");
  }
})();