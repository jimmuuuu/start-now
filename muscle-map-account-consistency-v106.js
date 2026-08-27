// START/NOW v106 — keep the anatomical muscle map available for every account and guest session.
(() => {
  const INACTIVE_FILL = "#303B48";
  const INACTIVE_STROKE = "#5D6A79";
  let applying = false;

  function isHome() {
    return typeof state === "undefined" || state?.page === "home";
  }

  function findMuscleCard() {
    return document.querySelector(".sn59-muscle-card") ||
      document.querySelector(".sn58-muscle-card") ||
      document.querySelector(".sn51-muscle-card") ||
      [...document.querySelectorAll(".section-card,.card")].find(card => /muscle\s*focus/i.test(card.textContent || ""));
  }

  function ensureHost() {
    if (!isHome()) return null;
    const root = document.getElementById("app");
    if (!root) return null;

    const existing = findMuscleCard();
    if (existing) return existing;

    const host = document.createElement("section");
    host.className = "card section-card sn106-muscle-host";
    host.innerHTML = '<div class="section-head"><strong>Muscle Focus</strong></div>';

    const planCard = root.querySelector(".plan-card");
    if (planCard) planCard.insertAdjacentElement("afterend", host);
    else root.appendChild(host);
    return host;
  }

  function showCard(card) {
    if (!card) return;
    card.hidden = false;
    card.style.removeProperty("display");
    card.removeAttribute("aria-hidden");
  }

  function makeRestDayMapNeutral(card) {
    const isRestDay = Boolean(window.START_NOW_REST_DAY?.isRestToday?.());
    if (!isRestDay || !card) return;

    const title = card.querySelector(".sn59-title");
    const subtitle = card.querySelector(".sn59-subtitle");
    const chips = card.querySelector(".sn59-chips");

    if (title) title.textContent = "Recovery Day";
    if (subtitle) subtitle.textContent = "No muscles targeted today.";
    if (chips) chips.replaceChildren();

    card.querySelectorAll(".sn59-muscle").forEach(region => {
      region.classList.remove("sn59-state-primary", "sn59-state-secondary");
      region.classList.add("sn59-state-inactive");
      region.setAttribute("fill", INACTIVE_FILL);
      region.setAttribute("stroke", INACTIVE_STROKE);
      region.dataset.level = "Not targeted";
      const muscle = region.dataset.muscle || "Muscle";
      region.setAttribute("aria-label", `${muscle} — Not targeted`);
    });
  }

  function ensureMuscleMap() {
    if (applying || !isHome()) return;
    applying = true;
    try {
      let card = ensureHost();
      if (!card) return;
      showCard(card);

      // v59 owns the actual anatomy drawing. Calling it here makes the feature
      // independent of account-specific render order, schedule data, or cloud restore timing.
      if (typeof window.START_NOW_MUSCLE_PRESENTATION?.render === "function") {
        window.START_NOW_MUSCLE_PRESENTATION.render();
        card = findMuscleCard() || card;
      }

      showCard(card);
      makeRestDayMapNeutral(card);
    } finally {
      applying = false;
    }
  }

  function scheduleEnsure() {
    queueMicrotask(ensureMuscleMap);
  }

  if (typeof renderHome === "function") {
    const priorHome = renderHome;
    window.renderHome = function(...args) {
      const result = priorHome.apply(this, args);
      scheduleEnsure();
      return result;
    };
  }

  window.addEventListener("pageshow", scheduleEnsure);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) scheduleEnsure();
  });

  window.START_NOW_MUSCLE_CONSISTENCY = {
    version: "v106",
    refresh: ensureMuscleMap
  };

  scheduleEnsure();
  setTimeout(ensureMuscleMap, 250);
})();
