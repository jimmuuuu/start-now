// START/NOW v107 — make the center training action obvious without changing its behavior.
(() => {
  const HINT_KEY = 'sn_train_entry_hint_v107';

  function installStyles() {
    if (document.getElementById('sn107-train-entry-styles')) return;
    const style = document.createElement('style');
    style.id = 'sn107-train-entry-styles';
    style.textContent = `
      #quickStart.nav-fab{
        width:74px;height:78px;min-height:78px;margin-top:-18px;padding:0;border:0;border-radius:0;
        background:transparent;color:var(--coral);box-shadow:none;font-size:11px;font-weight:800;
        display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:5px;
        position:relative;overflow:visible;
      }
      #quickStart .sn107-train-circle{
        width:58px;height:58px;flex:0 0 58px;border-radius:50%;display:grid;place-items:center;
        background:linear-gradient(135deg,var(--coral),var(--coral-2));color:#fff;
        box-shadow:0 10px 22px rgba(255,90,95,.34);transition:transform .14s ease,filter .14s ease;
      }
      #quickStart .sn107-train-label{
        display:block;color:var(--coral);font-size:11px;font-weight:800;line-height:1;letter-spacing:0;
      }
      #quickStart:active .sn107-train-circle{transform:scale(.97)}
      #quickStart:focus-visible{outline:2px solid var(--coral);outline-offset:3px;border-radius:16px}
      #quickStart .sn107-train-hint{
        position:absolute;left:50%;bottom:88px;transform:translate(-50%,8px);white-space:nowrap;
        padding:8px 11px;border-radius:11px;background:#171717;color:#fff;font-size:11px;font-weight:750;
        box-shadow:0 10px 28px rgba(0,0,0,.22);opacity:0;pointer-events:none;transition:.2s ease;z-index:4;
      }
      #quickStart .sn107-train-hint::after{
        content:"";position:absolute;left:50%;top:100%;transform:translateX(-50%);
        border:6px solid transparent;border-top-color:#171717;
      }
      #quickStart .sn107-train-hint.show{opacity:1;transform:translate(-50%,0)}
      .dark #quickStart .sn107-train-label{color:#ff7377}
      @media(max-width:390px){
        #quickStart.nav-fab{width:70px;height:76px;min-height:76px}
        #quickStart .sn107-train-circle{width:56px;height:56px;flex-basis:56px}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureFab() {
    const fab = document.getElementById('quickStart');
    if (!fab) return null;

    fab.setAttribute('aria-label', 'Start workout');
    fab.setAttribute('title', 'Start workout');

    if (!fab.querySelector('.sn107-train-circle')) {
      const icon = fab.querySelector('[data-sn-icon]') || fab.firstElementChild;
      const circle = document.createElement('span');
      circle.className = 'sn107-train-circle';
      if (icon) circle.appendChild(icon);
      else circle.textContent = '+';
      fab.prepend(circle);
    }

    if (!fab.querySelector('.sn107-train-label')) {
      const label = document.createElement('span');
      label.className = 'sn107-train-label';
      label.textContent = 'Train';
      fab.appendChild(label);
    }

    return fab;
  }

  function showFirstUseHint(fab) {
    if (!fab || fab.querySelector('.sn107-train-hint')) return;
    try {
      if (localStorage.getItem(HINT_KEY) === 'seen') return;
      localStorage.setItem(HINT_KEY, 'seen');
    } catch {}

    const hint = document.createElement('span');
    hint.className = 'sn107-train-hint';
    hint.textContent = 'Start a workout anytime';
    fab.appendChild(hint);
    requestAnimationFrame(() => hint.classList.add('show'));
    setTimeout(() => {
      hint.classList.remove('show');
      setTimeout(() => hint.remove(), 240);
    }, 3600);
  }

  function setText(node, text) {
    if (node && node.textContent.trim() !== text) node.textContent = text;
  }

  function patchQuickWorkoutCopy() {
    const page = document.querySelector('.sn66-page');
    if (!page) return;

    setText(page.querySelector('.sn66-top h1'), 'Start Workout');

    const modes = {
      build: ['Create workout', 'Build a one-off session'],
      existing: ['Saved workouts', 'Start one of your saved workouts'],
      surprise: ['Quick pick', 'Let START/NOW build one for you']
    };

    Object.entries(modes).forEach(([mode, copy]) => {
      const button = page.querySelector(`[data-mode="${mode}"]`);
      if (!button) return;
      setText(button.querySelector('strong'), copy[0]);
      setText(button.querySelector('strong + span'), copy[1]);
    });

    const activeMode = page.querySelector('[data-mode].active')?.dataset.mode;
    const panelTitle = page.querySelector('.sn66-panel h2');
    if (activeMode === 'build') setText(panelTitle, 'Create workout');
    if (activeMode === 'existing') setText(panelTitle, 'Saved workouts');
    if (activeMode === 'surprise') setText(panelTitle, 'Quick pick');

    const empty = page.querySelector('.sn66-empty');
    if (empty && /Build workout/.test(empty.innerHTML)) {
      empty.innerHTML = empty.innerHTML.replace(/Build workout/g, 'Create workout');
    }
  }

  installStyles();
  const fab = ensureFab();
  showFirstUseHint(fab);
  patchQuickWorkoutCopy();

  const appRoot = document.getElementById('app');
  if (appRoot) {
    new MutationObserver(() => patchQuickWorkoutCopy()).observe(appRoot, { childList:true, subtree:true });
  }

  window.START_NOW_TRAIN_ENTRY = { version:'v107', refresh:() => { ensureFab(); patchQuickWorkoutCopy(); } };
})();
