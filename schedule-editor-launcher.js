// Makes the schedule editor impossible to miss in the Workouts tab.
(() => {
  function installStyles() {
    if (document.getElementById("scheduleEditorLauncherStyles")) return;
    const style = document.createElement("style");
    style.id = "scheduleEditorLauncherStyles";
    style.textContent = `
      .schedule-editor-launch-card{
        width:100%;
        margin:12px 0 14px;
        padding:14px 16px;
        border:1px solid rgba(255,90,95,.35);
        border-radius:18px;
        background:linear-gradient(145deg,var(--surface),rgba(255,90,95,.06));
        color:var(--text);
        display:grid;
        grid-template-columns:44px minmax(0,1fr) auto;
        gap:12px;
        align-items:center;
        text-align:left;
      }
      .schedule-editor-launch-icon{
        width:44px;height:44px;border-radius:14px;
        display:grid;place-items:center;
        background:var(--coral);color:#fff;
        font-size:20px;font-weight:900;
        box-shadow:0 8px 18px rgba(255,90,95,.22);
      }
      .schedule-editor-launch-copy strong{display:block;font-size:15px;margin-bottom:3px}
      .schedule-editor-launch-copy span{display:block;color:var(--muted);font-size:11px;line-height:1.35}
      .schedule-editor-launch-arrow{color:var(--coral);font-size:22px;font-weight:900}
      .dark .schedule-editor-launch-card{background:linear-gradient(145deg,var(--surface),rgba(255,90,95,.08))}
    `;
    document.head.appendChild(style);
  }

  function enhanceScheduleEditorEntry() {
    if (state?.page !== "workouts") return;

    const realButton = document.getElementById("editWeeklySchedule");
    const scheduleCard = document.querySelector(".schedule-card");
    if (!realButton || !scheduleCard) return;

    const scheduleSub = scheduleCard.querySelector(".schedule-sub");
    if (scheduleSub) scheduleSub.textContent = "Move workouts, swap days, or add rest days anytime.";

    if (!document.getElementById("editScheduleLaunchCard")) {
      const launch = document.createElement("button");
      launch.type = "button";
      launch.id = "editScheduleLaunchCard";
      launch.className = "schedule-editor-launch-card";
      launch.innerHTML = `
        <span class="schedule-editor-launch-icon">✎</span>
        <span class="schedule-editor-launch-copy"><strong>Edit my schedule</strong><span>Change workout days and rearrange your week.</span></span>
        <span class="schedule-editor-launch-arrow">›</span>
      `;
      launch.addEventListener("click", () => realButton.click());

      const currentPlanBanner = document.querySelector(".active-plan-banner");
      if (currentPlanBanner) currentPlanBanner.insertAdjacentElement("afterend", launch);
      else scheduleCard.insertAdjacentElement("beforebegin", launch);
    }
  }

  installStyles();

  if (typeof renderWorkouts === "function") {
    const previousRenderWorkouts = renderWorkouts;
    renderWorkouts = function () {
      previousRenderWorkouts();
      enhanceScheduleEditorEntry();
    };
  }

  // Also handle the case where the Workouts tab is already open when this file loads.
  setTimeout(enhanceScheduleEditorEntry, 0);
})();