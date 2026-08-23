// START/NOW v67 — fix Quick Workout route handoff.
// v66 called navActive?.() even when navActive was not declared globally, which can throw
// before the new Build / Choose Existing / Surprise Me screen renders.
(() => {
  if (typeof window.navActive !== 'function') {
    window.navActive = function navActive() {
      const page = (typeof state !== 'undefined' && state?.page) || 'home';
      document.querySelectorAll('.bottom-nav [data-page]').forEach(button => {
        button.classList.toggle('active', button.dataset.page === page);
      });
    };
  }

  // If the user was already on Quick Workout while this version loaded, repaint it once.
  if (typeof state !== 'undefined' && state?.page === 'quickWorkout') {
    window.START_NOW_QUICK_WORKOUT?.render?.();
  }

  window.START_NOW_QUICK_WORKOUT_ROUTE_FIX = { version: 'v67' };
})();
