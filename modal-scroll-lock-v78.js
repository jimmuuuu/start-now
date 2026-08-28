// START/NOW v113 — hard-lock the app behind modals without fighting mobile text entry.
(() => {
  const root = document.documentElement;
  const body = document.body;
  if (!root || !body) return;

  const modalSelector = "#snProductModal, #beginnerWizard, .sn-modal-backdrop, .beginner-modal-overlay";
  const scrollableModalSelector = ".sn-modal, .beginner-modal";

  let locked = false;
  let scrollY = 0;
  let previous = null;
  let lastTouchY = null;
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
    }
    .sn-modal-backdrop,
    .beginner-modal-overlay {
      overscroll-behavior: none !important;
    }
    .sn-modal,
    .beginner-modal {
      overscroll-behavior: contain !important;
      -webkit-overflow-scrolling: touch;
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
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width
    };

    root.classList.add("sn-background-locked");
    body.classList.add("sn-background-locked");

    root.style.overflow = "hidden";
    root.style.height = "100%";
    body.style.overflow = "hidden";
    body.style.height = "100%";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
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
    body.style.position = previous?.bodyPosition || "";
    body.style.top = previous?.bodyTop || "";
    body.style.left = previous?.bodyLeft || "";
    body.style.right = previous?.bodyRight || "";
    body.style.width = previous?.bodyWidth || "";
    previous = null;
    lastTouchY = null;

    restoringScroll = true;
    window.scrollTo(0, scrollY);
    requestAnimationFrame(() => { restoringScroll = false; });
  }

  function syncLock() {
    if (modalIsOpen()) lockBackground();
    else unlockBackground();
  }

  function canScrollModal(modal, deltaY) {
    if (!modal) return false;
    const maxScroll = Math.max(0, modal.scrollHeight - modal.clientHeight);
    if (maxScroll <= 1) return false;
    if (deltaY < 0) return modal.scrollTop > 0;
    if (deltaY > 0) return modal.scrollTop < maxScroll - 1;
    return true;
  }

  function modalForTarget(target) {
    return target?.closest?.(scrollableModalSelector) || null;
  }

  function handleWheel(event) {
    if (!locked) return;
    const modal = modalForTarget(event.target);
    if (!modal || !canScrollModal(modal, event.deltaY)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  function handleTouchStart(event) {
    if (!locked || !event.touches?.length) return;
    lastTouchY = event.touches[0].clientY;
  }

  function handleTouchMove(event) {
    if (!locked || !event.touches?.length) return;
    const currentY = event.touches[0].clientY;
    const deltaY = lastTouchY == null ? 0 : lastTouchY - currentY;
    lastTouchY = currentY;
    const modal = modalForTarget(event.target);
    if (!modal || !canScrollModal(modal, deltaY)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  function handleKeydown(event) {
    if (!locked) return;
    if (["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(event.target?.tagName)) return;

    const scrollKeys = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "]);
    if (!scrollKeys.has(event.key)) return;

    const modal = modalForTarget(event.target) || document.querySelector(scrollableModalSelector);
    let deltaY = 0;
    if (["ArrowDown", "PageDown", "End", " "].includes(event.key)) deltaY = 1;
    if (["ArrowUp", "PageUp", "Home"].includes(event.key)) deltaY = -1;

    if (!modal || !canScrollModal(modal, deltaY)) event.preventDefault();
  }

  function enforceScrollPosition() {
    // Mobile browsers move the visual viewport to keep the focused field above
    // the software keyboard. Fighting that scroll can blur the field and close
    // the keyboard, so leave the viewport alone while the user is typing.
    if (!locked || restoringScroll || isFormEntryTarget()) return;
    const current = window.scrollY || window.pageYOffset || 0;
    if (Math.abs(current - scrollY) > 1) {
      restoringScroll = true;
      window.scrollTo(0, scrollY);
      requestAnimationFrame(() => { restoringScroll = false; });
    }
  }

  document.addEventListener("wheel", handleWheel, { passive: false, capture: true });
  document.addEventListener("touchstart", handleTouchStart, { passive: true, capture: true });
  document.addEventListener("touchmove", handleTouchMove, { passive: false, capture: true });
  document.addEventListener("keydown", handleKeydown, { capture: true });
  document.addEventListener("focusin", event => {
    if (locked && isFormEntryTarget(event.target)) lastTouchY = null;
  }, { capture: true });
  window.addEventListener("scroll", enforceScrollPosition, { passive: true });

  const observer = new MutationObserver(syncLock);
  observer.observe(body, { childList: true, subtree: true });
  syncLock();
})();