// START/NOW v119 — guarantee one current muscle-map renderer across browsers/accounts.
(() => {
  const VERSION = 'v119';
  let applying = false;
  let queued = false;

  const onHome = () => typeof state === 'undefined' || state?.page === 'home';

  function currentCard() {
    return document.querySelector('.sn59-muscle-card');
  }

  function legacyCard() {
    return document.querySelector('.sn51-muscle-card:not(.sn59-muscle-card), .sn58-muscle-card:not(.sn59-muscle-card)');
  }

  function renderCurrent() {
    queued = false;
    if (applying || !onHome()) return;
    applying = true;
    try {
      const renderer = window.START_NOW_MUSCLE_PRESENTATION;
      if (renderer?.version === 'v59' && typeof renderer.render === 'function') {
        renderer.render();
      }

      const card = currentCard();
      if (card) {
        card.hidden = false;
        card.style.removeProperty('display');
        card.removeAttribute('aria-hidden');
        card.dataset.muscleMapVersion = VERSION;
      }

      // If a legacy renderer ran after the current one, immediately replace it.
      if (legacyCard() && renderer?.version === 'v59' && typeof renderer.render === 'function') {
        renderer.render();
      }
    } finally {
      applying = false;
    }
  }

  function schedule() {
    if (queued) return;
    queued = true;
    queueMicrotask(renderCurrent);
  }

  // Make the newest renderer the final operation after every Home render.
  if (typeof renderHome === 'function') {
    const previousRenderHome = renderHome;
    window.renderHome = function(...args) {
      const result = previousRenderHome.apply(this, args);
      schedule();
      return result;
    };
  }

  // Account/cloud restore and late UI wrappers can mutate Home after render.
  const app = document.getElementById('app');
  if (app && typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => {
      if (!onHome()) return;
      if (legacyCard() || !currentCard()) schedule();
    });
    observer.observe(app, { childList: true, subtree: true });
  }

  window.addEventListener('pageshow', schedule);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) schedule();
  });

  window.START_NOW_MUSCLE_VERSION_LOCK = {
    version: VERSION,
    refresh: renderCurrent
  };

  schedule();
  setTimeout(renderCurrent, 150);
  setTimeout(renderCurrent, 700);
})();
