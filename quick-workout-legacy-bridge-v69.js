// START/NOW v69 — replace any legacy v65 Quick Workout UI with the v66 Build / Existing / Surprise Me flow.
(() => {
  let replacing = false;

  function isLegacyQuickWorkoutVisible() {
    const root = document.getElementById('app');
    if (!root || typeof state === 'undefined' || state.page !== 'quickWorkout') return false;
    const text = root.textContent || '';
    return !!root.querySelector('.sn65-page') || (text.includes('Start empty workout') && text.includes('Choose exercises manually'));
  }

  function replaceLegacy() {
    if (replacing || !isLegacyQuickWorkoutVisible()) return false;
    const module = window.START_NOW_QUICK_WORKOUT;
    if (!module || typeof module.render !== 'function') return false;
    replacing = true;
    try {
      module.render();
      return true;
    } finally {
      queueMicrotask(() => { replacing = false; });
    }
  }

  // The v65 renderer can still win through its closed-over renderQuickWorkout function.
  // Watch only #app and only react when that exact legacy screen appears.
  const root = document.getElementById('app');
  if (root) {
    const observer = new MutationObserver(() => {
      if (!replacing) replaceLegacy();
    });
    observer.observe(root, { childList: true, subtree: true });
  }

  // Catch both the Home Quick Workout card and any route that lands on the old screen.
  document.addEventListener('click', () => {
    queueMicrotask(replaceLegacy);
  });

  // Replace it immediately if the user loaded this version while the legacy screen was already open.
  queueMicrotask(replaceLegacy);

  window.START_NOW_QUICK_WORKOUT_LEGACY_BRIDGE = { version: 'v69', replace: replaceLegacy };
})();
