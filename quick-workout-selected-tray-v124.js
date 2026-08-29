// START/NOW v125 — compact, accessible selected-exercise tray for Quick Workout.
(() => {
  let trayOpen = false;

  function installStyles() {
    if (document.getElementById('sn124-selected-tray-styles')) return;
    const style = document.createElement('style');
    style.id = 'sn124-selected-tray-styles';
    style.textContent = `
      .sn124-selected-tray{
        margin:10px 0 12px;
        border:1px solid var(--line);
        border-radius:14px;
        background:var(--surface);
        overflow:hidden;
      }
      .sn124-selected-toggle{
        width:100%;
        min-height:48px;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        padding:10px 12px;
        border:0;
        background:transparent;
        color:var(--text);
        text-align:left;
        cursor:pointer;
      }
      .sn124-selected-copy{min-width:0;display:block}
      .sn124-selected-copy strong{
        display:block;
        font-size:12px;
        line-height:1.2;
        font-weight:850;
      }
      .sn124-selected-copy small{
        display:block;
        margin-top:3px;
        color:var(--muted);
        font-size:9px;
        line-height:1.25;
      }
      .sn124-selected-count{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        min-width:24px;
        height:24px;
        padding:0 7px;
        margin-left:auto;
        border-radius:999px;
        background:#EEF4FF;
        color:#2F6DF6;
        font-size:10px;
        font-weight:900;
        flex:0 0 auto;
      }
      .sn124-selected-chevron{
        width:24px;
        height:24px;
        display:grid;
        place-items:center;
        flex:0 0 auto;
        color:var(--muted);
        font-size:18px;
        line-height:1;
        transition:transform .18s ease;
      }
      .sn124-selected-tray.open .sn124-selected-chevron{transform:rotate(180deg)}
      .sn124-selected-panel{
        display:none;
        border-top:1px solid var(--line);
        padding:8px;
        background:color-mix(in srgb, var(--surface) 96%, #2F6DF6 4%);
      }
      .sn124-selected-tray.open .sn124-selected-panel{display:block}

      .sn124-selected-panel .sn66-selected-list,
      .sn66-panel.sn115-searching .sn124-selected-panel .sn66-selected-list,
      .sn66-panel.sn115-searching.sn115-show-selected .sn124-selected-panel .sn66-selected-list{
        display:grid !important;
        gap:6px !important;
        margin:0 !important;
        padding:0 2px 2px 0 !important;
        max-height:220px;
        overflow-y:auto !important;
        overflow-x:hidden !important;
        scroll-snap-type:none !important;
        scrollbar-width:thin;
        -webkit-overflow-scrolling:touch;
      }
      .sn115-selected-summary{display:none !important}

      .sn124-selected-panel .sn66-selected-row,
      .sn124-selected-panel .sn66-selected-row:not(.editing){
        width:100% !important;
        min-width:0 !important;
        display:grid !important;
        grid-template-columns:minmax(0,1fr) auto !important;
        gap:8px !important;
        align-items:center !important;
        padding:8px 9px !important;
        border:1px solid var(--line) !important;
        border-radius:11px !important;
        background:var(--surface) !important;
        scroll-snap-align:none !important;
      }
      .sn124-selected-panel .sn66-selected-row.editing{
        border-color:#9FC3FF !important;
        background:#F8FBFF !important;
      }
      .sn124-selected-panel .sn66-selected-main,
      .sn124-selected-panel .sn66-selected-row:not(.editing) .sn66-selected-main{
        display:block !important;
        max-width:none !important;
        min-height:0 !important;
        padding:0 !important;
        border:0 !important;
        border-radius:0 !important;
        background:transparent !important;
        box-shadow:none !important;
      }
      .sn124-selected-panel .sn66-selected-main strong{
        display:block !important;
        overflow:hidden;
        white-space:nowrap;
        text-overflow:ellipsis;
        font-size:11px !important;
        line-height:1.2;
      }
      .sn124-selected-panel .sn66-selected-main small{
        display:block !important;
        margin-top:2px !important;
        color:var(--muted) !important;
        font-size:8.5px !important;
      }
      .sn124-selected-panel .sn66-selected-main em{
        display:block !important;
        margin-top:3px !important;
        color:#2F6DF6 !important;
        font-size:8.5px !important;
        font-style:normal !important;
        font-weight:800 !important;
      }
      .sn124-selected-panel .sn66-selected-main::after{content:none !important}
      .sn124-selected-panel .sn66-order{
        display:flex !important;
        gap:4px !important;
      }
      .sn124-selected-panel .sn66-order button{
        width:28px !important;
        height:28px !important;
        border-radius:8px !important;
      }
      .sn124-selected-panel .sn66-rx-editor{
        display:grid !important;
        grid-column:1/-1;
        margin-top:2px;
      }

      .dark .sn124-selected-count{background:#1B2A42;color:#82ACFF}
      .dark .sn124-selected-panel .sn66-selected-row.editing{
        background:#16253B !important;
        border-color:#29466C !important;
      }

      @media(max-width:620px){
        .sn124-selected-tray{margin:7px 0 9px}
        .sn124-selected-toggle{min-height:44px;padding:8px 10px}
        .sn124-selected-copy strong{font-size:11px}
        .sn124-selected-copy small{font-size:8.5px}
        .sn124-selected-panel{padding:7px}
        .sn124-selected-panel .sn66-selected-list{max-height:190px}
        .sn124-selected-panel .sn66-order button{width:27px !important;height:27px !important}
        .sn66-results{max-height:min(58vh,560px) !important}
      }
    `;
    document.head.appendChild(style);
  }

  function setOpen(tray, open) {
    trayOpen = Boolean(open);
    tray.classList.toggle('open', trayOpen);
    const button = tray.querySelector('.sn124-selected-toggle');
    if (button) button.setAttribute('aria-expanded', trayOpen ? 'true' : 'false');
  }

  function enhanceSelectedTray() {
    installStyles();

    const panel = document.querySelector('.sn66-panel');
    const list = panel?.querySelector('.sn66-selected-list');
    if (!panel || !list) return;

    let tray = panel.querySelector('.sn124-selected-tray');
    if (!tray) {
      tray = document.createElement('div');
      tray.className = 'sn124-selected-tray';
      tray.innerHTML = `
        <button type="button" class="sn124-selected-toggle" aria-expanded="false">
          <span class="sn124-selected-copy">
            <strong>Selected exercises</strong>
            <small class="sn124-selected-subtitle"></small>
          </span>
          <span class="sn124-selected-count" aria-hidden="true"></span>
          <span class="sn124-selected-chevron" aria-hidden="true">⌄</span>
        </button>
        <div class="sn124-selected-panel"></div>`;

      list.parentNode.insertBefore(tray, list);
      tray.querySelector('.sn124-selected-panel')?.appendChild(list);
      tray.querySelector('.sn124-selected-toggle')?.addEventListener('click', () => setOpen(tray, !tray.classList.contains('open')));
    }

    const rows = list.querySelectorAll('.sn66-selected-row');
    const count = rows.length;
    const countText = String(count);
    const subtitle = count === 1 ? '1 selected · Tap to review' : `${count} selected · Tap to review`;
    const countEl = tray.querySelector('.sn124-selected-count');
    const subtitleEl = tray.querySelector('.sn124-selected-subtitle');
    if (countEl && countEl.textContent !== countText) countEl.textContent = countText;
    if (subtitleEl && subtitleEl.textContent !== subtitle) subtitleEl.textContent = subtitle;

    const editing = Boolean(list.querySelector('.sn66-selected-row.editing'));
    setOpen(tray, editing || trayOpen);
  }

  const app = document.getElementById('app');
  if (!app) return;

  const observer = new MutationObserver(() => enhanceSelectedTray());
  observer.observe(app, { childList:true, subtree:true });
  enhanceSelectedTray();

  window.START_NOW_SELECTED_TRAY = {
    version:'v125',
    open:() => {
      const tray = document.querySelector('.sn124-selected-tray');
      if (tray) setOpen(tray, true);
    },
    close:() => {
      const tray = document.querySelector('.sn124-selected-tray');
      if (tray) setOpen(tray, false);
    }
  };
})();
