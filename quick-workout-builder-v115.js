// START/NOW v115 — keep manual workout building usable with long exercise lists.
(() => {
  const STYLE_ID = 'sn115-builder-styles';
  const SUMMARY_CLASS = 'sn115-selected-summary';

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .${SUMMARY_CLASS}{display:none;align-items:center;justify-content:space-between;gap:12px;margin:10px 0 8px;padding:10px 12px;border:1px solid var(--line);border-radius:13px;background:var(--surface);color:var(--text)}
      .${SUMMARY_CLASS} strong,.${SUMMARY_CLASS} small{display:block}.${SUMMARY_CLASS} strong{font-size:12px}.${SUMMARY_CLASS} small{margin-top:2px;font-size:10px;color:var(--muted)}
      .sn115-view-selected{min-height:38px;border:1px solid var(--line);border-radius:10px;padding:0 11px;background:var(--surface);color:var(--text);font-size:11px;font-weight:800}
      .sn66-panel.sn115-searching .sn66-selected-list{display:none}
      .sn66-panel.sn115-searching .${SUMMARY_CLASS}{display:flex}
      .sn66-panel.sn115-searching.sn115-show-selected .sn66-selected-list{display:grid}
      .sn66-panel.sn115-searching .sn66-results{max-height:430px}
      @media(max-width:620px){.sn66-panel.sn115-searching .sn66-results{max-height:none}.${SUMMARY_CLASS}{position:sticky;top:0;z-index:2}}
    `;
    document.head.appendChild(style);
  }

  function selectedCount(panel) {
    return panel.querySelectorAll('.sn66-selected-list .sn66-selected-row').length;
  }

  function ensureSummary(panel) {
    const results = panel.querySelector('.sn66-results');
    if (!results) return null;

    let summary = panel.querySelector(`.${SUMMARY_CLASS}`);
    if (!summary) {
      summary = document.createElement('div');
      summary.className = SUMMARY_CLASS;
      summary.innerHTML = '<span class="sn115-selected-copy"></span><button type="button" class="sn115-view-selected">View</button>';
      results.before(summary);
    }
    return summary;
  }

  function enhancePanel(panel) {
    const search = panel.querySelector('#sn66Search');
    if (!search) return;

    const count = selectedCount(panel);
    const searching = search.value.trim().length > 0;
    const summary = ensureSummary(panel);

    panel.classList.toggle('sn115-searching', searching && count > 0);
    if (!searching) panel.classList.remove('sn115-show-selected');

    if (!summary) return;
    const copy = summary.querySelector('.sn115-selected-copy');
    const copyHtml = `<strong>${count} exercise${count === 1 ? '' : 's'} selected</strong><small>Keep searching and add as many exercises as you need.</small>`;
    if (copy && copy.innerHTML !== copyHtml) copy.innerHTML = copyHtml;

    const view = summary.querySelector('.sn115-view-selected');
    const viewLabel = panel.classList.contains('sn115-show-selected') ? 'Hide' : 'View';
    if (view && view.textContent !== viewLabel) view.textContent = viewLabel;
  }

  function enhanceAll() {
    installStyles();
    document.querySelectorAll('.sn66-panel').forEach(enhancePanel);
  }

  document.addEventListener('input', event => {
    if (event.target?.id !== 'sn66Search') return;
    const panel = event.target.closest('.sn66-panel');
    if (panel) enhancePanel(panel);
  }, true);

  document.addEventListener('click', event => {
    const button = event.target.closest('.sn115-view-selected');
    if (!button) return;
    const panel = button.closest('.sn66-panel');
    if (!panel) return;
    panel.classList.toggle('sn115-show-selected');
    enhancePanel(panel);
  });

  const appRoot = document.getElementById('app');
  if (appRoot && typeof MutationObserver === 'function') {
    let queued = false;
    const observer = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        enhanceAll();
      });
    });
    observer.observe(appRoot, { childList: true, subtree: true });
  }

  enhanceAll();
  window.START_NOW_QUICK_WORKOUT_BUILDER = { version: 'v115', enhance: enhanceAll };
})();
