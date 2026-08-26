// START/NOW v90 — muscle-matched, unused-only workout swaps with search.
(() => {
  const SN = window.SN36;
  if (!SN) return;

  const clone = value => JSON.parse(JSON.stringify(value));
  const escape = value => String(value ?? "").replace(/[&<>'"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]));
  const currentExercise = () => SN.active?.exercises?.[SN.active.index || 0] || null;

  function usedExerciseIds() {
    const active = SN.active;
    const used = new Set(active?.usedExerciseIds || []);
    if (!active?.exercises) return used;

    const currentIndex = active.index || 0;
    active.exercises.forEach((exercise, index) => {
      if (index === currentIndex) return;
      // Keep every other exercise already assigned in this workout out of the picker.
      // This prevents repeats from earlier swaps and prevents creating a duplicate
      // of an exercise that is still coming later in the workout.
      used.add(SN.exerciseId(exercise));
    });
    return used;
  }

  function eligibleExercises(exercise) {
    const used = usedExerciseIds();
    const targetMuscle = String(exercise?.muscle || "").trim();
    return exerciseLibrary
      .filter(candidate => !SN.exerciseMatches(candidate, exercise))
      .filter(candidate => String(candidate?.muscle || "").trim() === targetMuscle)
      .filter(candidate => !used.has(SN.exerciseId(candidate)))
      .sort((a, b) => {
        const equipmentDelta = Number(SN.equipment(b) === SN.equipment(exercise)) - Number(SN.equipment(a) === SN.equipment(exercise));
        return equipmentDelta || String(a.name || "").localeCompare(String(b.name || ""));
      });
  }

  function saveActive() {
    if (SN.active) SN.write(SN.keys.active, SN.active);
  }

  function applySwap(replacement, modal) {
    const old = currentExercise();
    if (!old || !replacement || !SN.active) return;

    const hadCompletedSets = (old.sets || []).some(set => set.done);
    if (hadCompletedSets) {
      SN.active.usedExerciseIds = [...new Set([...(SN.active.usedExerciseIds || []), SN.exerciseId(old)])];
    }

    const range = SN.repRange(replacement);
    SN.active.exercises[SN.active.index || 0] = {
      ...clone(replacement),
      repMin: range.min,
      repMax: range.max,
      originalPlannedSets: old.originalPlannedSets || old.sets?.length || 1,
      swappedFrom: old.name,
      skipped: false,
      note: "",
      sets: (old.sets || []).map(set => ({...set, done: false}))
    };

    saveActive();
    modal.remove();
    render();
  }

  function openImprovedSwap() {
    const exercise = currentExercise();
    if (!exercise || !SN.active) return;

    document.getElementById("snProductModal")?.remove();
    const candidates = eligibleExercises(exercise);
    const modal = document.createElement("div");
    modal.className = "sn-modal-backdrop";
    modal.id = "snProductModal";
    modal.innerHTML = `
      <div class="sn-modal">
        <div class="sn-modal-head">
          <div>
            <span>SWAP EXERCISE</span>
            <h2>Replace ${escape(exercise.name)}</h2>
          </div>
          <button data-close aria-label="Close swap exercise">×</button>
        </div>
        <p class="sn-modal-help">Showing only ${escape(exercise.muscle || "matching muscle")} exercises you have not already used in this workout.</p>
        <input
          id="snSwapSearch"
          class="sn-modal-search"
          type="search"
          inputmode="search"
          autocomplete="off"
          placeholder="Search ${escape(exercise.muscle || "exercise")} exercises"
          aria-label="Search replacement exercises"
          style="width:100%;box-sizing:border-box;margin:0 0 12px"
        />
        <div class="sn-option-list" id="snSwapOptions"></div>
      </div>`;

    document.body.appendChild(modal);
    const list = modal.querySelector("#snSwapOptions");
    const search = modal.querySelector("#snSwapSearch");

    function renderOptions(query = "") {
      const term = String(query).trim().toLowerCase();
      const filtered = !term ? candidates : candidates.filter(candidate => {
        const haystack = `${candidate.name || ""} ${candidate.muscle || ""} ${SN.meta(candidate).equipment || ""}`.toLowerCase();
        return haystack.includes(term);
      });

      if (!filtered.length) {
        list.innerHTML = `<div class="sn-modal-help" style="padding:14px 4px">No unused ${escape(exercise.muscle || "matching")} exercises match your search.</div>`;
        return;
      }

      list.innerHTML = filtered.map(candidate => `
        <button class="sn-exercise-choice" data-swap="${escape(SN.exerciseId(candidate))}">
          <span>
            <strong>${escape(candidate.name)}</strong>
            <small>${escape(candidate.muscle)} • ${escape(SN.meta(candidate).equipment)}</small>
          </span>
          <b>Swap →</b>
        </button>`).join("");

      list.querySelectorAll("[data-swap]").forEach(button => {
        button.addEventListener("click", () => {
          const replacement = candidates.find(candidate => SN.exerciseId(candidate) === button.dataset.swap);
          applySwap(replacement, modal);
        });
      });
    }

    renderOptions();
    search.addEventListener("input", event => renderOptions(event.currentTarget.value));
    modal.querySelector("[data-close]").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", event => {
      if (event.target === modal) modal.remove();
    });
    setTimeout(() => search.focus({preventScroll:true}), 0);
  }

  // Capture the click before product-workout-v36's original target listener so
  // the improved picker is used without disturbing the rest of the workout UI.
  document.addEventListener("click", event => {
    const button = event.target.closest?.("#snSwapExercise");
    if (!button || !SN.active) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    openImprovedSwap();
  }, true);
})();