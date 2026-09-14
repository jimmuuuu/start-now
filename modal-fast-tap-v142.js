// START/NOW v142 — make touch taps inside the active-workout exercise picker respond on the first light tap.
(() => {
  const TARGET_SELECTOR = '#snProductModal .sn-exercise-choice[data-add-active], #snProductModal [data-close]';
  const MOVE_TOLERANCE = 14;
  const SUPPRESS_CLICK_MS = 800;

  let activePress = null;
  let dispatchingFastClick = false;

  const style = document.createElement('style');
  style.id = 'snFastTapV142Styles';
  style.textContent = `
    #snProductModal .sn-exercise-choice[data-add-active] {
      min-height: 66px;
      touch-action: manipulation !important;
      -webkit-tap-highlight-color: transparent;
      cursor: pointer;
      transition: transform .08s ease, border-color .08s ease, background .08s ease;
    }

    #snProductModal .sn-exercise-choice[data-add-active] > span,
    #snProductModal .sn-exercise-choice[data-add-active] > b {
      pointer-events: none;
    }

    #snProductModal .sn-exercise-choice[data-add-active] > b {
      width: 44px;
      min-width: 44px;
      height: 44px;
      margin: -7px -7px -7px 10px;
      border-radius: 12px;
      display: grid;
      place-items: center;
      font-size: 18px !important;
    }

    #snProductModal .sn-exercise-choice[data-add-active].sn-fast-tap-pressed,
    #snProductModal .sn-exercise-choice[data-add-active]:active {
      transform: scale(.995);
      border-color: rgba(59,130,246,.45);
      background: rgba(59,130,246,.08);
    }

    #snProductModal [data-close] {
      min-width: 44px !important;
      min-height: 44px !important;
      touch-action: manipulation !important;
      -webkit-tap-highlight-color: transparent;
    }

    #snProductModal .sn-modal-search {
      min-height: 50px;
      font-size: 16px !important;
    }
  `;
  document.head.appendChild(style);

  const touchLike = event => event.pointerType === 'touch' || event.pointerType === 'pen';
  const targetFor = event => event.target?.closest?.(TARGET_SELECTOR) || null;

  const clearPress = () => {
    activePress?.target?.classList.remove('sn-fast-tap-pressed');
    activePress = null;
  };

  document.addEventListener('pointerdown', event => {
    if (!touchLike(event) || event.button > 0) return;
    const target = targetFor(event);
    if (!target) return;

    clearPress();
    activePress = {
      pointerId: event.pointerId,
      target,
      x: event.clientX,
      y: event.clientY
    };
    target.classList.add('sn-fast-tap-pressed');
  }, true);

  document.addEventListener('pointermove', event => {
    if (!activePress || event.pointerId !== activePress.pointerId) return;
    const distance = Math.hypot(event.clientX - activePress.x, event.clientY - activePress.y);
    if (distance > MOVE_TOLERANCE) clearPress();
  }, true);

  document.addEventListener('pointercancel', event => {
    if (activePress && event.pointerId === activePress.pointerId) clearPress();
  }, true);

  document.addEventListener('pointerup', event => {
    if (!activePress || event.pointerId !== activePress.pointerId) return;

    const press = activePress;
    const distance = Math.hypot(event.clientX - press.x, event.clientY - press.y);
    const releaseTarget = targetFor(event);
    clearPress();

    if (distance > MOVE_TOLERANCE || releaseTarget !== press.target || !press.target.isConnected) return;

    // iOS can delay or drop the later synthesized click when a button lives in a
    // momentum-scrolling sheet. Fire the button action immediately on pointerup,
    // then suppress the duplicate native click if Safari sends one afterward.
    press.target.dataset.snFastTapAt = String(performance.now());
    dispatchingFastClick = true;
    try {
      press.target.click();
    } finally {
      dispatchingFastClick = false;
    }
  }, true);

  document.addEventListener('click', event => {
    const target = targetFor(event);
    if (!target || dispatchingFastClick) return;

    const stamp = Number(target.dataset.snFastTapAt || 0);
    if (!stamp || performance.now() - stamp > SUPPRESS_CLICK_MS) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    delete target.dataset.snFastTapAt;
  }, true);
})();
