// START/NOW v129 — keep recent exercise history inside the active workout.
(() => {
  const VERSION = 'v129';
  const STYLE_ID = 'sn129-last-time-styles';
  const expanded = new Set();

  const esc = value => typeof escapeHtml === 'function'
    ? escapeHtml(String(value ?? ''))
    : String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .sn129-last-time{padding:0!important;overflow:hidden}
      .sn129-last-toggle{width:100%;display:flex;align-items:center;justify-content:space-between;gap:14px;border:0;background:transparent;color:var(--text);padding:15px 16px;text-align:left;cursor:pointer}
      .sn129-last-copy{min-width:0}.sn129-last-copy span,.sn129-last-copy strong,.sn129-last-copy small{display:block}
      .sn129-last-copy span{font-size:9px;font-weight:900;letter-spacing:.08em;color:var(--muted)}
      .sn129-last-copy strong{margin-top:5px;font-size:13px;line-height:1.3}
      .sn129-last-copy small{margin-top:4px;font-size:10px;color:#2F6DF6;font-weight:800}
      .sn129-chevron{flex:0 0 auto;width:30px;height:30px;border-radius:10px;border:1px solid var(--line);display:grid;place-items:center;color:var(--muted);font-size:18px;line-height:1;transition:transform .15s ease}
      .sn129-last-time.open .sn129-chevron{transform:rotate(180deg)}
      .sn129-last-details{border-top:1px solid var(--line);padding:8px 16px 15px}
      .sn129-set-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:10px 0;border-bottom:1px solid var(--line)}
      .sn129-set-row:last-child{border-bottom:0}.sn129-set-row span{font-size:10px;color:var(--muted);font-weight:800}.sn129-set-row strong{font-size:12px;text-align:right}
      .sn129-note{margin-top:10px;padding:11px 12px;border:1px solid var(--line);border-radius:12px;background:color-mix(in srgb,var(--surface) 92%,#2F6DF6 8%)}
      .sn129-note span{display:block;font-size:9px;font-weight:900;letter-spacing:.07em;color:var(--muted)}
      .sn129-note p{margin:6px 0 0;font-size:11px;line-height:1.45;color:var(--text);white-space:pre-wrap}
      .sn129-note.empty p{color:var(--muted)}
    `;
    document.head.appendChild(style);
  }

  function currentExercise() {
    const SN = window.SN36;
    return SN?.active?.exercises?.[SN.active.index || 0] || null;
  }

  function setLabel(set) {
    const SN = window.SN36;
    const weight = SN?.num ? SN.num(set?.weight) : Number(set?.weight || 0);
    const reps = SN?.num ? SN.num(set?.reps) : Number(set?.reps || 0);
    const cleanWeight = SN?.round1 ? SN.round1(weight) : Math.round(weight * 10) / 10;
    return weight > 0 ? `${cleanWeight} lb × ${reps} reps` : `${reps} reps`;
  }

  function rebuildLastTime() {
    installStyles();
    const SN = window.SN36;
    const ex = currentExercise();
    const block = document.querySelector('.sn-workout-screen .sn-performance-card .sn-performance-block:not(.suggestion)');
    if (!SN || !ex || !block) return;

    const previous = SN.previousExercise?.(ex);
    const result = previous?.result;
    const doneSets = (result?.sets || []).filter(set => set?.done);
    const note = SN.normalizeExerciseNote?.(result?.note)?.trim?.() || '';
    const key = `${SN.exerciseId?.(ex) || ex.name || 'exercise'}:${previous?.session?.timestamp || 0}`;
    const open = expanded.has(key);

    block.classList.add('sn129-last-time');
    block.dataset.sn129Key = key;

    if (!previous || !doneSets.length) {
      block.innerHTML = `<div class="sn129-last-toggle" aria-disabled="true"><div class="sn129-last-copy"><span>LAST TIME</span><strong>No completed sets yet</strong></div></div>`;
      return;
    }

    const rows = doneSets.map((set, index) => `<div class="sn129-set-row"><span>SET ${index + 1}</span><strong>${esc(setLabel(set))}</strong></div>`).join('');
    block.innerHTML = `
      <button type="button" class="sn129-last-toggle" data-sn129-toggle aria-expanded="${open ? 'true' : 'false'}">
        <div class="sn129-last-copy"><span>LAST TIME</span><strong>${doneSets.length} completed set${doneSets.length === 1 ? '' : 's'}</strong><small>${open ? 'Hide details' : 'Tap to view sets & note'}</small></div>
        <span class="sn129-chevron" aria-hidden="true">⌄</span>
      </button>
      <div class="sn129-last-details" ${open ? '' : 'hidden'}>
        <div class="sn129-sets">${rows}</div>
        <div class="sn129-note ${note ? '' : 'empty'}"><span>NOTE FROM THAT WORKOUT</span><p>${note ? esc(note) : 'No note was left for this exercise.'}</p></div>
      </div>`;
    block.classList.toggle('open', open);
  }

  // Never allow the legacy full History page to take over from the active workout.
  document.addEventListener('click', event => {
    const legacy = event.target.closest?.('.sn-workout-screen [data-history]');
    if (!legacy) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    rebuildLastTime();
  }, true);

  document.addEventListener('click', event => {
    const toggle = event.target.closest?.('[data-sn129-toggle]');
    if (!toggle) return;
    const block = toggle.closest('.sn129-last-time');
    const key = block?.dataset.sn129Key;
    if (!key) return;
    if (expanded.has(key)) expanded.delete(key); else expanded.add(key);
    rebuildLastTime();
  });

  const app = document.getElementById('app');
  if (app && typeof MutationObserver === 'function') {
    let queued = false;
    const observer = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        rebuildLastTime();
      });
    });
    observer.observe(app, { childList: true, subtree: true });
  }

  rebuildLastTime();
  window.START_NOW_ACTIVE_LAST_TIME = { version: VERSION, refresh: rebuildLastTime };
})();
