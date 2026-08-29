// START/NOW v126 — keep Quick Workout exercise browsing continuous while selecting.
(() => {
  const VERSION = 'v126';
  let pendingPosition = null;
  let restoreQueued = false;

  function selectedIds() {
    return new Set(
      [...document.querySelectorAll('.sn66-selected-row[data-selected-id]')]
        .map(row => String(row.dataset.selectedId || ''))
        .filter(Boolean)
    );
  }

  function hideSelectedFromCatalog() {
    const selected = selectedIds();
    document.querySelectorAll('.sn66-results .sn66-ex-row').forEach(row => {
      const button = row.querySelector('[data-add]');
      const id = String(button?.dataset.add || '');
      row.hidden = Boolean(id && selected.has(id));
      row.classList.toggle('sn126-selected-hidden', Boolean(id && selected.has(id)));
    });
  }

  function catalogHasOwnScroll(results) {
    if (!results) return false;
    const style = getComputedStyle(results);
    const overflowY = style.overflowY;
    return /auto|scroll/.test(overflowY) && results.scrollHeight > results.clientHeight + 2;
  }

  function capturePosition(button) {
    const results = button?.closest('.sn66-results');
    if (!results) return null;

    const row = button.closest('.sn66-ex-row');
    const next = row?.nextElementSibling?.querySelector?.('[data-add]');
    const previous = row?.previousElementSibling?.querySelector?.('[data-add]');
    const anchor = next || previous;
    const anchorRow = anchor?.closest('.sn66-ex-row');

    return {
      windowY: window.scrollY,
      resultsScrollTop: results.scrollTop,
      ownScroll: catalogHasOwnScroll(results),
      anchorId: String(anchor?.dataset.add || ''),
      anchorTop: anchorRow?.getBoundingClientRect().top ?? null
    };
  }

  function restorePosition() {
    const saved = pendingPosition;
    pendingPosition = null;
    if (!saved) return;

    const results = document.querySelector('.sn66-results');
    if (!results) return;

    hideSelectedFromCatalog();

    if (saved.ownScroll && catalogHasOwnScroll(results)) {
      results.scrollTop = saved.resultsScrollTop;
    } else {
      window.scrollTo(0, saved.windowY);
    }

    if (!saved.anchorId || saved.anchorTop == null) return;
    const selectorId = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(saved.anchorId) : saved.anchorId.replace(/["\\]/g, '\\$&');
    const anchorButton = results.querySelector(`[data-add="${selectorId}"]`);
    const anchorRow = anchorButton?.closest('.sn66-ex-row');
    if (!anchorRow || anchorRow.hidden) return;

    const delta = anchorRow.getBoundingClientRect().top - saved.anchorTop;
    if (Math.abs(delta) < 1) return;

    if (saved.ownScroll && catalogHasOwnScroll(results)) {
      results.scrollTop += delta;
    } else {
      window.scrollBy(0, delta);
    }
  }

  function queueRestore() {
    if (restoreQueued) return;
    restoreQueued = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        restoreQueued = false;
        restorePosition();
      });
    });
  }

  // Capture the user's exact browse position before the v122 add handler rebuilds the page.
  document.addEventListener('click', event => {
    const button = event.target.closest?.('.sn66-results [data-add]');
    if (!button || button.closest('.sn66-ex-row')?.hidden) return;
    pendingPosition = capturePosition(button);
  }, true);

  // The v122 button handler runs before this document-level bubble handler. At this point
  // the rebuilt DOM already exists, so selected rows can be removed before the next paint.
  document.addEventListener('click', event => {
    const button = event.target.closest?.('[data-add]');
    if (!button) return;
    hideSelectedFromCatalog();
    queueRestore();
  });

  const app = document.getElementById('app');
  if (app && typeof MutationObserver === 'function') {
    let queued = false;
    const observer = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        hideSelectedFromCatalog();
      });
    });
    observer.observe(app, { childList: true, subtree: true });
  }

  hideSelectedFromCatalog();
  window.START_NOW_QUICK_WORKOUT_BROWSE = {
    version: VERSION,
    refresh: hideSelectedFromCatalog
  };
})();
