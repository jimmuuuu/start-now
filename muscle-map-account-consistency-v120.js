// START/NOW v120 — keep the current anatomical muscle map consistent for every account and guest session.
(() => {
  const INACTIVE_FILL = "#303B48";
  const INACTIVE_STROKE = "#5D6A79";
  let applying = false;

  function isHome() {
    return typeof state === "undefined" || state?.page === "home";
  }

  function findMuscleCard() {
    return document.querySelector(".sn59-muscle-card") ||
      document.querySelector("[data-sn-muscle-host='current']") ||
      [...document.querySelectorAll(".section-card,.card")].find(card => /muscle\s*focus/i.test(card.textContent || ""));
  }

  function ensureHost() {
    if (!isHome()) return null;
    const root = document.getElementById("app");
    if (!root) return null;

    const existing = findMuscleCard();
    if (existing) return existing;

    const host = document.createElement("section");
    host.className = "card section-card sn120-muscle-host";
    host.dataset.snMuscleHost = "current";
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

  function makeNoWorkoutMapNeutral(card) {
    if (!card?.classList.contains("sn59-muscle-card")) return;
    const hasWorkout = Boolean(
      window.SN36?.scheduledWorkout?.() ||
      (typeof getScheduledWorkout === "function" ? getScheduledWorkout() : null)
    );
    if (hasWorkout) return;

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

      if (typeof window.START_NOW_MUSCLE_PRESENTATION?.render === "function") {
        window.START_NOW_MUSCLE_PRESENTATION.render();
        card = findMuscleCard() || card;
      }

      showCard(card);
      makeNoWorkoutMapNeutral(card);
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
    version: "v120",
    refresh: ensureMuscleMap
  };

  scheduleEnsure();
  setTimeout(ensureMuscleMap, 250);
})();