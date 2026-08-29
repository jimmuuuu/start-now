// START/NOW v128 — declutter the active workout exercise screen.
(() => {
  const VERSION = 'v128';
  const STYLE_ID = 'sn128-active-workout-declutter';

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .sn-workout-screen .sn-performance-block.suggestion,
      .sn-workout-screen .sn-rep-explainer {
        display: none !important;
      }
      .sn-workout-screen .sn-performance-card {
        grid-template-columns: minmax(0, 1fr) !important;
      }
    `;
    document.head.appendChild(style);
  }

  function cleanActiveWorkout() {
    installStyles();
    document.querySelectorAll('.sn-workout-screen .sn-performance-block.suggestion, .sn-workout-screen .sn-rep-explainer')
      .forEach(node => node.remove());

    document.querySelectorAll('.sn-workout-screen .sn-performance-card').forEach(card => {
      card.classList.add('sn128-last-time-only');
    });
  }

  const app = document.getElementById('app');
  if (app && typeof MutationObserver === 'function') {
    let queued = false;
    const observer = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        cleanActiveWorkout();
      });
    });
    observer.observe(app, { childList: true, subtree: true });
  }

  cleanActiveWorkout();
  window.START_NOW_ACTIVE_WORKOUT_DECLUTTER = { version: VERSION, refresh: cleanActiveWorkout };
})();
