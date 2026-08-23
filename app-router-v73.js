// START/NOW v74 — targeted Quick Action route fix for Quick Workout + Exercise Library.
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
  const EXPECTED = {
    quickWorkout: '.sn66-page',
    exerciseLibrary: '.sn-page',
    calendar: '.sn63-calendar-page',
    myStats: '.sn70-page'
  };
  const BACK_SELECTORS = {
    quickWorkout: '.sn66-back',
    exerciseLibrary: '#snBack',
    calendar: '.sn63-back',
    myStats: '.sn70-back'
  };
  const HOME_MARKERS = [
    '.plan-card',
    '.sn70-quick-actions',
    '.streak-card',
    '.sn54-rest-card',
    '.sn58-muscle-card',
    '.sn51-muscle-card'
  ];

  let currentPage = normalize(state.page);
  let backPage = 'home';
  let rendering = false;

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

  function patchQuickWorkoutCopy() {
    const page = root.querySelector('.sn66-page');
    if (!page) return;
    const cards = [...page.querySelectorAll('.sn66-mode')];
    const copy = [
      ['Build workout', 'Create a one-off workout'],
      ['Choose existing', 'Train one of your saved workouts'],
      ['Surprise me', 'Let START/NOW build one']
    ];
    cards.slice(0, 3).forEach((card, index) => {
      const [title, subtitle] = copy[index];
      card.querySelector('strong')?.replaceChildren(title);
      card.querySelector('span:last-child')?.replaceChildren(subtitle);
    });
  }

  function renderDestination(target) {
    if (target === 'quickWorkout') {
      const module = window.START_NOW_QUICK_WORKOUT;
      if (!module || typeof module.render !== 'function') {
        throw new Error('Quick Workout module is not available');
      }
      module.render();
      patchQuickWorkoutCopy();
      if (!root.querySelector('.sn66-page')) {
        throw new Error('Quick Workout renderer ran but did not mount .sn66-page');
      }
      return;
    }

    if (target === 'exerciseLibrary') {
      const module = window.START_NOW_EXERCISE_LIBRARY_ROUTE;
      if (!module || typeof module.render !== 'function') {
        throw new Error('Exercise Library route bridge is not available');
      }
      state.__quickActionLibraryReturn = 'home';
      module.render();
      if (!root.querySelector('.sn-page #snLibrarySearch') || !root.querySelector('.sn-library-list')) {
        throw new Error('Exercise Library renderer ran but its search/list UI did not mount');
      }
      return;
    }

    // These two routes were already working in v73. Keep their implementation unchanged.
    if (target === 'calendar') {
      const module = window.START_NOW_WORKOUT_CALENDAR;
      if (!module?.render) throw new Error('Workout Calendar renderer is unavailable');
      module.render();
      return;
    }

    if (target === 'myStats') {
      const module = window.START_NOW_QUICK_ACTIONS;
      if (!module?.renderStats) throw new Error('My Stats renderer is unavailable');
      module.renderStats();
      return;
    }

    throw new Error(`Unknown Quick Action page: ${target}`);
  }

  function pageAudit(page = normalize(state.page)) {
    const target = normalize(page);
    const selector = EXPECTED[target];
    const leakedHomeSelectors = isSecondary(target)
      ? HOME_MARKERS.filter(item => root.querySelector(item))
      : [];
    return {
      page: target,
      routeExists: !isSecondary(target) || Boolean(selector),
      rendererExists:
        target === 'quickWorkout' ? Boolean(window.START_NOW_QUICK_WORKOUT?.render) :
        target === 'exerciseLibrary' ? Boolean(window.START_NOW_EXERCISE_LIBRARY_ROUTE?.render) :
        target === 'calendar' ? Boolean(window.START_NOW_WORKOUT_CALENDAR?.render) :
        target === 'myStats' ? Boolean(window.START_NOW_QUICK_ACTIONS?.renderStats) : true,
      contentVisible: selector ? Boolean(root.querySelector(selector)) : root.children.length > 0,
      homeHidden: leakedHomeSelectors.length === 0,
      leakedHomeSelectors,
      blank: root.children.length === 0 || !(root.textContent || '').trim(),
      activeNavItems: document.querySelectorAll('.nav-item.active').length,
      activePage: root.dataset.activePage || null
    };
  }

  function renderFallback(page, error) {
    const fallback = isSecondary(page) ? 'home' : normalize(page || 'home');
    console.error('[START/NOW Router] Destination failed; returning to a safe page.', {
      requestedPage: normalize(state.page),
      fallback,
      error
    });
    state.page = fallback;
    previousRender.call(window);
    currentPage = fallback;
    root.dataset.activePage = fallback;
    setNavState(fallback);
  }

  function renderSecondary(target, fromPage) {
    const destination = normalize(target);
    const previousStatePage = normalize(fromPage || currentPage || 'home');

    // Render first. Never erase the current screen before a destination proves it can mount.
    try {
      renderDestination(destination);
      const audit = pageAudit(destination);
      if (!audit.rendererExists || !audit.contentVisible || audit.blank || !audit.homeHidden) {
        throw new Error(`Destination did not render cleanly: ${JSON.stringify(audit)}`);
      }

      currentPage = destination;
      root.dataset.activePage = destination;
      setNavState(destination);
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      return true;
    } catch (error) {
      state.page = previousStatePage;
      renderFallback(previousStatePage, error);
      return false;
    }
  }

  function renderCurrent(...args) {
    if (rendering) return;
    const target = normalize(state.page);

    if (isSecondary(target)) {
      const from = currentPage || 'home';
      rendering = true;
      try {
        renderSecondary(target, from);
      } finally {
        rendering = false;
      }
      return;
    }

    rendering = true;
    try {
      const result = previousRender.apply(window, args);
      currentPage = target;
      root.dataset.activePage = target;
      setNavState(target);
      return result;
    } catch (error) {
      console.error('[START/NOW Router] Main-page render failed.', { target, error });
      if (target !== 'home') {
        state.page = 'home';
        const result = previousRender.call(window);
        currentPage = 'home';
        root.dataset.activePage = 'home';
        setNavState('home');
        return result;
      }
      throw error;
    } finally {
      rendering = false;
    }
  }

  function navigate(page, options = {}) {
    const target = normalize(page);
    const from = currentPage || normalize(state.page);
    if (isSecondary(target) && !isSecondary(from) && !options.keepBack) {
      backPage = from || 'home';
    }

    const oldPage = normalize(state.page);
    state.page = target;

    if (isSecondary(target)) {
      const ok = renderSecondary(target, oldPage);
      if (!ok) state.page = normalize(currentPage || 'home');
      return ok;
    }

    renderCurrent();
    return true;
  }

  function goBack() {
    const destination = backPage && !isSecondary(backPage) ? backPage : 'home';
    return navigate(destination, { keepBack: true });
  }

  // All four cards use the same delegated click path. Calendar/Stats remain unchanged.
  document.addEventListener('click', event => {
    const card = event.target.closest?.('[data-sn70-action]');
    if (!card) return;
    const target = ACTION_TO_PAGE[card.dataset.sn70Action];
    if (!target) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    navigate(target);
  }, true);

  document.addEventListener('click', event => {
    if (!event.target.closest?.('#quickStart')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    navigate('quickWorkout');
  }, true);

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
    version: 'v74',
    navigate,
    back: goBack,
    render: renderCurrent,
    audit: pageAudit,
    get activePage() { return normalize(state.page); },
    get backPage() { return backPage; }
  };

  setNavState(currentPage);
  root.dataset.activePage = currentPage;
})();