// START/NOW v141 — keep modal sheets natively scrollable and fully interactive on iOS.
(() => {
  const body = document.body;
  if (!body) return;

  const modalSelector = "#snProductModal, #beginnerWizard, .sn-modal-backdrop, .beginner-modal-overlay, #snAuthModal.open";
  let modalOpen = false;
  let savedScrollY = 0;

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

  function syncModalState() {
    const open = isOpen();

    if (open && !modalOpen) {
      modalOpen = true;
      savedScrollY = window.scrollY || window.pageYOffset || 0;
      return;
    }

    if (!open && modalOpen) {
      modalOpen = false;
      const current = window.scrollY || window.pageYOffset || 0;
      if (Math.abs(current - savedScrollY) > 1) {
        requestAnimationFrame(() => window.scrollTo(0, savedScrollY));
      }
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
