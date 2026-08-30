// START/NOW v132 — Train resumes an existing active workout before opening Quick Workout.
(() => {
  const SN = window.SN36;
  if (!SN || typeof state === 'undefined' || typeof render !== 'function') return;

  function activeSession() {
    try {
      return SN.activeWorkoutSession?.() || SN.active || null;
    } catch {
      return SN.active || null;
    }
  }

  document.addEventListener('click', event => {
    if (!event.target.closest?.('#quickStart')) return;

    const active = activeSession();
    if (!active?.workoutName || !Array.isArray(active.exercises) || !active.exercises.length) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    state.page = 'activeWorkout';
    render();
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, true);

  window.START_NOW_TRAIN_RESUME = {
    version: 'v132',
    hasActiveWorkout: () => {
      const active = activeSession();
      return Boolean(active?.workoutName && Array.isArray(active.exercises) && active.exercises.length);
    }
  };
})();
