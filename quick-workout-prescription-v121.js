// START/NOW v121 — let users set sets/reps on selected Quick Workout exercises before starting.
(() => {
  const VERSION = 'v121';
  const STYLE_ID = 'sn121-quick-prescription-styles';
  const overrides = new Map();
  let openId = null;
  let enhancing = false;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));

  function exerciseId(ex) {
    try {
      return String(ex?.id || window.SN36?.exerciseId?.(ex) || '');
    } catch (_) {
      return String(ex?.id || '');
    }
  }

  function library() {
    try {
      return Array.isArray(exerciseLibrary) ? exerciseLibrary : [];
    } catch (_) {
      return [];
    }
  }

  function exerciseFor(id) {
    return library().find(ex => exerciseId(ex) === String(id)) || null;
  }

  function clamp(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.max(min, Math.min(max, Math.round(number)));
  }

  function prescriptionFor(id) {
    const existing = overrides.get(String(id));
    if (existing) return existing;
    const ex = exerciseFor(id);
    return {
      sets: clamp(ex?.sets, 1, 8, 3),
      reps: clamp(ex?.reps ?? ex?.repMax, 1, 50, 10)
    };
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .sn66-selected-row[data-sn121-id]{cursor:pointer;transition:border-color .15s ease,background .15s ease;grid-template-columns:minmax(0,1fr) auto}
      .sn66-selected-row[data-sn121-id]:hover{border-color:#BFD6FF;background:color-mix(in srgb,var(--surface) 94%,#EAF2FF)}
      .sn121-prescription{font-weight:800;color:#2F6DF6}
      .sn121-edit-hint{display:inline-flex;margin-top:6px;padding:4px 7px;border-radius:999px;background:#EEF5FF;color:#2F6DF6;font-size:9px;font-weight:850;line-height:1}
      .sn121-editor{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr auto;gap:9px;align-items:end;margin-top:3px;padding:11px;border-radius:12px;border:1px solid #D7E4F7;background:#F7FAFF;cursor:default}
      .sn121-field{display:grid;gap:5px;color:#667085;font-size:9px;font-weight:850;text-transform:uppercase;letter-spacing:.04em}
      .sn121-stepper{display:grid;grid-template-columns:34px minmax(44px,1fr) 34px;align-items:center;border:1px solid var(--line);border-radius:10px;background:var(--surface);overflow:hidden}
      .sn121-stepper button{height:36px;border:0;background:transparent;color:#2F6DF6;font-size:18px;font-weight:850;cursor:pointer}
      .sn121-stepper input{width:100%;height:36px;border:0;border-left:1px solid var(--line);border-right:1px solid var(--line);background:transparent;color:var(--text);text-align:center;font:inherit;font-size:13px;font-weight:850;outline:0;-moz-appearance:textfield}
      .sn121-stepper input::-webkit-outer-spin-button,.sn121-stepper input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
      .sn121-done{height:38px;border:0;border-radius:10px;padding:0 12px;background:#2F6DF6;color:#fff;font-size:10px;font-weight:850;cursor:pointer}
      .dark .sn121-editor{background:#16253B;border-color:#29466C}.dark .sn121-edit-hint{background:#1B2A42;color:#8CB7FF}
      @media(max-width:520px){.sn121-editor{grid-template-columns:1fr 1fr}.sn121-done{grid-column:1/-1;width:100%}}
    `;
    document.head.appendChild(style);
  }

  function rowId(row) {
    return row?.querySelector('[data-move][data-id]')?.dataset.id || row?.querySelector('[data-remove]')?.dataset.remove || '';
  }

  function editorMarkup(id, values) {
    const name = exerciseFor(id)?.name || 'exercise';
    return `
      <div class="sn121-editor" data-sn121-editor="${esc(id)}" aria-label="Sets and reps for ${esc(name)}">
        <label class="sn121-field">Sets
          <span class="sn121-stepper">
            <button type="button" data-sn121-step="sets" data-delta="-1" aria-label="Decrease sets">−</button>
            <input type="number" min="1" max="8" inputmode="numeric" value="${values.sets}" data-sn121-input="sets" aria-label="Sets">
            <button type="button" data-sn121-step="sets" data-delta="1" aria-label="Increase sets">+</button>
          </span>
        </label>
        <label class="sn121-field">Reps
          <span class="sn121-stepper">
            <button type="button" data-sn121-step="reps" data-delta="-1" aria-label="Decrease reps">−</button>
            <input type="number" min="1" max="50" inputmode="numeric" value="${values.reps}" data-sn121-input="reps" aria-label="Reps">
            <button type="button" data-sn121-step="reps" data-delta="1" aria-label="Increase reps">+</button>
          </span>
        </label>
        <button type="button" class="sn121-done" data-sn121-done>Done</button>
      </div>`;
  }

  function enhanceRow(row) {
    const id = rowId(row);
    if (!id) return;
    row.dataset.sn121Id = id;
    row.tabIndex = 0;

    const copy = row.firstElementChild;
    const small = copy?.querySelector('small');
    const values = prescriptionFor(id);
    if (small) {
      let summary = small.querySelector('.sn121-prescription');
      if (!summary) {
        summary = document.createElement('span');
        summary.className = 'sn121-prescription';
        small.append(' • ', summary);
      }
      summary.textContent = `${values.sets} sets × ${values.reps} reps`;
    }

    if (copy && !copy.querySelector('.sn121-edit-hint')) {
      const hint = document.createElement('span');
      hint.className = 'sn121-edit-hint';
      hint.textContent = 'Tap to set sets & reps';
      copy.appendChild(hint);
    }

    row.querySelector('.sn121-editor')?.remove();
    if (openId === id) row.insertAdjacentHTML('beforeend', editorMarkup(id, values));
  }

  function enhanceAll() {
    if (enhancing) return;
    enhancing = true;
    try {
      installStyles();
      document.querySelectorAll('.sn66-selected-list .sn66-selected-row').forEach(enhanceRow);
    } finally {
      enhancing = false;
    }
  }

  function setValue(id, key, value) {
    const current = prescriptionFor(id);
    const next = {
      ...current,
      [key]: key === 'sets' ? clamp(value, 1, 8, current.sets) : clamp(value, 1, 50, current.reps)
    };
    overrides.set(String(id), next);
    enhanceAll();
  }

  function toggleEditor(row) {
    const id = row?.dataset.sn121Id || rowId(row);
    if (!id) return;
    openId = openId === id ? null : id;
    enhanceAll();
    if (openId) row.querySelector('.sn121-editor input')?.focus({preventScroll:true});
  }

  // Capture the Start click before the original Quick Workout handler clones exercises.
  // We temporarily apply the chosen prescription, then restore library defaults immediately after.
  document.addEventListener('click', event => {
    const start = event.target.closest('#sn66StartBuild');
    if (!start || start.disabled || !overrides.size) return;
    const originals = [];
    overrides.forEach((values, id) => {
      const ex = exerciseFor(id);
      if (!ex) return;
      originals.push({ ex, sets: ex.sets, reps: ex.reps, repMin: ex.repMin, repMax: ex.repMax });
      ex.sets = values.sets;
      ex.reps = values.reps;
      if ('repMin' in ex) ex.repMin = values.reps;
      if ('repMax' in ex) ex.repMax = values.reps;
    });
    queueMicrotask(() => originals.forEach(original => {
      original.ex.sets = original.sets;
      original.ex.reps = original.reps;
      if ('repMin' in original.ex) original.ex.repMin = original.repMin;
      if ('repMax' in original.ex) original.ex.repMax = original.repMax;
    }));
  }, true);

  document.addEventListener('click', event => {
    const remove = event.target.closest('.sn66-selected-row [data-remove]');
    if (remove) {
      overrides.delete(String(remove.dataset.remove));
      if (openId === String(remove.dataset.remove)) openId = null;
      return;
    }

    const editor = event.target.closest('.sn121-editor');
    if (editor) {
      event.stopPropagation();
      const id = editor.dataset.sn121Editor;
      const step = event.target.closest('[data-sn121-step]');
      if (step) {
        const key = step.dataset.sn121Step;
        const values = prescriptionFor(id);
        setValue(id, key, values[key] + Number(step.dataset.delta || 0));
        return;
      }
      if (event.target.closest('[data-sn121-done]')) {
        openId = null;
        enhanceAll();
      }
      return;
    }

    const row = event.target.closest('.sn66-selected-row[data-sn121-id]');
    if (!row) return;
    if (event.target.closest('.sn66-order,button,input,select,a')) return;
    toggleEditor(row);
  });

  document.addEventListener('change', event => {
    const input = event.target.closest('.sn121-editor [data-sn121-input]');
    if (!input) return;
    const editor = input.closest('.sn121-editor');
    if (!editor) return;
    setValue(editor.dataset.sn121Editor, input.dataset.sn121Input, input.value);
  });

  document.addEventListener('keydown', event => {
    const row = event.target.closest?.('.sn66-selected-row[data-sn121-id]');
    if (!row || event.target.closest('.sn121-editor,.sn66-order')) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleEditor(row);
    }
  });

  const app = document.getElementById('app');
  if (app && typeof MutationObserver === 'function') {
    let queued = false;
    const observer = new MutationObserver(() => {
      if (queued || enhancing) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        enhanceAll();
      });
    });
    observer.observe(app, { childList:true, subtree:true });
  }

  enhanceAll();
  window.START_NOW_QUICK_PRESCRIPTION = {
    version: VERSION,
    get: id => ({...prescriptionFor(id)}),
    enhance: enhanceAll
  };
})();
