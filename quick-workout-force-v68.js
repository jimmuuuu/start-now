// START/NOW v68 — force the new Quick Workout renderer and bypass the legacy v65 screen.
(() => {
  const renderNewQuickWorkout = () => {
    if (typeof state === 'undefined') return false;
    const module = window.START_NOW_QUICK_WORKOUT;
    if (!module || typeof module.render !== 'function') return false;
    state.page = 'quickWorkout';
    module.render();
    return true;
  };

  // Capture the Home Quick Workout shortcut before the v65 click handler can render its legacy screen.
  document.addEventListener('click', event => {
    const trigger = event.target.closest?.('[data-quick-action="quickWorkout"]');
    if (!trigger) return;
    if (!window.START_NOW_QUICK_WORKOUT?.render) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    renderNewQuickWorkout();
  }, true);

  // Ensure any later call to the global render route uses the v66 Quick Workout implementation.
  const previousRender = window.render;
  if (typeof previousRender === 'function') {
    window.render = function(...args) {
      if (typeof state !== 'undefined' && state.page === 'quickWorkout' && window.START_NOW_QUICK_WORKOUT?.render) {
        window.START_NOW_QUICK_WORKOUT.render();
        return;
      }
      return previousRender.apply(this, args);
    };
  }

  // If the old Quick Workout screen is already open when v68 loads, replace it immediately.
  if (typeof state !== 'undefined' && state.page === 'quickWorkout') {
    queueMicrotask(renderNewQuickWorkout);
  }

  window.START_NOW_QUICK_WORKOUT_FORCE = { version: 'v68', render: renderNewQuickWorkout };
})();
