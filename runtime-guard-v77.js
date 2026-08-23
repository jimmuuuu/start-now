// START/NOW v77 — release guard: never leave #app blank after a render failure.
(() => {
  const root = document.getElementById('app');
  if (!root || typeof state === 'undefined' || typeof window.render !== 'function') return;

  const previousRender = window.render;
  let handlingFailure = false;
  let lastError = null;

  function errorBoundary(error, requestedPage) {
    lastError = error;
    console.error('[START/NOW] Page render failed', { page: requestedPage, error });
    root.innerHTML = `
      <section class="card sn77-error-boundary" role="alert">
        <div class="eyebrow">START/NOW</div>
        <h1>Something went wrong</h1>
        <p>This screen could not load. Your saved workouts and history were not cleared.</p>
        <button type="button" class="primary" id="sn77ReturnHome">Return Home</button>
      </section>`;
    document.getElementById('sn77ReturnHome')?.addEventListener('click', () => {
      state.page = 'home';
      handlingFailure = true;
      try { previousRender.call(window); }
      catch (homeError) { console.error('[START/NOW] Home fallback also failed', homeError); }
      finally { handlingFailure = false; }
    });
  }

  function safeRender(...args) {
    if (handlingFailure) return previousRender.apply(this,args);
    const requestedPage = state.page;
    try {
      const result = previousRender.apply(this,args);
      if (!root.children.length || !(root.textContent || '').trim()) {
        throw new Error(`Render completed without visible content for page: ${requestedPage}`);
      }
      root.dataset.activePage = String(state.page || requestedPage || 'home');
      return result;
    } catch (error) {
      errorBoundary(error, requestedPage);
      return false;
    }
  }

  function audit() {
    const oldQuickActionLabels = ['Today','Achievements'].filter(label =>
      [...root.querySelectorAll('.tile strong')].some(node => node.textContent.trim() === label)
    );
    return {
      page: String(state.page || ''),
      activePage: root.dataset.activePage || null,
      hasVisibleContent: Boolean(root.children.length && (root.textContent || '').trim()),
      errorBoundaryVisible: Boolean(root.querySelector('.sn77-error-boundary')),
      quickActionCount: root.querySelectorAll('[data-sn70-action]').length,
      oldQuickActionLabels,
      duplicateIds: [...document.querySelectorAll('[id]')]
        .map(node => node.id)
        .filter((id,index,all) => id && all.indexOf(id) !== index)
        .filter((id,index,all) => all.indexOf(id) === index),
      lastError: lastError ? String(lastError.message || lastError) : null
    };
  }

  const style = document.createElement('style');
  style.id = 'sn77-runtime-guard-styles';
  style.textContent = `.sn77-error-boundary{margin:34px 0;padding:22px}.sn77-error-boundary h1{font-size:28px;margin:7px 0 8px}.sn77-error-boundary p{color:var(--muted);line-height:1.5;margin:0 0 18px}`;
  document.head.appendChild(style);

  window.render = safeRender;
  window.START_NOW_RUNTIME = { version:'v77', audit, get lastError(){ return lastError; } };

  window.addEventListener('error', event => {
    if (event.error) lastError = event.error;
  });
  window.addEventListener('unhandledrejection', event => {
    if (event.reason) lastError = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
  });
})();
