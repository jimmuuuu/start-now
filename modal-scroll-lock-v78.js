// START/NOW v140 — keep modal sheets scrollable, tappable, and keyboard-focusable on iOS.
(() => {
  const root = document.documentElement;
  const body = document.body;
  const appShell = document.querySelector('.app-shell');
  if (!root || !body) return;

  const modalSelector = "#snProductModal, #beginnerWizard, .sn-modal-backdrop, .beginner-modal-overlay, #snAuthModal.open";
  const scrollableModalSelector = ".sn-modal, .beginner-modal, .sn-auth-sheet";

  let locked = false;
  let scrollY = 0;
  let previous = null;
  let restoringScroll = false;

  function isFormEntryTarget(target = document.activeElement) {
    return Boolean(target && (
      target.matches?.("input, textarea, select") ||
      target.isContentEditable
    ));
  }

  const style = document.createElement("style");
  style.id = "snModalScrollLockStyles";
  style.textContent = `
    html.sn-background-locked,
    body.sn-background-locked {
      overflow: hidden !important;
      overscroll-behavior: none !important;
      height: 100% !important;
    }
    body.sn-background-locked .app-shell {
      overflow: hidden !important;
      overscroll-behavior: none !important;
      touch-action: none !important;
      pointer-events: none !important;
    }
    .sn-modal-backdrop,
    .beginner-modal-overlay {
      overscroll-behavior: none !important;
      touch-action: auto !important;
      pointer-events: auto !important;
    }
    .sn-modal,
    .beginner-modal,
    .sn-auth-sheet {
      overflow-y: auto !important;
      overscroll-behavior: contain !important;
      -webkit-overflow-scrolling: touch;
      touch-action: pan-y pinch-zoom !important;
      pointer-events: auto !important;
      min-height: 0;
      position: relative;
    }
    .sn-modal button,
    .sn-modal input,
    .sn-modal textarea,
    .sn-modal select,
    .beginner-modal button,
    .beginner-modal input,
    .beginner-modal textarea,
    .beginner-modal select,
    .sn-auth-sheet button,
    .sn-auth-sheet input,
    .sn-auth-sheet textarea,
    .sn-auth-sheet select {
      pointer-events: auto !important;
      touch-action: manipulation !important;
    }
    @supports (height: 100dvh) {
      .sn-modal,
      .beginner-modal,
      .sn-auth-sheet {
        max-height: min(82dvh, 760px);
      }
    }
    @media (max-width: 768px) {
      input,
      textarea,
      select {
        font-size: 16px !important;
      }
    }
  `;
  document.head.appendChild(style);

  function modalIsOpen() {
    return Boolean(document.querySelector(modalSelector));
  }

  function lockBackground() {
    if (locked) return;
    locked = true;
    scrollY = window.scrollY || window.pageYOffset || 0;

    previous = {
      htmlOverflow: root.style.overflow,
      htmlHeight: root.style.height,
      bodyOverflow: body.style.overflow,
      bodyHeight: body.style.height,
      appShellHadInert: Boolean(appShell?.hasAttribute('inert'))
    };

    root.classList.add("sn-background-locked");
    body.classList.add("sn-background-locked");

    root.style.overflow = "hidden";
    root.style.height = "100%";
    body.style.overflow = "hidden";
    body.style.height = "100%";

    // Keep the app behind the modal non-interactive without fixing the entire
    // body. Fixing body position can create iOS hit-testing bugs where the
    // sheet scrolls visually but inputs and buttons no longer receive taps.
    if (appShell && !previous.appShellHadInert) appShell.setAttribute('inert', '');
  }

  function unlockBackground() {
    if (!locked) return;
    locked = false;

    root.classList.remove("sn-background-locked");
    body.classList.remove("sn-background-locked");

    root.style.overflow = previous?.htmlOverflow || "";
    root.style.height = previous?.htmlHeight || "";
    body.style.overflow = previous?.bodyOverflow || "";
    body.style.height = previous?.bodyHeight || "";
    if (appShell && !previous?.appShellHadInert) appShell.removeAttribute('inert');
    previous = null;

    restoringScroll = true;
    window.scrollTo(0, scrollY);
    requestAnimationFrame(() => { restoringScroll = false; });
  }

  function syncLock() {
    if (modalIsOpen()) lockBackground();
    else unlockBackground();
  }

  function modalForTarget(target) {
    return target?.closest?.(scrollableModalSelector) || null;
  }

  function handleWheel(event) {
    if (!locked) return;
    if (modalForTarget(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
  }

  function handleKeydown(event) {
    if (!locked) return;
    if (["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(event.target?.tagName)) return;

    const scrollKeys = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "]);
    if (!scrollKeys.has(event.key)) return;

    const modal = modalForTarget(event.target) || document.querySelector(scrollableModalSelector);
    if (!modal) event.preventDefault();
  }

  function enforceScrollPosition() {
    if (!locked || restoringScroll || isFormEntryTarget()) return;
    const current = window.scrollY || window.pageYOffset || 0;
    if (Math.abs(current - scrollY) > 1) {
      restoringScroll = true;
      window.scrollTo(0, scrollY);
      requestAnimationFrame(() => { restoringScroll = false; });
    }
  }

  document.addEventListener("wheel", handleWheel, { passive: false, capture: true });
  window.addEventListener("scroll", enforceScrollPosition, { passive: true });
  document.addEventListener("keydown", handleKeydown, { capture: true });

  const observer = new MutationObserver(syncLock);
  observer.observe(body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  syncLock();
})();
