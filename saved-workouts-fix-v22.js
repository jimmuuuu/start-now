// START/NOW v22 — saved workout cleanup + safer cross-tab persistence.
(() => {
  const WORKOUTS_KEY = "sn_custom_workouts";
  const REVISION_KEY = "sn_custom_workouts_revision";
  const DELETED_KEY = "sn_deleted_workout_ids";

  function readWorkouts(){
    try{
      const value = JSON.parse(localStorage.getItem(WORKOUTS_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    }catch{
      return [];
    }
  }

  function readDeleted(){
    try{
      const value = JSON.parse(localStorage.getItem(DELETED_KEY) || "[]");
      return new Set(Array.isArray(value) ? value : []);
    }catch{
      return new Set();
    }
  }

  function writeDeleted(set){
    localStorage.setItem(DELETED_KEY, JSON.stringify([...set].slice(-200)));
  }

  let knownRevision = Number(localStorage.getItem(REVISION_KEY) || 0);
  let pendingDeleteId = null;

  // Mark an explicit delete before app.js handles the click so the merge layer
  // knows this missing workout is intentional rather than stale-tab data loss.
  document.addEventListener("click", event => {
    const button = event.target.closest?.("[data-delete-workout]");
    if(button) pendingDeleteId = button.dataset.deleteWorkout || null;
  }, true);

  const originalSaveCustomWorkouts = saveCustomWorkouts;
  saveCustomWorkouts = function(){
    const remoteRevision = Number(localStorage.getItem(REVISION_KEY) || 0);
    const remote = readWorkouts();
    const deleted = readDeleted();

    if(pendingDeleteId){
      deleted.add(pendingDeleteId);
      writeDeleted(deleted);
    }

    const current = (state.customWorkouts || []).filter(workout => workout?.id && !deleted.has(workout.id));
    const currentById = new Map(current.map(workout => [workout.id, workout]));

    // If another tab has newer data, preserve workouts that only exist there.
    // Matching IDs keep the current tab's version so intentional edits still save.
    if(remoteRevision > knownRevision){
      const merged = [];
      const seen = new Set();

      remote.forEach(workout => {
        if(!workout?.id || deleted.has(workout.id)) return;
        const item = currentById.get(workout.id) || workout;
        merged.push(item);
        seen.add(workout.id);
      });

      current.forEach(workout => {
        if(!seen.has(workout.id)) merged.push(workout);
      });

      state.customWorkouts = merged;
    }else{
      state.customWorkouts = current;
    }

    originalSaveCustomWorkouts();
    knownRevision = Date.now();
    localStorage.setItem(REVISION_KEY, String(knownRevision));
    pendingDeleteId = null;
  };

  // Keep multiple open START/NOW tabs from silently drifting apart.
  window.addEventListener("storage", event => {
    if(event.key !== WORKOUTS_KEY && event.key !== REVISION_KEY) return;
    const incomingRevision = Number(localStorage.getItem(REVISION_KEY) || 0);
    if(incomingRevision <= knownRevision) return;

    const deleted = readDeleted();
    state.customWorkouts = readWorkouts().filter(workout => workout?.id && !deleted.has(workout.id));
    knownRevision = incomingRevision;

    if(state.page === "workouts" || state.page === "home") render();
  });

  // Push Day is a built-in quick-start fallback, not something the user saved.
  // Remove it from the "My workouts" list and correct the count after every render.
  const previousRenderWorkouts = renderWorkouts;
  renderWorkouts = function(){
    previousRenderWorkouts();

    document.querySelectorAll(".custom-workout-row .built-in-label").forEach(label => {
      const row = label.closest(".custom-workout-row");
      if(row) row.remove();
    });

    const count = document.querySelector(".workout-library-section .section-title-row span");
    if(count) count.textContent = `${state.customWorkouts.length} total`;
  };
})();
