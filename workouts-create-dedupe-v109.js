// START/NOW v109 — keep one clear workout creation entry on the Workouts page.
(() => {
  function removeDuplicateCreate() {
    if (typeof state !== 'undefined' && state.page !== 'workouts') return;
    document.getElementById('createWorkoutBottom')?.remove();
    document.querySelectorAll('.add-workout-card').forEach(card => {
      if (/create a workout/i.test(card.textContent || '')) card.remove();
    });
  }

  if (typeof window.renderWorkouts === 'function') {
    const previousRenderWorkouts = window.renderWorkouts;
    window.renderWorkouts = function(...args) {
      const result = previousRenderWorkouts.apply(this, args);
      removeDuplicateCreate();
      return result;
    };
  }

  queueMicrotask(removeDuplicateCreate);
  window.START_NOW_WORKOUT_CREATE_DEDUPE = {
    version: 'v109',
    refresh: removeDuplicateCreate
  };
})();
