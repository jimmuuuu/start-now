// START/NOW v71 — force the canonical Build / Choose existing / Surprise me Quick Workout UI.
(() => {
  let replacing = false;

  function canonicalModule() {
    return window.START_NOW_QUICK_WORKOUT;
  }

  function setText(node, value) {
    if (node && node.textContent !== value) node.textContent = value;
  }

  function patchCanonicalCopy() {
    const page = document.querySelector('.sn66-page');
    if (!page) return;
    const cards = [...page.querySelectorAll('.sn66-mode')];
    if (cards[0]) {
      setText(cards[0].querySelector('strong'), 'Build workout');
      setText(cards[0].querySelector('span:last-child'), 'Create a one-off workout');
    }
    if (cards[1]) {
      setText(cards[1].querySelector('strong'), 'Choose existing');
      setText(cards[1].querySelector('span:last-child'), 'Train one of your saved workouts');
    }
    if (cards[2]) {
      setText(cards[2].querySelector('strong'), 'Surprise me');
      setText(cards[2].querySelector('span:last-child'), 'Let START/NOW build one');
    }
  }

  function legacyVisible() {
    return !!document.querySelector('#app .sn65-page');
  }

  function renderCanonical() {
    if (replacing) return false;
    const module = canonicalModule();
    if (!module || typeof module.render !== 'function') return false;
    replacing = true;
    try {
      if (typeof state !== 'undefined') state.page = 'quickWorkout';
      module.render();
      patchCanonicalCopy();
      return true;
    } finally {
      queueMicrotask(() => { replacing = false; });
    }
  }

  // Home Quick Workout card + bottom center button both open the same canonical screen.
  document.addEventListener('click', event => {
    const trigger = event.target.closest?.('[data-sn70-action="quickWorkout"], [data-quick-action="quickWorkout"], #quickStart');
    if (!trigger || !canonicalModule()?.render) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    renderCanonical();
  }, true);

  // Prevent any older render wrapper from winning when state.page is Quick Workout.
  const previousRender = window.render;
  if (typeof previousRender === 'function') {
    window.render = function(...args) {
      if (typeof state !== 'undefined' && state.page === 'quickWorkout' && canonicalModule()?.render) {
        renderCanonical();
        return;
      }
      return previousRender.apply(this, args);
    };
  }

  // If a legacy Quick Workout renderer appears, replace that exact screen only.
  const root = document.getElementById('app');
  if (root) {
    const observer = new MutationObserver(() => {
      if (replacing) return;
      if (legacyVisible()) renderCanonical();
      else patchCanonicalCopy();
    });
    observer.observe(root, { childList: true, subtree: true });
  }

  queueMicrotask(() => {
    if (legacyVisible() || (typeof state !== 'undefined' && state.page === 'quickWorkout')) renderCanonical();
    else patchCanonicalCopy();
  });

  window.START_NOW_QUICK_WORKOUT_TAKEOVER = {
    version: 'v71',
    render: renderCanonical,
    audit() {
      const text = document.getElementById('app')?.textContent || '';
      return {
        buildWorkout: text.includes('Build workout'),
        chooseExisting: text.includes('Choose existing'),
        surpriseMe: text.includes('Surprise me'),
        legacyRendererAbsent: !document.querySelector('#app .sn65-page')
      };
    }
  };
})();
