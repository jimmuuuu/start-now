/* Active workout lifecycle and logging. Rendering never replaces a focused set input. */
(() => {
  const SN = SN36,
    U = UI,
    { esc, icon, button, iconButton } = U;
  let finishing = false;
  function restore() {
    const saved = SN.read(SN.keys.active, null);
    if (saved?.workoutName && Array.isArray(saved.exercises)) {
      SN.active = saved;
      SN.active.rest = {
        durationSeconds: 90,
        remainingSeconds: 90,
        autoStart: true,
        running: false,
        ...saved.rest,
      };
      SN.active.exercises.forEach((e) => {
        if (!Array.isArray(e.sets)) e.sets = [];
      });
      return SN.active;
    }
    return null;
  }
  function save() {
    return !SN.active || SN.write(SN.keys.active, SN.active);
  }
  function clear() {
    SN.active = null;
    state.activeWorkout = null;
    localStorage.removeItem(SN.keys.active);
  }
  function makeExercise(base, workoutId) {
    const ex = SN.normalizeExercise(base, {
      workoutId,
      occurrence: Date.now(),
    });
    const previous =
      SN.previousExercise(ex)?.result?.sets?.filter((s) => s.done) || [];
    return {
      ...ex,
      note: "",
      skipped: false,
      originalPlannedSets: ex.sets,
      sets: Array.from({ length: ex.sets }, (_, i) => ({
        weight: previous[i]?.weight ?? null,
        reps: previous[i]?.reps ?? null,
        done: false,
        prefilled: !!previous[i],
      })),
    };
  }
  async function start(workout) {
    if (SN.active || restore()) {
      const m = U.sheet(
        "Workout in progress",
        '<p class="sheet-copy">Finish or discard ' +
          esc(SN.active.workoutName) +
          " before starting another workout.</p>" +
          button("Resume workout", "go", "activeWorkout", "btn primary full"),
      );
      return m;
    }
    workout = workout || {
      id: "quick-" + Date.now(),
      name: "New workout",
      days: [],
      exercises: [],
    };
    const normalized = SN.normalizeWorkout(workout),
      prefs = SN.restPrefs();
    SN.active = {
      version: 200,
      id: "active-" + Date.now(),
      workoutId: normalized.id,
      workoutName: normalized.name,
      startedAt: Date.now(),
      index: 0,
      days: normalized.days,
      rest: {
        durationSeconds: prefs.seconds,
        remainingSeconds: prefs.seconds,
        autoStart: prefs.autoStart,
        running: false,
        paused: false,
        endAt: null,
      },
      exercises: normalized.exercises.map((e) =>
        makeExercise(e, normalized.id),
      ),
    };
    if (!save()) {
      SN.active = null;
      return;
    }
    U.go("activeWorkout");
  }
  function totals() {
    return (SN.active?.exercises || []).reduce(
      (a, e) => {
        a.planned += e.sets.length;
        for (const s of e.sets)
          if (s.done) {
            a.done++;
            a.volume += SN.num(s.weight) * SN.num(s.reps);
          }
        return a;
      },
      { done: 0, planned: 0, volume: 0 },
    );
  }
  const time = (seconds) =>
    Math.floor(seconds / 60) +
    ":" +
    String(Math.max(0, seconds) % 60).padStart(2, "0");
  function remaining() {
    const r = SN.active?.rest;
    return r?.running && !r.paused
      ? Math.max(0, Math.ceil((r.endAt - Date.now()) / 1000))
      : Math.max(0, Math.round(r?.remainingSeconds || 0));
  }
  function startRest() {
    const r = SN.active.rest;
    r.running = true;
    r.paused = false;
    r.notified = false;
    r.remainingSeconds = r.durationSeconds;
    r.endAt = Date.now() + r.durationSeconds * 1000;
    save();
    tick();
  }
  function tick() {
    const s = SN.active;
    if (!s) return;
    const elapsed = Math.max(0, Math.floor((Date.now() - s.startedAt) / 1000)),
      r = s.rest,
      left = remaining();
    const clock = document.getElementById("elapsed");
    if (clock) clock.textContent = time(elapsed);
    const rest = document.getElementById("restTime");
    if (rest) rest.textContent = time(left);
    if (r.running && !r.paused && !left) {
      r.running = false;
      r.remainingSeconds = 0;
      r.endAt = null;
      if (!r.notified) {
        r.notified = true;
        showToast("Rest complete. Ready for your next set.");
        navigator.vibrate?.(100);
      }
      save();
    }
    const toggle = document.getElementById("restToggle");
    if (toggle) {
      toggle.innerHTML = icon(r.running && !r.paused ? "pause" : "play");
      toggle.setAttribute(
        "aria-label",
        r.running && !r.paused ? "Pause rest timer" : "Start rest timer",
      );
    }
    const stats = totals();
    const volume = document.getElementById("workoutVolume");
    if (volume)
      volume.textContent = Math.round(stats.volume).toLocaleString() + " lb";
    const count = document.getElementById("workoutSets");
    if (count) count.textContent = stats.done + " / " + stats.planned;
  }
  function setRows(ex, i) {
    const previous =
      SN.previousExercise(ex)?.result?.sets?.filter((s) => s.done) || [];
    const next = ex.sets.findIndex((s) => !s.done);
    return (
      '<div class="set-grid set-head"><span>SET</span><span>PREVIOUS</span><span>LB</span><span>REPS</span><span role="img" aria-label="Completed">' +
      icon("check") +
      "</span></div>" +
      ex.sets
        .map((s, j) => {
          const prev = previous[j];
          return (
            '<div class="set-grid set-row ' +
            (s.done ? "completed" : j === next ? "current" : "") +
            '" data-row="' +
            i +
            ":" +
            j +
            '">' +
            '<button class="set-number" ' +
            U.attr("setOptions", i + ":" + j) +
            ' aria-label="Options for set ' +
            (j + 1) +
            " of " +
            esc(ex.name) +
            '">' +
            (j + 1) +
            "</button>" +
            '<span class="previous-set">' +
            (prev ? esc(SN.round1(prev.weight) + " × " + prev.reps) : "—") +
            "</span>" +
            '<input type="number" inputmode="decimal" min="0" max="9999" step="any" enterkeyhint="next" data-ex="' +
            i +
            '" data-set="' +
            j +
            '" data-field="weight" value="' +
            esc(s.weight ?? "") +
            '" placeholder="' +
            (prev?.weight ?? "0") +
            '" aria-label="Weight for set ' +
            (j + 1) +
            " of " +
            esc(ex.name) +
            '">' +
            '<input type="number" inputmode="numeric" min="1" max="999" step="1" enterkeyhint="done" data-ex="' +
            i +
            '" data-set="' +
            j +
            '" data-field="reps" value="' +
            esc(s.reps ?? "") +
            '" placeholder="' +
            SN.repRange(ex).max +
            '" aria-label="Reps for set ' +
            (j + 1) +
            " of " +
            esc(ex.name) +
            '">' +
            '<button class="set-check" ' +
            U.attr("completeSet", i + ":" + j) +
            ' aria-label="' +
            (s.done ? "Mark incomplete" : "Complete") +
            " set " +
            (j + 1) +
            " of " +
            esc(ex.name) +
            '" aria-pressed="' +
            !!s.done +
            '">' +
            icon("check") +
            "</button></div>"
          );
        })
        .join("")
    );
  }
  function exerciseSection(ex, i) {
    const note = SN.previousExerciseNote(ex);
    return (
      '<section class="workout-exercise" id="exercise-' +
      i +
      '" aria-label="' +
      esc(ex.name) +
      '"><div class="exercise-top">' +
      U.exerciseRow(
        ex,
        "detail",
        SN.exerciseId(ex),
        "",
        SN.meta(ex).primary + " · " + SN.repLabel(ex) + " reps",
      ) +
      iconButton("more", "Options for " + ex.name, "exerciseOptions", i) +
      "</div>" +
      (note
        ? '<p class="previous-note">Last note: ' + esc(note.note) + "</p>"
        : "") +
      '<textarea class="exercise-note" rows="1" maxlength="500" data-note="' +
      i +
      '" placeholder="Add a note…" aria-label="Note for ' +
      esc(ex.name) +
      '">' +
      esc(ex.note || "") +
      "</textarea>" +
      '<div id="sets-' +
      i +
      '">' +
      setRows(ex, i) +
      "</div>" +
      button(icon("plus") + " Add set", "addSet", i, "add-set") +
      "</section>"
    );
  }
  function render() {
    const s = SN.active || restore();
    if (!s) {
      U.go("home", { force: true });
      return;
    }
    app.innerHTML =
      '<section class="workout-screen"><div class="workout-header">' +
      U.header(
        s.workoutName,
        button("Finish", "finishReview", "", "btn primary small"),
      ) +
      '<div class="workout-metrics"><div><span>Duration</span><strong id="elapsed">0:00</strong></div><div><span>Volume</span><strong id="workoutVolume">0 lb</strong></div><div><span>Sets</span><strong id="workoutSets">0 / 0</strong></div></div>' +
      '<div class="rest-bar"><button ' +
      U.attr("restSettings") +
      ">" +
      icon("timer") +
      ' Rest <strong id="restTime">' +
      time(remaining()) +
      "</strong></button>" +
      iconButton("minus", "Subtract 15 seconds", "restAdjust", -15) +
      '<button class="icon-btn" id="restToggle" ' +
      U.attr("restToggle") +
      ' aria-label="Start rest timer">' +
      icon("play") +
      "</button>" +
      iconButton("plus", "Add 15 seconds", "restAdjust", 15) +
      button("Skip", "restSkip", "", "text-btn") +
      "</div></div>" +
      (s.exercises.length
        ? s.exercises.map(exerciseSection).join("")
        : U.empty(
            "Build your workout",
            "Add your first exercise to start logging.",
          )) +
      '<div class="section">' +
      button(
        icon("plus") + " Add exercises",
        "activeAdd",
        "",
        "btn soft full",
      ) +
      '</div><div class="button-row">' +
      button("Rename", "renameWorkout", "", "text-btn") +
      button("Discard workout", "discardWorkout", "", "text-btn danger") +
      "</div></section>";
    tick();
  }
  function refreshExercise(i) {
    const node = document.getElementById("sets-" + i);
    if (node) node.innerHTML = setRows(SN.active.exercises[i], i);
    tick();
  }
  function result() {
    const s = SN.active,
      stamp = Date.now();
    const record = SN.normalizeSession({
      schemaVersion: 2,
      id: s.id.replace("active-", "session-"),
      timestamp: stamp,
      updatedAt: stamp,
      startedAt: s.startedAt,
      workoutId: s.workoutId,
      workoutName: s.workoutName,
      status: "completed",
      durationMinutes: Math.max(1, Math.round((stamp - s.startedAt) / 60000)),
      exercises: s.exercises.map((e) => ({
        ...e,
        note: SN.normalizeExerciseNote(e.note).trim(),
        plannedSets: e.originalPlannedSets || e.sets.length,
      })),
    });
    const grade = SN.calculateGrade(record);
    Object.assign(record, {
      grade: grade.score,
      gradeLetter: grade.letter,
      gradeBreakdown: grade,
      prs: SN.detectPRs(record, SN.sessions()),
    });
    return record;
  }
  async function finishReview() {
    if (!totals().done) {
      showToast("Complete at least one set before finishing.");
      return;
    }
    const r = result(),
      left = totals().planned - totals().done;
    const m = U.sheet(
      "Finish workout?",
      '<label class="field">Workout name<input id="finishName" maxlength="80" value="' +
        esc(r.workoutName) +
        '"></label>' +
        reviewMetrics(r) +
        (left
          ? '<p class="sheet-copy">' +
            left +
            " unfinished " +
            (left === 1 ? "set" : "sets") +
            " will stay uncompleted. Only logged sets count toward your progress.</p>"
          : '<p class="sheet-copy">All sets complete. Your workout is ready to save.</p>') +
        '<p id="finishError" class="error-note" role="alert"></p>',
      { footer: button("Save workout", "finishSave", "", "btn primary full") },
    );
    m.querySelector("#finishName").oninput = (e) => {
      SN.active.workoutName = e.target.value;
      save();
    };
  }
  function finish() {
    if (finishing || !SN.active) return;
    const name = SN.active.workoutName.trim();
    if (!name) {
      document.getElementById("finishError").textContent =
        "Give your workout a name.";
      return;
    }
    SN.active.workoutName = name;
    finishing = true;
    try {
      const record = result();
      if (!SN.addSession(record)) {
        document.getElementById("finishError").textContent =
          "Your workout could not be saved. Free some device storage and try again. Your session is still open.";
        return;
      }
      SN.lastCompleted = record;
      clear();
      U.closeSheet();
      U.go("summary", { force: true });
      window.SN_AUTH?.syncNow?.({ silent: true });
    } finally {
      finishing = false;
    }
  }
  function reviewMetrics(s) {
    return (
      '<div class="finish-review"><div><strong>' +
      s.durationMinutes +
      "<small> min</small></strong><span>Duration</span></div><div><strong>" +
      s.completedSets +
      "</strong><span>Sets completed</span></div><div><strong>" +
      Math.round(s.volume).toLocaleString() +
      "</strong><span>Volume · lb</span></div></div>"
    );
  }
  function summary() {
    const s = SN.lastCompleted || SN.sessions().at(-1);
    if (!s) {
      U.go("home");
      return;
    }
    app.innerHTML =
      U.header("Workout saved") +
      '<div class="summary-check">' +
      icon("check") +
      '</div><p class="meta">' +
      esc(SN.formatDate(s.timestamp)) +
      '</p><h2 class="summary-title">' +
      esc(s.workoutName) +
      "</h2>" +
      reviewMetrics(s) +
      (s.prs?.length
        ? U.section(
            "Personal records",
            s.prs
              .map(
                (p) =>
                  '<div class="summary-pr">' +
                  icon("award") +
                  "<div><strong>" +
                  esc(p.exercise) +
                  "</strong><small>" +
                  esc(p.type) +
                  " · " +
                  esc(p.value) +
                  "</small></div></div>",
              )
              .join(""),
          )
        : "") +
      U.section(
        "Session grade",
        "<p><strong>" +
          esc(s.gradeLetter || SN.gradeLetter(s.grade)) +
          '</strong> <span class="muted">· ' +
          s.grade +
          ' / 100</span></p><p class="meta">Based on completed sets, rep targets, and consistency.</p>',
      ) +
      '<div class="section">' +
      button("Done", "go", "home", "btn primary full") +
      "</div>" +
      button("Save as routine", "saveSessionRoutine", s.id, "text-btn");
  }
  Object.assign(U.actions, {
    startEmpty: () => start(),
    startRoutine: (_, b) =>
      start(SN.workouts().find((w) => w.id === b.dataset.value)),
    activeAdd: () =>
      U.picker({
        onSelect: (list) => {
          SN.active.exercises.push(
            ...list.map((e) => makeExercise(e, SN.active.workoutId)),
          );
          save();
          render();
        },
      }),
    addSet: (_, b) => {
      const i = +b.dataset.value,
        ex = SN.active.exercises[i],
        last = ex.sets.at(-1);
      ex.sets.push({
        weight: last?.weight ?? null,
        reps: last?.reps ?? null,
        done: false,
      });
      save();
      refreshExercise(i);
    },
    completeSet: (_, b) => {
      const [i, j] = b.dataset.value.split(":").map(Number),
        s = SN.active.exercises[i].sets[j];
      if (!s.done) {
        if (
          !Number.isInteger(Number(s.reps)) ||
          Number(s.reps) < 1 ||
          Number(s.reps) > 999 ||
          SN.num(s.weight) < 0 ||
          SN.num(s.weight) > 9999
        ) {
          showToast("Enter valid reps and a weight of zero or more.");
          document
            .querySelector(
              '[data-ex="' + i + '"][data-set="' + j + '"][data-field="reps"]',
            )
            ?.focus();
          return;
        }
        s.weight = SN.num(s.weight);
        s.done = true;
        if (SN.active.rest.autoStart) startRest();
        navigator.vibrate?.(15);
      } else s.done = false;
      save();
      refreshExercise(i);
    },
    setOptions: (_, b) => {
      const [i, j] = b.dataset.value.split(":").map(Number),
        ex = SN.active.exercises[i];
      U.sheet(
        "Set " + (j + 1),
        U.menu("Delete set", ex.name, "trash", "deleteSet", i + ":" + j),
      );
    },
    deleteSet: async (_, b) => {
      const [i, j] = b.dataset.value.split(":").map(Number),
        ex = SN.active.exercises[i];
      if (
        ex.sets[j].done &&
        !(await U.confirm(
          "Delete completed set?",
          "This set will be removed from the active workout.",
          "Delete set",
          true,
        ))
      )
        return;
      ex.sets.splice(j, 1);
      ex.originalPlannedSets = Math.min(ex.originalPlannedSets, ex.sets.length);
      save();
      U.closeSheet();
      refreshExercise(i);
    },
    exerciseOptions: (_, b) => {
      const i = +b.dataset.value,
        ex = SN.active.exercises[i];
      U.sheet(
        ex.name,
        U.menu(
          "Replace exercise",
          "Same muscle and movement",
          "shuffle",
          "swapExercise",
          i,
        ) +
          U.menu("Move up", "", "up", "moveExercise", i + ":-1") +
          U.menu("Move down", "", "down", "moveExercise", i + ":1") +
          U.menu("Remove exercise", "", "trash", "removeExercise", i),
      );
    },
    moveExercise: (_, b) => {
      const [i, d] = b.dataset.value.split(":").map(Number),
        list = SN.active.exercises,
        j = i + d;
      if (j < 0 || j >= list.length) {
        showToast(d < 0 ? "Already first." : "Already last.");
        return;
      }
      [list[i], list[j]] = [list[j], list[i]];
      save();
      U.closeSheet();
      render();
    },
    removeExercise: async (_, b) => {
      const i = +b.dataset.value,
        ex = SN.active.exercises[i];
      if (
        !(await U.confirm(
          "Remove " + ex.name + "?",
          "All sets for this exercise will be removed from this workout.",
          "Remove",
          true,
        ))
      )
        return;
      SN.active.exercises.splice(i, 1);
      save();
      render();
    },
    swapExercise: (_, b) => {
      const i = +b.dataset.value;
      SN.active.index = i;
      const old = SN.active.exercises[i],
        items = START_NOW_SWAP_ENGINE.eligibleExercises(old);
      U.picker({
        title: "Replace exercise",
        items,
        multi: false,
        help:
          "Matching " +
          SN.meta(old).primary.toLowerCase() +
          " movements. Completed sets stay in your log.",
        onSelect: ([base]) => {
          const replacement = makeExercise(
            {
              ...base,
              sets: Math.max(1, old.sets.filter((s) => !s.done).length),
            },
            SN.active.workoutId,
          );
          replacement.swappedFrom = old.name;
          if (old.sets.some((s) => s.done)) {
            old.sets = old.sets.filter((s) => s.done);
            old.originalPlannedSets = old.sets.length;
            SN.active.exercises.splice(i + 1, 0, replacement);
          } else SN.active.exercises[i] = replacement;
          save();
          render();
        },
      });
    },
    restToggle: () => {
      const r = SN.active.rest;
      if (r.running && !r.paused) {
        r.remainingSeconds = remaining();
        r.paused = true;
        r.endAt = null;
      } else {
        r.running = true;
        r.paused = false;
        r.notified = false;
        r.endAt = Date.now() + (r.remainingSeconds || r.durationSeconds) * 1000;
      }
      save();
      tick();
    },
    restAdjust: (_, b) => {
      const r = SN.active.rest,
        next = Math.max(0, remaining() + Number(b.dataset.value));
      r.remainingSeconds = next;
      if (r.running && !r.paused) r.endAt = Date.now() + next * 1000;
      save();
      tick();
    },
    restSkip: () => {
      Object.assign(SN.active.rest, {
        running: false,
        paused: false,
        remainingSeconds: 0,
        endAt: null,
        notified: true,
      });
      save();
      tick();
    },
    restSettings: () => {
      const r = SN.active.rest,
        m = U.sheet(
          "Rest timer",
          '<label class="field">Duration<select id="restDuration" aria-label="Duration">' +
            [30, 45, 60, 90, 120, 180, 240, 300]
              .map(
                (n) =>
                  '<option value="' +
                  n +
                  '" ' +
                  (r.durationSeconds === n ? "selected" : "") +
                  ">" +
                  time(n) +
                  "</option>",
              )
              .join("") +
            '</select></label><label class="menu-row"><span>Start after completing a set</span><input id="restAuto" type="checkbox" ' +
            (r.autoStart ? "checked" : "") +
            "></label>",
          { footer: button("Save", "restSave", "", "btn primary full") },
        );
      m.querySelector('[data-act="restSave"]').onclick = () => {
        r.durationSeconds = +m.querySelector("#restDuration").value;
        r.autoStart = m.querySelector("#restAuto").checked;
        if (!r.running) r.remainingSeconds = r.durationSeconds;
        SN.saveRestPrefs({
          autoStart: r.autoStart,
          seconds: r.durationSeconds,
        });
        save();
        U.closeSheet();
        tick();
      };
    },
    renameWorkout: () => {
      const m = U.sheet(
        "Workout name",
        '<label class="field">Name<input id="activeName" maxlength="80" value="' +
          esc(SN.active.workoutName) +
          '"></label>',
        {
          footer:
            '<button id="renameDone" class="btn primary full">Save name</button>',
        },
      );
      m.querySelector("#renameDone").onclick = () => {
        const name = m.querySelector("input").value.trim();
        if (!name) {
          showToast("Enter a workout name.");
          return;
        }
        SN.active.workoutName = name;
        save();
        U.closeSheet();
        render();
      };
    },
    discardWorkout: async () => {
      if (
        await U.confirm(
          "Discard workout?",
          "This in-progress session will be removed. Previously saved workouts will remain.",
          "Discard workout",
          true,
        )
      ) {
        clear();
        U.go("home", { force: true });
      }
    },
    finishReview,
    finishSave: finish,
  });
  document.addEventListener("input", (e) => {
    if (e.target.matches("[data-field]")) {
      const { ex, set, field } = e.target.dataset,
        row = SN.active?.exercises[+ex]?.sets[+set];
      if (!row) return;
      row[field] = e.target.value === "" ? null : Number(e.target.value);
      row.prefilled = false;
      if (
        row.done &&
        (row.reps < 1 ||
          row.reps > 999 ||
          !Number.isInteger(row.reps) ||
          row.weight < 0 ||
          row.weight > 9999 ||
          !Number.isFinite(row.weight))
      ) {
        row.done = false;
        const element = e.target.closest(".set-row");
        element.classList.remove("completed");
        const check = element.querySelector(".set-check");
        check.setAttribute("aria-pressed", "false");
        check.setAttribute(
          "aria-label",
          "Complete set " + (+set + 1) + " of " + SN.active.exercises[+ex].name,
        );
      }
      save();
      tick();
    }
    if (e.target.matches("[data-note]")) {
      SN.active.exercises[+e.target.dataset.note].note =
        SN.normalizeExerciseNote(e.target.value);
      save();
    }
  });
  document.addEventListener("focusin", (e) => {
    if (e.target.matches("[data-field]")) e.target.select();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || !e.target.matches("[data-field]")) return;
    e.preventDefault();
    const { ex, set, field } = e.target.dataset;
    if (field === "weight")
      document
        .querySelector(
          '[data-ex="' + ex + '"][data-set="' + set + '"][data-field="reps"]',
        )
        ?.focus();
    else {
      e.target.blur();
      document
        .querySelector(
          '[data-act="completeSet"][data-value="' + ex + ":" + set + '"]',
        )
        ?.click();
    }
  });
  window.addEventListener("beforeunload", save);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) save();
    else tick();
  });
  setInterval(tick, 1000);
  SN.restoreActive = restore;
  SN.activeWorkoutSession = () => SN.active || restore();
  U.routes.activeWorkout = render;
  U.routes.summary = summary;
  window.Workout = {
    start,
    restore,
    save,
    clear,
    totals,
    result,
    render,
    reviewMetrics,
    makeExercise,
  };
})();
