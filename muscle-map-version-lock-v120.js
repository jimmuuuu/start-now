// START/NOW v120 — one muscle map only: the current v59 anatomical renderer.
(() => {
  const VERSION = "v120";
  let applying = false;
  let queued = false;

  const onHome = () => typeof state === "undefined" || state?.page === "home";

  function removeLegacyMuscleCards() {
    const cards = [...document.querySelectorAll(".section-card,.card")];
    cards.forEach(card => {
      if (card.classList.contains("sn59-muscle-card")) return;
      if (card.querySelector(".body-visual")) card.remove();
    });
  }

  function currentCard() {
    return document.querySelector(".sn59-muscle-card");
  }

  function renderCurrent() {
    queued = false;
    if (applying || !onHome()) return;
    applying = true;
    try {
      const renderer = window.START_NOW_MUSCLE_PRESENTATION;
      if (renderer?.version === "v59" && typeof renderer.render === "function") {
        renderer.render();
      }

      removeLegacyMuscleCards();

      const card = currentCard();
      if (card) {
        card.hidden = false;
        card.style.removeProperty("display");
        card.removeAttribute("aria-hidden");
        card.dataset.muscleMapVersion = VERSION;
      }
    } finally {
      applying = false;
    }
  }

  function schedule() {
    if (queued) return;
    queued = true;
    queueMicrotask(renderCurrent);
  }

  // The original starter renderer used this global function. Returning no markup prevents
  // an old body drawing from being inserted even if a stale wrapper calls it during the transition.
  if (typeof window.bodySvg === "function") {
    window.bodySvg = () => "";
  }

  if (typeof renderHome === "function") {
    const previousRenderHome = renderHome;
    window.renderHome = function(...args) {
      const result = previousRenderHome.apply(this, args);
      schedule();
      return result;
    };
  }

  const app = document.getElementById("app");
  if (app && typeof MutationObserver !== "undefined") {
    const observer = new MutationObserver(() => {
      if (!onHome()) return;
      if (app.querySelector(".body-visual") || !currentCard()) schedule();
    });
    observer.observe(app, { childList: true, subtree: true });
  }

  window.addEventListener("pageshow", schedule);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) schedule();
  });

  window.START_NOW_MUSCLE_VERSION_LOCK = {
    version: VERSION,
    refresh: renderCurrent
  };

  schedule();
  setTimeout(renderCurrent, 100);
  setTimeout(renderCurrent, 500);
})();