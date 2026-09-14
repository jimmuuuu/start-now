// START/NOW v143 — robust mobile active-workout exercise sheet.
(() => {
  const MODAL_SELECTOR = '#snProductModal';
  const CHOICE_SELECTOR = '#snProductModal .sn-exercise-choice[data-add-active]';

  function installStyles() {
    if (document.getElementById('sn143MobileExerciseSheetStyles')) return;

    const style = document.createElement('style');
    style.id = 'sn143MobileExerciseSheetStyles';
    style.textContent = `
      #snProductModal{
        align-items:flex-end;
        padding:max(8px, env(safe-area-inset-top)) max(8px, env(safe-area-inset-right)) max(8px, env(safe-area-inset-bottom)) max(8px, env(safe-area-inset-left));
      }
      #snProductModal .sn-modal{
        width:min(620px, 100%);
        height:min(84vh, 760px);
        max-height:calc(100vh - 16px);
        min-height:0;
        display:flex;
        flex-direction:column;
        gap:12px;
        overflow:hidden;
        overscroll-behavior:contain;
        touch-action:pan-y pinch-zoom;
      }
      @supports (height: 1dvh){
        #snProductModal .sn-modal{
          height:min(84dvh, 760px);
          max-height:calc(100dvh - 16px);
        }
      }
      #snProductModal .sn-modal-head,
      #snProductModal .sn-modal-search{
        flex:0 0 auto;
      }
      #snProductModal .sn-option-list{
        min-height:0;
        flex:1 1 auto;
        overflow-x:hidden;
        overflow-y:auto;
        overscroll-behavior:contain;
        -webkit-overflow-scrolling:touch;
        padding:1px 2px max(4px, env(safe-area-inset-bottom)) 0;
      }
      #snProductModal .sn-exercise-choice[disabled]{
        opacity:.72;
        cursor:wait;
      }
      #snProductModal.sn143-resolving .sn-modal{
        pointer-events:none;
      }
      @media (max-width:620px){
        #snProductModal .sn-modal{
          height:min(90vh, 760px);
          max-height:calc(100vh - 12px);
          padding:16px;
        }
        @supports (height: 1dvh){
          #snProductModal .sn-modal{
            height:min(90dvh, 760px);
            max-height:calc(100dvh - 12px);
          }
        }
      }
    `;
    document.head.appendChild(style);
  }

  function getLibrary() {
    return typeof exerciseLibrary === 'undefined' ? [] : exerciseLibrary;
  }

  function decorateSheet(modal) {
    if (!modal || modal.dataset.sn143Ready === 'true') return;
    modal.dataset.sn143Ready = 'true';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    const sheet = modal.querySelector('.sn-modal');
    const title = sheet?.querySelector('.sn-modal-head h2');
    if (!sheet || !title) return;

    if (!title.id) title.id = 'sn143ExerciseSheetTitle';
    sheet.setAttribute('tabindex', '-1');
    sheet.setAttribute('aria-labelledby', title.id);
  }

  function canAdd(button) {
    const modal = button?.closest(MODAL_SELECTOR);
    const active = window.SN36?.active;
    const id = String(button?.dataset?.addActive || '');
    const base = getLibrary().find(exercise => String(window.SN36?.exerciseId?.(exercise) || exercise?.id || '') === id);
    return Boolean(modal && active && Array.isArray(active.exercises) && base);
  }

  function addExercise(button) {
    const modal = button.closest(MODAL_SELECTOR);
    const SN = window.SN36;
    const active = SN?.active;
    const id = String(button.dataset.addActive || '');
    const base = getLibrary().find(exercise => String(SN?.exerciseId?.(exercise) || exercise?.id || '') === id);

    if (!modal || !active || !base || modal.dataset.sn143Adding === 'true') return false;

    modal.dataset.sn143Adding = 'true';
    modal.classList.add('sn143-resolving');
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');

    try {
      const exerciseId = String(SN.exerciseId?.(base) || base.id || '');
      const occurrence = active.exercises.filter(exercise =>
        String(SN.exerciseId?.(exercise) || exercise?.id || '') === exerciseId
      ).length + 1;
      const normalized = SN.normalizeExercise?.(base, {
        workoutId: active.workoutId,
        occurrence
      }) || { ...base };
      const range = SN.repRange?.(normalized) || {};
      const repMin = Math.max(1, Number(range.min ?? normalized.repMin ?? normalized.reps ?? 1) || 1);
      const repMax = Math.max(repMin, Number(range.max ?? normalized.repMax ?? normalized.reps ?? repMin) || repMin);
      const plannedSets = Math.max(1, Number(SN.num?.(normalized.sets, 3) ?? normalized.sets ?? 3) || 3);

      active.exercises.push({
        ...normalized,
        repMin,
        repMax,
        originalPlannedSets: plannedSets,
        skipped: false,
        note: '',
        sets: Array.from({ length: plannedSets }, () => ({
          weight: null,
          reps: null,
          done: false,
          prefilled: false
        }))
      });

      if (SN.keys?.active && typeof SN.write === 'function') {
        SN.write(SN.keys.active, active);
      }

      requestAnimationFrame(() => {
        modal.remove();
        window.showToast?.(String(base.name || 'Exercise') + ' added');
        if (typeof window.render === 'function') window.render();
        else window.renderWorkout?.();
      });
      return true;
    } catch (error) {
      console.error('[Level Up Fitness] Could not add active workout exercise', error);
      delete modal.dataset.sn143Adding;
      modal.classList.remove('sn143-resolving');
      button.disabled = false;
      button.removeAttribute('aria-busy');
      window.showToast?.('Could not add that exercise. Please try again.');
      return false;
    }
  }

  function handleChoice(event) {
    const button = event.target?.closest?.(CHOICE_SELECTOR);
    if (!button || !canAdd(button)) return;

    // This runs after the fast-tap listener. It owns the add action before the
    // original handler can redraw the page, which prevents double activation
    // and leaves the sheet in a consistent state during the handoff.
    event.preventDefault();
    event.stopImmediatePropagation();
    addExercise(button);
  }

  function syncSheets() {
    document.querySelectorAll(MODAL_SELECTOR).forEach(decorateSheet);
  }

  installStyles();
  document.addEventListener('click', handleChoice, true);

  const observer = new MutationObserver(syncSheets);
  observer.observe(document.body, { childList: true, subtree: true });
  syncSheets();

  window.START_NOW_MOBILE_EXERCISE_SHEET = {
    version: 'v143',
    audit: () => {
      const modal = document.querySelector(MODAL_SELECTOR);
      const sheet = modal?.querySelector('.sn-modal');
      return {
        open: Boolean(modal),
        adding: modal?.dataset.sn143Adding === 'true',
        scrollable: Boolean(sheet && getComputedStyle(sheet).overflowY === 'hidden')
      };
    }
  };
})();
