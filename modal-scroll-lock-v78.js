// START/NOW v141 — keep modal sheets natively scrollable and fully interactive on iOS.
(() => {
  const root = document.documentElement;
  const body = document.body;
  if (!root || !body) return;

  const modalSelector = "#snProductModal, #beginnerWizard, .sn-modal-backdrop, .beginner-modal-overlay, #snAuthModal.open";
  let modalOpen = false;
  let savedScrollY = 0;
  let restoreScrollOnClose = true;

  const style = document.createElement("style");
  style.id = "snModalScrollLockStyles";
  style.textContent = `
    .sn-modal-backdrop,
    .beginner-modal-overlay,
    #snAuthModal.open {
      pointer-events: auto !important;
      touch-action: pan-y pinch-zoom !important;
      overscroll-behavior: contain !important;
    }

    .sn-modal,
    .beginner-modal,
    .sn-auth-sheet {
      position: relative;
      z-index: 1;
      overflow-x: hidden !important;
      overflow-y: auto !important;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain !important;
      touch-action: pan-y pinch-zoom !important;
      pointer-events: auto !important;
      min-height: 0;
    }

    .sn-modal button,
    .beginner-modal button,
    .sn-auth-sheet button {
      pointer-events: auto !important;
      touch-action: manipulation !important;
    }

    .sn-modal input,
    .sn-modal textarea,
    .sn-modal select,
    .beginner-modal input,
    .beginner-modal textarea,
    .beginner-modal select,
    .sn-auth-sheet input,
    .sn-auth-sheet textarea,
    .sn-auth-sheet select {
      pointer-events: auto !important;
      touch-action: auto !important;
      -webkit-user-select: text !important;
      user-select: text !important;
    }

    @supports (height: 100dvh) {
      .sn-modal,
      .beginner-modal,
      .sn-auth-sheet {
        max-height: min(82dvh, 760px);
      }
    }

    @media (max-width: 768px) {
      .sn-modal input,
      .sn-modal textarea,
      .sn-modal select,
      .beginner-modal input,
      .beginner-modal textarea,
      .beginner-modal select,
      .sn-auth-sheet input,
      .sn-auth-sheet textarea,
      .sn-auth-sheet select {
        font-size: 16px !important;
      }
    }
  `;
  document.head.appendChild(style);

  function isOpen() {
    return Boolean(document.querySelector(modalSelector));
  }

  // Bind presentation/accessibility once per sheet. Keep native iOS scrolling
  // and existing close handlers; never fix the body or intercept in-sheet touch.
  const prepared = new WeakSet();
  let backgroundFocus = document.activeElement;
  document.addEventListener('focusin', event => {
    if (!event.target.closest(modalSelector)) backgroundFocus = event.target;
  });
  function prepareSheets() {
    document.querySelectorAll(modalSelector).forEach(backdrop => {
      if (prepared.has(backdrop)) return;
      prepared.add(backdrop);
      const sheet = backdrop.querySelector('.sn-modal,.beginner-modal,.sn-auth-sheet');
      if (!sheet) return;
      const opener = backgroundFocus;
      const close = sheet.querySelector('[data-close],.sn-auth-close,.beginner-close');
      if (close && !close.hasAttribute('aria-label')) close.setAttribute('aria-label','Close');
      sheet.setAttribute('role','dialog');
      sheet.setAttribute('aria-modal','true');
      sheet.tabIndex = -1;
      const heading = sheet.querySelector('h2,h1');
      if (heading && !sheet.hasAttribute('aria-labelledby')) {
        if (!heading.id) heading.id = 'snSheetHeading';
        sheet.setAttribute('aria-labelledby',heading.id);
      }
      const outsideSheet = event => {
        if (!sheet.contains(event.target) && event.cancelable) event.preventDefault();
      };
      backdrop.addEventListener('wheel',outsideSheet,{passive:false});
      backdrop.addEventListener('touchmove',outsideSheet,{passive:false});
      // Authentication already owns its focus trap and restoration.
      if (backdrop.id === 'snAuthModal') return;
      queueMicrotask(() => {
        if (sheet.isConnected && !sheet.contains(document.activeElement)) sheet.focus({preventScroll:true});
      });
      backdrop.addEventListener('keydown',event => {
        if (event.key === 'Escape' && close) {
          event.preventDefault();event.stopPropagation();close.click();
          if (opener?.isConnected) opener.focus({preventScroll:true});
        }
        if (event.key !== 'Tab') return;
        const targets = [...sheet.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')].filter(node => node.getClientRects().length && !node.closest('[hidden]'));
        const first=targets[0], last=targets.at(-1), active=document.activeElement;
        if (!first) {event.preventDefault();sheet.focus();return;}
        if (event.shiftKey && (active===first || active===sheet)) {event.preventDefault();last.focus();}
        else if (!event.shiftKey && (active===last || active===sheet)) {event.preventDefault();first.focus();}
      });
      if (close) close.addEventListener('click',() => queueMicrotask(() => {
        if (!backdrop.isConnected && opener?.isConnected) opener.focus({preventScroll:true});
      }));
    });
  }

  function syncModalState() {
    prepareSheets();
    const open = isOpen();

    if (open && !modalOpen) {
      modalOpen = true;
      const explicitScrollY = root.dataset.snModalScrollY;
      savedScrollY = explicitScrollY === undefined
        ? (window.scrollY || window.pageYOffset || 0)
        : (Number(explicitScrollY) || 0);
      restoreScrollOnClose = !document.querySelector("#snProductModal.sn-splits-modal");
      // Preserve the semantic lock marker used by the rest of the app/tests,
      // but do not attach any body/html overflow, position, height, inert, or
      // pointer-event behavior to it. The marker is state only.
      root.classList.add("sn-background-locked");
      body.classList.add("sn-background-locked");
      return;
    }

    if (!open && modalOpen) {
      modalOpen = false;
      root.classList.remove("sn-background-locked");
      body.classList.remove("sn-background-locked");
      const current = window.scrollY || window.pageYOffset || 0;
      const splitOwnsScroll = root.dataset.snSplitOwnsScroll === "true";
      if (restoreScrollOnClose && !splitOwnsScroll && Math.abs(current - savedScrollY) > 1) {
        requestAnimationFrame(() => window.scrollTo(0, savedScrollY));
      }
      delete root.dataset.snSplitOwnsScroll;
      restoreScrollOnClose = true;
    }
  }

  // Do not mutate html/body overflow, position, height, inert, pointer-events,
  // or install document-level touchmove blockers while a sheet is open. Those
  // patterns can break hit testing and text-field focus in iOS standalone PWAs.
  // The fixed backdrop already prevents clicks from reaching the workout behind
  // it, while overscroll containment keeps the sheet's native scrolling local.
  const observer = new MutationObserver(syncModalState);
  observer.observe(body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class"]
  });

  syncModalState();
})();
