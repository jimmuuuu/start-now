// Removes "technique day" language from generated plans and saved workouts.
// The lighter sessions remain normal workouts; they are just lower-volume when someone selects many days.
(() => {
  function cleanName(name = "") {
    return String(name)
      .replace(/Recovery\s*\+\s*Technique/gi, "Light Accessories")
      .replace(/\bTechnique\b/gi, "Light Full Body");
  }

  function cleanSavedWorkouts() {
    if (!window.state || !Array.isArray(state.customWorkouts)) return;
    state.customWorkouts = state.customWorkouts.map(workout => ({
      ...workout,
      name: cleanName(workout.name)
    }));
  }

  // Sanitize generated names right before anything is written to localStorage.
  if (typeof saveCustomWorkouts === "function") {
    const originalSaveCustomWorkouts = saveCustomWorkouts;
    saveCustomWorkouts = function () {
      cleanSavedWorkouts();
      return originalSaveCustomWorkouts();
    };
  }

  function cleanPreview() {
    const wizard = document.getElementById("beginnerWizard");
    if (!wizard) return;

    wizard.querySelectorAll(".beginner-review-copy strong").forEach(el => {
      const next = cleanName(el.textContent);
      if (el.textContent !== next) el.textContent = next;
    });

    wizard.querySelectorAll("input[data-workout-name]").forEach(input => {
      const next = cleanName(input.value);
      if (input.value !== next) input.value = next;
    });

    wizard.querySelectorAll(".beginner-reassurance p").forEach(el => {
      el.textContent = el.textContent
        .replace(/easier technique\/recovery sessions/gi, "lighter training sessions")
        .replace(/technique\/recovery sessions/gi, "lighter training sessions")
        .replace(/technique sessions/gi, "lighter training sessions");
    });
  }

  const observer = new MutationObserver(cleanPreview);
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(cleanPreview, 0);
})();
