// START/NOW v78 — prevent the app behind onboarding/product modals from scrolling.
(() => {
  const root = document.documentElement;
  const body = document.body;
  if (!root || !body) return;

  const modalSelector = "#snProductModal, #beginnerWizard, .sn-modal-backdrop, .beginner-modal-overlay";
  const scrollableModalSelector = ".sn-modal, .beginner-modal";
  let locked = false;
  let scrollY = 0;
  let previous = null;

  const style = document.createElement("style");
  style.id = "snModalScrollLockStyles";
  style.textContent = `
    html.sn-background-locked,
    body.sn-background-locked {
      overflow: hidden !important;
      overscroll-behavior: none !important;
    }
    .sn-modal-backdrop,
    .beginner-modal-overlay {
      overscroll-behavior: contain !important;
    }
    .sn-modal,
    .beginner-modal {
      overscroll-behavior: contain !important;
      -webkit-overflow-scrolling: touch;
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
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width
    };

    root.classList.add("sn-background-locked");
    body.classList.add("sn-background-locked");
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
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
    body.style.overflow = previous?.bodyOverflow || "";
    body.style.position = previous?.bodyPosition || "";
    body.style.top = previous?.bodyTop || "";
    body.style.left = previous?.bodyLeft || "";
    body.style.right = previous?.bodyRight || "";
    body.style.width = previous?.bodyWidth || "";
    previous = null;

    window.scrollTo(0, scrollY);
  }

  function syncLock() {
    if (modalIsOpen()) lockBackground();
    else unlockBackground();
  }

  function blockBackgroundGesture(event) {
    if (!locked) return;
    if (event.target?.closest?.(scrollableModalSelector)) return;
    event.preventDefault();
  }

  document.addEventListener("wheel", blockBackgroundGesture, { passive: false, capture: true });
  document.addEventListener("touchmove", blockBackgroundGesture, { passive: false, capture: true });

  const observer = new MutationObserver(syncLock);
  observer.observe(body, { childList: true, subtree: true });
  syncLock();
})();
