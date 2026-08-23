// START/NOW v72 — centralized page router for main + Quick Action destinations.
(() => {
  const root = document.getElementById('app');
  if (!root || typeof state === 'undefined' || typeof window.render !== 'function') return;

  const previousRender = window.render;
  const SECONDARY = new Set(['quickWorkout', 'exerciseLibrary', 'calendar', 'myStats']);
  const ACTION_TO_PAGE = {
    quickWorkout: 'quickWorkout',
    exerciseLibrary: 'exerciseLibrary',
    calendar: 'calendar',
    myStats: 'myStats'
  };
  const ALIASES = {
    'quick-workout': 'quickWorkout',
    'exercise-library': 'exerciseLibrary',
    'workout-calendar': 'calendar',
    'my-stats': 'myStats'
  };
  const BACK_SELECTORS = {
    quickWorkout: '.sn66-back',
    exerciseLibrary: '#snBack',
    calendar: '.sn63-back',
    myStats: '.sn70-back'
  };

  let currentPage = ALIASES[state.page] || state.page || 'home';
  let backPage = 'home';
  let routing = false;

  function normalize(page) {
    return ALIASES[page] || page || 'home';
  }

  function isSecondary(page) {
    return SECONDARY.has(normalize(page));
  }

  function setNavState(page) {
    const target = normalize(page);
    document.querySelectorAll('.nav-item').forEach(button => {
      const active = !isSecondary(target) && button.dataset.page === target;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
  }

  function clearMain() {
    root.replaceChildren();
    document.getElementById('snProductModal')?.remove();
  }

  function patchQuickWorkoutCopy() {
    const page = root.querySelector('.sn66-page');
    if (!page) return;
    const cards = [...page.querySelectorAll('.sn66-mode')];
    if (cards[0]) {
      cards[0].querySelector('strong')?.replaceChildren('Build workout');
      cards[0].querySelector('span:last-child')?.replaceChildren('Create a one-off workout');
    }
    if (cards[1]) {
      cards[1].querySelector('strong')?.replaceChildren('Choose existing');
      cards[1].querySelector('span:last-child')?.replaceChildren('Train one of your saved workouts');
    }
    if (cards[2]) {
      cards[2].querySelector('strong')?.replaceChildren('Surprise me');
      cards[2].querySelector('span:last-child')?.replaceChildren('Let START/NOW build one');
    }
  }

  function renderSecondary(page) {
    const target = normalize(page);
    clearMain();
    setNavState(target);
    root.dataset.activePage = target;

    if (target === 'quickWorkout') {
      const module = window.START_NOW_QUICK_WORKOUT;
      if (!module?.render) throw new Error('Quick Workout renderer is unavailable');
      module.render();
      patchQuickWorkoutCopy();
    } else if (target === 'calendar') {
      const module = window.START_NOW_WORKOUT_CALENDAR;
      if (!module?.render) throw new Error('Workout Calendar renderer is unavailable');
      module.render();
    } else if (target === 'myStats') {
      const module = window.START_NOW_QUICK_ACTIONS;
      if (!module?.renderStats) throw new Error('My Stats renderer is unavailable');
      module.renderStats();
    } else if (target === 'exerciseLibrary') {
      // Exercise Library already belongs to the core state.page/render chain in product-pages-v36.
      // Calling the existing renderer here reuses that architecture instead of creating a second library.
      previousRender.call(window);
    }

    setNavState(target);
    root.dataset.activePage = target;
    currentPage = target;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    queueMicrotask(() => audit(target));
  }

  function renderCurrent(...args) {
    if (routing) return;
    const target = normalize(state.page);

    if (isSecondary(target)) {
      if (!isSecondary(currentPage) && currentPage !== target) backPage = currentPage || 'home';
      routing = true;
      try {
        renderSecondary(target);
      } finally {
        routing = false;
      }
      return;
    }

    clearMain();
    setNavState(target);
    root.dataset.activePage = target;
    currentPage = target;
    const result = previousRender.apply(window, args);
    setNavState(target);
    root.dataset.activePage = target;
    return result;
  }

  function navigate(page, options = {}) {
    const target = normalize(page);
    const from = currentPage || normalize(state.page);
    if (isSecondary(target) && !isSecondary(from) && !options.keepBack) backPage = from || 'home';
    state.page = target;
    renderCurrent();
  }

  function goBack() {
    const destination = backPage && !isSecondary(backPage) ? backPage : 'home';
    navigate(destination, { keepBack: true });
  }

  function audit(page = normalize(state.page)) {
    const target = normalize(page);
    const homeMarkers = [
      '.plan-card',
      '.sn70-quick-actions',
      '.streak-card',
      '.tip',
      '.sn54-rest-card',
      '.sn58-muscle-card',
      '.sn51-muscle-card'
    ];
    const leakedHomeSelectors = isSecondary(target)
      ? homeMarkers.filter(selector => root.querySelector(selector))
      : [];
    const expected = {
      quickWorkout: '.sn66-page',
      exerciseLibrary: '.sn-page',
      calendar: '.sn63-calendar-page',
      myStats: '.sn70-page'
    }[target];
    const destinationVisible = expected ? !!root.querySelector(expected) : root.children.length > 0;
    const result = {
      page: target,
      destinationVisible,
      homeHidden: leakedHomeSelectors.length === 0,
      leakedHomeSelectors,
      activeNavItems: document.querySelectorAll('.nav-item.active').length,
      scrollTop: Math.round(window.scrollY || document.documentElement.scrollTop || 0),
      singleMainRoot: root.children.length === 1
    };
    if (isSecondary(target) && (!result.destinationVisible || !result.homeHidden)) {
      console.error('[START/NOW Router] Standalone-page audit failed', result);
    } else {
      console.debug('[START/NOW Router] page audit', result);
    }
    return result;
  }

  // Quick Action cards use this same state.page router rather than injecting content into Home.
  document.addEventListener('click', event => {
    const card = event.target.closest?.('[data-sn70-action]');
    if (!card) return;
    const target = ACTION_TO_PAGE[card.dataset.sn70Action];
    if (!target) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    navigate(target);
  }, true);

  // The center + button is another entry point to the exact same Quick Workout page.
  document.addEventListener('click', event => {
    const button = event.target.closest?.('#quickStart');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    navigate('quickWorkout');
  }, true);

  // Secondary-page back buttons all return through the router, preserving their entry page.
  document.addEventListener('click', event => {
    const page = normalize(state.page);
    if (!isSecondary(page)) return;
    const selector = BACK_SELECTORS[page];
    if (!selector || !event.target.closest?.(selector)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    goBack();
  }, true);

  window.render = renderCurrent;
  window.START_NOW_ROUTER = {
    version: 'v72',
    navigate,
    back: goBack,
    render: renderCurrent,
    audit,
    get activePage() { return normalize(state.page); },
    get backPage() { return backPage; }
  };

  // Record the current page without forcing a second initial render.
  setNavState(currentPage);
  root.dataset.activePage = currentPage;
})();
