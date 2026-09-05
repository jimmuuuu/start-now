// START/NOW v138 — keep the page locked behind modals while preserving native iOS modal scrolling.
(() => {
  const root = document.documentElement;
  const body = document.body;
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
    }
    .sn-modal-backdrop,
    .beginner-modal-overlay {
      overscroll-behavior: none !important;
      touch-action: none;
    }
    .sn-modal,
    .beginner-modal {
      overflow-y: auto !important;
      overscroll-behavior: contain !important;
      -webkit-overflow-scrolling: touch;
      touch-action: pan-y !important;
      min-height: 0;
    }
    @supports (height: 100dvh) {
      .sn-modal,
      .beginner-modal {
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
    // Let the modal own its scrolling. Blocking wheel/touch movement at the
    // document level can make iOS treat a long sheet as completely frozen.
    if (modalForTarget(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
  }

  function handleTouchMove(event) {
    if (!locked) return;
    // Native momentum scrolling inside the sheet is more reliable on iOS than
    // manually deciding whether every touch delta is allowed to scroll.
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
  document.addEventListener("touchmove", handleTouchMove, { passive: false, capture: true });
  window.addEventListener("scroll", enforceScrollPosition, { passive: true });
  document.addEventListener("keydown", handleKeydown, { capture: true });

  const observer = new MutationObserver(syncLock);
  observer.observe(body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  syncLock();
})();
