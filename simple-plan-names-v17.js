// START/NOW v17 — keep generated workout names simple and workout-based.
// Removes goal prefixes like Muscle/Fitness/Strength/Beginner and eliminates Technique day names.
(() => {
  function cleanPlanName(name = "") {
    let value = String(name).trim();

    // Remove goal/type prefixes from generated names.
    value = value.replace(/^(Beginner|Strength|Muscle|Fitness)\s+/i, "");

    // Replace names that sound like practice/recovery sessions with normal workout names.
    value = value
      .replace(/^Recovery\s*\+\s*Technique$/i, "Full Body B")
      .replace(/^Technique$/i, "Full Body")
      .replace(/^Easy\s+Full\s+Body$/i, "Full Body A")
      .replace(/\bRecovery\s*\+\s*Technique\b/gi, "Full Body B")
      .replace(/\bTechnique\b/gi, "Full Body");

    return value || "Workout";
  }

  function cleanGeneratedSavedWorkouts() {
    if (!window.state || !Array.isArray(state.customWorkouts)) return false;
    let changed = false;

    state.customWorkouts = state.customWorkouts.map(workout => {
      if (!workout?.beginnerGenerated) return workout;
      const nextName = cleanPlanName(workout.name);
      if (nextName === workout.name) return workout;
      changed = true;
      return { ...workout, name: nextName };
    });

    return changed;
  }

  // Make sure any newly saved generated plan uses the simple names too.
  if (typeof saveCustomWorkouts === "function") {
    const originalSaveCustomWorkouts = saveCustomWorkouts;
    saveCustomWorkouts = function () {
      cleanGeneratedSavedWorkouts();
      return originalSaveCustomWorkouts();
    };
  }

  function cleanPreview() {
    const wizard = document.getElementById("beginnerWizard");
    if (!wizard) return;

    // Clean names shown in the preview cards.
    wizard.querySelectorAll(".beginner-review-copy strong").forEach(el => {
      const next = cleanPlanName(el.textContent);
      if (el.textContent !== next) el.textContent = next;
    });

    // If a workout is opened in Edit mode, clean the actual editable value and
    // fire the input event so beginner-plan-v2's internal preview state updates too.
    wizard.querySelectorAll("input[data-workout-name]").forEach(input => {
      const next = cleanPlanName(input.value);
      if (input.value !== next) {
        input.value = next;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });

    // Remove the remaining technique/recovery wording from explanatory copy.
    wizard.querySelectorAll(".beginner-reassurance p, .beginner-answer-summary p, .beginner-subtitle").forEach(el => {
      const next = el.innerHTML
        .replace(/easier technique\/recovery sessions/gi, "lighter full-body or accessory sessions")
        .replace(/technique\/recovery sessions/gi, "lighter full-body or accessory sessions")
        .replace(/technique sessions/gi, "lighter full-body or accessory sessions")
        .replace(/technique\/recovery/gi, "lighter training");
      if (el.innerHTML !== next) el.innerHTML = next;
    });
  }

  // Clean any existing generated plan names already stored in the app.
  if (cleanGeneratedSavedWorkouts() && typeof saveCustomWorkouts === "function") {
    saveCustomWorkouts();
  }

  const observer = new MutationObserver(cleanPreview);
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(cleanPreview, 0);
})();
