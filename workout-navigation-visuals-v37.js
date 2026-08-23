// START/NOW v37 — previous-exercise navigation + exercise-specific non-fake visuals.
(() => {
  const SN = window.SN36;
  let enhancing = false;

  function esc(value="") {
    return typeof escapeHtml === "function" ? escapeHtml(String(value)) : String(value);
  }

  function currentExercise() {
    if (SN?.active?.exercises?.length) return SN.active.exercises[SN.active.index || 0] || null;
    const workout = state?.activeWorkout;
    const index = Number(state?.workoutIndex || 0);
    return workout?.exercises?.[index] || null;
  }

  function currentIndex() {
    if (SN?.active?.exercises?.length) return Number(SN.active.index || 0);
    return Number(state?.workoutIndex || 0);
  }

  function persistActive() {
    if (SN?.active && SN?.write && SN?.keys?.active) SN.write(SN.keys.active, SN.active);
  }

  function goPrevious() {
    const index = currentIndex();
    if (index <= 0) return;
    if (SN?.active?.exercises?.length) {
      SN.active.index = index - 1;
      persistActive();
    } else {
      state.workoutIndex = index - 1;
    }
    if (typeof render === "function") render();
    else if (typeof renderWorkout === "function") renderWorkout();
  }

  function equipmentName(ex) {
    if (SN?.meta) return SN.meta(ex).equipment || "Gym";
    const name = String(ex?.name || "").toLowerCase();
    if (name.includes("dumbbell")) return "Dumbbell";
    if (name.includes("barbell")) return "Barbell";
    if (name.includes("cable") || name.includes("pulldown") || name.includes("pushdown")) return "Cable";
    if (name.includes("machine") || name.includes("leg press")) return "Machine";
    if (name.includes("push-up") || name.includes("plank") || name.includes("bodyweight")) return "Bodyweight";
    return "Gym";
  }

  function equipmentIcon(type) {
    const common = `fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"`;
    if (type === "Dumbbell") return `<svg viewBox="0 0 32 32" ${common}><path d="M4 13v6M7 10v12M10 13v6M22 13v6M25 10v12M28 13v6M10 16h12"/></svg>`;
    if (type === "Barbell") return `<svg viewBox="0 0 32 32" ${common}><path d="M3 12v8M7 9v14M11 12v8M21 12v8M25 9v14M29 12v8M11 16h10"/></svg>`;
    if (type === "Cable") return `<svg viewBox="0 0 32 32" ${common}><circle cx="16" cy="7" r="3"/><path d="M16 10v10M10 20h12M12 20l-3 7M20 20l3 7"/></svg>`;
    if (type === "Bodyweight") return `<svg viewBox="0 0 32 32" ${common}><circle cx="16" cy="6" r="3"/><path d="M16 9v8M9 13l7 4 7-4M12 27l4-10 4 10"/></svg>`;
    if (type === "Cardio") return `<svg viewBox="0 0 32 32" ${common}><path d="M4 17h5l3-7 5 14 3-7h8"/></svg>`;
    return `<svg viewBox="0 0 32 32" ${common}><rect x="8" y="5" width="16" height="22" rx="3"/><path d="M12 10h8M12 15h8M12 20h8"/></svg>`;
  }

  function focusVisual(ex) {
    const equipment = equipmentName(ex);
    let body = "";
    try {
      if (typeof bodySvg === "function") body = bodySvg({ exercises: [ex] });
    } catch (_) {}

    return `<section class="sn-exercise-focus-panel" aria-label="Exercise focus for ${esc(ex?.name || "exercise")}">
      <div class="sn-exercise-focus-copy">
        <span>EXERCISE FOCUS</span>
        <strong>${esc(ex?.muscle || "Exercise")}</strong>
        <small>${esc(equipment)} • visual changes with the exercise</small>
      </div>
      <div class="sn-exercise-focus-art">
        ${body || `<div class="sn-equipment-icon">${equipmentIcon(equipment)}</div>`}
      </div>
    </section>`;
  }

  function installStyles() {
    if (document.getElementById("sn-v37-workout-styles")) return;
    const style = document.createElement("style");
    style.id = "sn-v37-workout-styles";
    style.textContent = `
      .sn-exercise-focus-panel{display:grid;grid-template-columns:minmax(0,1fr) 150px;gap:16px;align-items:center;margin:14px 0 16px;padding:16px;border:1px solid var(--line);border-radius:20px;background:linear-gradient(145deg,var(--surface),rgba(59,130,246,.035));overflow:hidden}
      .sn-exercise-focus-copy{display:grid;gap:5px;min-width:0}.sn-exercise-focus-copy>span{font-size:10px;font-weight:900;letter-spacing:.09em;color:var(--blue)}.sn-exercise-focus-copy>strong{font-size:18px;line-height:1.1;color:var(--text)}.sn-exercise-focus-copy>small{font-size:11px;line-height:1.4;color:var(--muted)}
      .sn-exercise-focus-art{height:126px;display:flex;align-items:center;justify-content:center;overflow:hidden}.sn-exercise-focus-art .sn-simple-muscle-wrap,.sn-exercise-focus-art .sn-dynamic-body-wrap{width:150px!important;max-width:150px!important;margin:0!important}.sn-exercise-focus-art .sn-simple-muscle-svg,.sn-exercise-focus-art .sn-dynamic-body-svg{width:150px!important;height:116px!important;object-fit:contain}.sn-exercise-focus-art .sn-simple-muscle-label,.sn-exercise-focus-art .sn-body-label{display:none!important}.sn-equipment-icon{width:72px;height:72px;border-radius:20px;display:grid;place-items:center;background:rgba(59,130,246,.08);color:var(--blue)}.sn-equipment-icon svg{width:42px;height:42px}
      .sn-prev-exercise{min-height:48px!important;font-weight:850!important}.sn-prev-exercise:disabled{opacity:.4;cursor:not-allowed}.sn-workout-actions.has-prev{grid-template-columns:1fr 1fr!important}.sn-prev-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0}.sn-prev-row .secondary{min-height:46px}
      .workout-screen>.exercise-visual{display:none!important}
      @media(max-width:560px){.sn-exercise-focus-panel{grid-template-columns:minmax(0,1fr) 116px;padding:14px;gap:10px}.sn-exercise-focus-art{height:105px}.sn-exercise-focus-art .sn-simple-muscle-wrap,.sn-exercise-focus-art .sn-dynamic-body-wrap{width:118px!important;max-width:118px!important}.sn-exercise-focus-art .sn-simple-muscle-svg,.sn-exercise-focus-art .sn-dynamic-body-svg{width:118px!important;height:96px!important}.sn-exercise-focus-copy>strong{font-size:16px}.sn-prev-row{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function enhanceWorkoutScreen() {
    if (enhancing) return;
    if (state?.page !== "activeWorkout") return;
    const screen = document.querySelector(".workout-screen");
    const ex = currentExercise();
    if (!screen || !ex) return;
    enhancing = true;
    try {
      // Remove the old one-size-fits-all machine art rather than pretending it demonstrates every movement.
      screen.querySelectorAll(":scope > .exercise-visual").forEach(node => node.remove());

      if (!screen.querySelector(".sn-exercise-focus-panel")) {
        const anchor = screen.querySelector(".sn-exercise-head") || screen.querySelector(".exercise-title");
        if (anchor) anchor.insertAdjacentHTML(anchor.classList.contains("sn-exercise-head") ? "afterend" : "beforebegin", focusVisual(ex));
      }

      if (!screen.querySelector("#snPreviousExercise")) {
        const actions = screen.querySelector(".sn-workout-actions") || screen.querySelector(".workout-actions");
        if (actions) {
          const row = document.createElement("div");
          row.className = "sn-prev-row";
          row.innerHTML = `<button class="secondary sn-prev-exercise" id="snPreviousExercise" ${currentIndex() <= 0 ? "disabled" : ""}>← Previous exercise</button>`;
          actions.insertAdjacentElement("beforebegin", row);
          row.querySelector("#snPreviousExercise")?.addEventListener("click", goPrevious);
        }
      }
    } finally {
      enhancing = false;
    }
  }

  installStyles();
  const observer = new MutationObserver(() => queueMicrotask(enhanceWorkoutScreen));
  observer.observe(document.getElementById("app"), { childList: true, subtree: true });
  enhanceWorkoutScreen();
})();