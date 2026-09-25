/* One routine editor for new, saved, and generated workouts. */
(() => {
  const SN = SN36,
    U = UI,
    { esc, icon, button, iconButton, header, section, empty, menu } = U;
  let draft = null,
    draftOriginal = "",
    generator = { minutes: 30, focus: "Full body", equipment: "Full gym" },
    generated = null;
  function edit(workout) {
    draft = workout
      ? cloneWorkout(workout)
      : { id: "routine-" + Date.now(), name: "", days: [], exercises: [] };
    draftOriginal = JSON.stringify(draft);
    U.go("builder", { force: true });
  }
  function editor() {
    if (!draft) {
      U.go("home", { force: true });
      return;
    }
    app.innerHTML =
      header(
        draftOriginal.includes('"name":""') ? "New routine" : "Edit routine",
        button("Save", "saveRoutine", "", "text-btn"),
        true,
      ) +
      '<label class="field">Routine name<input id="routineName" maxlength="80" placeholder="e.g. Upper body" value="' +
      esc(draft.name) +
      '"></label>' +
      '<div class="field"><span>Training days <span class="muted">(optional)</span></span><div class="day-picker">' +
      SN.dayOrder
        .map(
          (d) =>
            "<button " +
            U.attr("draftDay", d) +
            ' class="' +
            (draft.days.includes(d) ? "selected" : "") +
            '" aria-pressed="' +
            draft.days.includes(d) +
            '" aria-label="' +
            d +
            '">' +
            d.slice(0, 3) +
            "</button>",
        )
        .join("") +
      "</div></div>" +
      section(
        "Exercises",
        draft.exercises.length
          ? draft.exercises
              .map(
                (ex, i) =>
                  '<article class="editor-row">' +
                  U.exerciseRow(ex, "detail", SN.exerciseId(ex), "") +
                  '<div class="prescriptions"><label>Sets<input type="number" min="1" max="20" data-prescription="sets" data-i="' +
                  i +
                  '" value="' +
                  ex.sets +
                  '" aria-label="Sets for ' +
                  esc(ex.name) +
                  '"></label><label>Rep min<input type="number" min="1" max="999" data-prescription="repMin" data-i="' +
                  i +
                  '" value="' +
                  SN.repRange(ex).min +
                  '" aria-label="Minimum reps for ' +
                  esc(ex.name) +
                  '"></label><label>Rep max<input type="number" min="1" max="999" data-prescription="repMax" data-i="' +
                  i +
                  '" value="' +
                  SN.repRange(ex).max +
                  '" aria-label="Maximum reps for ' +
                  esc(ex.name) +
                  '"></label></div><div class="editor-actions">' +
                  button("Remove", "draftRemove", i, "text-btn danger") +
                  iconButton(
                    "up",
                    "Move " + ex.name + " up",
                    "draftMove",
                    i + ":-1",
                  ) +
                  iconButton(
                    "down",
                    "Move " + ex.name + " down",
                    "draftMove",
                    i + ":1",
                  ) +
                  "</div></article>",
              )
              .join("")
          : empty(
              "Choose your exercises",
              "Add exercises, then set your working sets and rep targets.",
            ),
      ) +
      '<div class="section">' +
      button(icon("plus") + " Add exercises", "draftAdd", "", "btn soft full") +
      '</div><p class="error-note" id="routineError" role="alert"></p><div class="section">' +
      button("Save routine", "saveRoutine", "", "btn primary full") +
      "</div>";
    document.getElementById("routineName").oninput = (e) =>
      (draft.name = e.target.value);
    app.querySelectorAll("[data-prescription]").forEach(
      (input) =>
        (input.oninput = () => {
          draft.exercises[+input.dataset.i][input.dataset.prescription] =
            input.value === "" ? null : Number(input.value);
        }),
    );
  }
  async function save() {
    draft.name = draft.name.trim();
    let error = !draft.name
      ? "Give your routine a name."
      : !draft.exercises.length
        ? "Add at least one exercise."
        : "";
    if (
      draft.exercises.some(
        (e) =>
          !Number.isInteger(e.sets) ||
          e.sets < 1 ||
          e.sets > 20 ||
          !Number.isInteger(e.repMin) ||
          !Number.isInteger(e.repMax) ||
          e.repMin < 1 ||
          e.repMax > 999 ||
          e.repMin > e.repMax,
      )
    )
      error =
        "Use 1–20 sets and a valid rep range (minimum no higher than maximum).";
    if (error) {
      document.getElementById("routineError").textContent = error;
      return;
    }
    const conflicts = SN.workouts().filter(
      (w) => w.id !== draft.id && w.days.some((d) => draft.days.includes(d)),
    );
    if (
      conflicts.length &&
      !(await U.confirm(
        "Update training days?",
        "Other routines on these days will become unscheduled. The routines themselves will stay saved.",
        "Update schedule",
      ))
    )
      return;
    const next = SN.workouts()
      .filter((w) => w.id !== draft.id)
      .map((w) => ({
        ...w,
        days: w.days.filter((d) => !draft.days.includes(d)),
        updatedAt: conflicts.some((c) => c.id === w.id)
          ? Date.now()
          : w.updatedAt,
      }));
    const saved = {
      ...draft,
      updatedAt: Date.now(),
      exercises: draft.exercises.map((e) => ({ ...e, reps: e.repMax })),
    };
    if (!SN.saveWorkouts([...next, saved])) return;
    draft = null;
    U.go("home", { force: true });
    showToast("Routine saved.");
  }
  function routineDetail(id) {
    const w = SN.workouts().find((w) => w.id === id);
    if (!w) return;
    U.sheet(
      w.name,
      '<p class="meta">' +
        w.exercises.length +
        " exercises · " +
        w.exercises.reduce((a, e) => a + e.sets, 0) +
        " sets</p>" +
        w.exercises
          .map((ex) =>
            U.exerciseRow(
              ex,
              "detail",
              SN.exerciseId(ex),
              "<small>" + ex.sets + " × " + esc(SN.repLabel(ex)) + "</small>",
            ),
          )
          .join(""),
      {
        footer:
          '<div class="button-row">' +
          button("Edit routine", "editRoutine", id, "btn") +
          button("Start routine", "startRoutine", id, "btn primary") +
          "</div>",
      },
    );
  }
  function templates() {
    U.sheet(
      "Routine library",
      '<p class="sheet-copy">Choose a split, preview the workouts, and make it your own.</p>' +
        Object.entries(START_NOW_ROUTINES.splits)
          .map(([id, t]) =>
            menu(
              t.name,
              t.days.length +
                " days per week · " +
                t.workouts.length +
                " routines",
              "book",
              "templatePreview",
              id,
            ),
          )
          .join(""),
    );
  }
  function templatePreview(id) {
    const t = START_NOW_ROUTINES.splits[id];
    U.sheet(
      t.name,
      '<p class="sheet-copy">' +
        t.days.length +
        " training days. These routines will be added to your library.</p>" +
        t.workouts
          .map(
            (w, i) =>
              '<div class="routine"><h3>' +
              esc(w[0]) +
              "</h3><small>" +
              t.days[i] +
              " · " +
              w[1].length +
              " exercises</small><p>" +
              esc(w[1].map((s) => s[0][0]).join(", ")) +
              "</p></div>",
          )
          .join(""),
      {
        footer: button(
          "Add " + t.workouts.length + " routines",
          "templateApply",
          id,
          "btn primary full",
        ),
      },
    );
  }
  async function templateApply(id) {
    const t = START_NOW_ROUTINES.splits[id],
      rows = SN.workouts(),
      conflicts = rows.some((w) => w.days.some((d) => t.days.includes(d)));
    if (
      conflicts &&
      !(await U.confirm(
        "Replace this week’s schedule?",
        "Your current routines will stay saved. The new split will take their scheduled days.",
        "Use split",
      ))
    )
      return;
    const stamp = Date.now(),
      avoid = (SN.profile()?.avoid || "")
        .toLowerCase()
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
    const added = t.workouts.map((w, i) => ({
      id: "split-" + id + "-" + stamp + "-" + i,
      name: w[0],
      days: [t.days[i]],
      createdAt: stamp,
      splitGenerated: true,
      exercises: w[1]
        .map(([names, muscle, sets, min, max]) => {
          const base =
            names
              .map((name) =>
                exerciseLibrary.find(
                  (e) => e.name.toLowerCase() === name.toLowerCase(),
                ),
              )
              .find(Boolean) ||
            exerciseLibrary.find((e) => e.muscle === muscle);
          return { ...base, sets, reps: max, repMin: min, repMax: max };
        })
        .filter((e) => !avoid.some((x) => e.name.toLowerCase().includes(x))),
    }));
    if (added.some((w) => !w.exercises.length)) {
      showToast(
        "Your avoid list removes every exercise in a routine. Update your training preferences first.",
      );
      return;
    }
    if (
      SN.saveWorkouts([
        ...rows.map((w) => ({
          ...w,
          days: w.days.filter((d) => !t.days.includes(d)),
          updatedAt: w.days.some((d) => t.days.includes(d))
            ? stamp
            : w.updatedAt,
        })),
        ...added,
      ])
    ) {
      U.closeSheet();
      U.go("home");
      showToast(t.name + " added.");
    }
  }
  function schedule() {
    const rows = SN.workouts();
    if (!rows.length) {
      U.sheet(
        "Weekly schedule",
        empty(
          "Create a routine first",
          "Your saved routines can be assigned to any day.",
          "Create a routine",
          "newRoutine",
          "calendar",
        ),
      );
      return;
    }
    const map = SN.scheduleMap(),
      m = U.sheet(
        "Weekly schedule",
        '<p class="sheet-copy">Assign a routine or leave a day for recovery.</p>' +
          SN.dayOrder
            .map(
              (day) =>
                '<div class="schedule-row"><label for="day-' +
                day +
                '">' +
                day +
                '</label><select id="day-' +
                day +
                '" data-day="' +
                day +
                '"><option value="">Rest day</option>' +
                rows
                  .map(
                    (w) =>
                      '<option value="' +
                      esc(w.id) +
                      '" ' +
                      (map.get(day)?.id === w.id ? "selected" : "") +
                      ">" +
                      esc(w.name) +
                      "</option>",
                  )
                  .join("") +
                "</select></div>",
            )
            .join(""),
        {
          footer:
            '<button class="btn primary full" id="scheduleSave">Save schedule</button>',
        },
      );
    m.querySelector("#scheduleSave").onclick = () => {
      const next = rows.map((w) => ({
        ...w,
        days: [...m.querySelectorAll("select")]
          .filter((s) => s.value === w.id)
          .map((s) => s.dataset.day),
        updatedAt: Date.now(),
      }));
      if (SN.saveWorkouts(next)) {
        U.closeSheet();
        U.render();
        showToast("Schedule saved.");
      }
    };
  }
  const groups = {
    "Upper body": [
      "Chest",
      "Back",
      "Shoulders",
      "Rear Delts",
      "Biceps",
      "Triceps",
      "Traps",
    ],
    "Lower body": ["Quads", "Hamstrings", "Glutes", "Calves", "Legs"],
    Push: ["Chest", "Shoulders", "Triceps"],
    Pull: ["Back", "Rear Delts", "Biceps", "Traps"],
    Legs: ["Quads", "Hamstrings", "Glutes", "Calves", "Legs"],
  };
  function generate() {
    const focus =
      generator.focus === "Surprise me"
        ? ["Full body", ...Object.keys(groups)][Math.floor(Math.random() * 7)]
        : generator.focus;
    const avoid = (SN.profile()?.avoid || "")
      .toLowerCase()
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const items = exerciseLibrary.filter((ex) => {
      const eq = SN.equipment(ex),
        name = ex.name.toLowerCase();
      return (
        (!groups[focus] || groups[focus].includes(SN.meta(ex).primary)) &&
        (generator.equipment === "Full gym" ||
          (generator.equipment === "Machines"
            ? /Machine|Cable/.test(eq)
            : generator.equipment === "Dumbbells"
              ? eq === "Dumbbell"
              : eq === "Bodyweight")) &&
        !avoid.some((a) => name.includes(a))
      );
    });
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const chosen = [],
      seen = new Set(),
      limit =
        generator.minutes === 15
          ? 3
          : generator.minutes === 30
            ? 4
            : generator.minutes === 45
              ? 5
              : 6;
    function add(ex) {
      if (ex && !seen.has(ex.id) && chosen.length < limit) {
        chosen.push(ex);
        seen.add(ex.id);
      }
    }
    if (focus === "Full body") {
      [["Chest", "Shoulders"], ["Back"], ["Quads", "Glutes", "Legs"]].forEach(
        (bucket) =>
          add(shuffled.find((e) => bucket.includes(SN.meta(e).primary))),
      );
    } else
      [...new Set(shuffled.map((e) => SN.meta(e).primary))].forEach((m) =>
        add(shuffled.find((e) => SN.meta(e).primary === m)),
      );
    shuffled.forEach(add);
    generated = {
      id: "quick-generated-" + Date.now(),
      name: focus + " workout",
      days: [],
      exercises: chosen.map((e) => ({
        ...e,
        sets: generator.minutes === 15 ? 2 : 3,
        repMin: SN.repRange(e).min,
        repMax: SN.repRange(e).max,
      })),
    };
  }
  function generatorSheet() {
    const select = (label, id, values, value) =>
      '<label class="field">' +
      label +
      '<select id="' +
      id +
      '" aria-label="' +
      esc(label) +
      '">' +
      values
        .map(
          (x) =>
            "<option " +
            (String(x) === String(value) ? "selected" : "") +
            ">" +
            esc(x) +
            "</option>",
        )
        .join("") +
      "</select></label>";
    const m = U.sheet(
      "Generate a workout",
      select(
        "Time · minutes",
        "generateTime",
        [15, 30, 45, 60],
        generator.minutes,
      ) +
        select(
          "Focus",
          "generateFocus",
          ["Full body", ...Object.keys(groups), "Surprise me"],
          generator.focus,
        ) +
        select(
          "Equipment",
          "generateEquipment",
          ["Full gym", "Machines", "Dumbbells", "Bodyweight"],
          generator.equipment,
        ) +
        button("Generate workout", "generateNow", "", "btn primary full") +
        (generated
          ? section(
              generated.name,
              generated.exercises.length
                ? generated.exercises
                    .map((e) =>
                      U.exerciseRow(
                        e,
                        "detail",
                        e.id,
                        "<small>" +
                          e.sets +
                          " × " +
                          SN.repLabel(e) +
                          "</small>",
                      ),
                    )
                    .join("") +
                    button(
                      "Use this workout",
                      "useGenerated",
                      "",
                      "btn soft full",
                    )
                : empty(
                    "No exercises match",
                    "Try different equipment or update your avoided exercises.",
                  ),
            )
          : ""),
    );
    m.querySelector("#generateTime").onchange = (e) =>
      (generator.minutes = +e.target.value);
    m.querySelector("#generateFocus").onchange = (e) =>
      (generator.focus = e.target.value);
    m.querySelector("#generateEquipment").onchange = (e) =>
      (generator.equipment = e.target.value);
  }
  Object.assign(U.actions, {
    newRoutine: () => edit(),
    editRoutine: (_, b) =>
      edit(SN.workouts().find((w) => w.id === b.dataset.value)),
    saveRoutine: save,
    routineDetail: (_, b) => routineDetail(b.dataset.value),
    routineOptions: (_, b) =>
      U.sheet(
        "Routine options",
        menu("Edit routine", "", "edit", "editRoutine", b.dataset.value) +
          menu(
            "Duplicate routine",
            "",
            "book",
            "duplicateRoutine",
            b.dataset.value,
          ) +
          menu("Delete routine", "", "trash", "deleteRoutine", b.dataset.value),
      ),
    duplicateRoutine: (_, b) => {
      const w = SN.workouts().find((w) => w.id === b.dataset.value);
      edit({
        ...w,
        id: "routine-" + Date.now(),
        name: w.name + " copy",
        days: [],
      });
    },
    deleteRoutine: async (_, b) => {
      if (
        await U.confirm(
          "Delete routine?",
          "This routine will be removed from your library and schedule. Completed workouts stay in History.",
          "Delete routine",
          true,
        )
      ) {
        if (SN.deleteWorkout(b.dataset.value)) {
          U.render();
          showToast("Routine deleted.");
        }
      }
    },
    draftDay: (_, b) => {
      const d = b.dataset.value;
      draft.days = draft.days.includes(d)
        ? draft.days.filter((x) => x !== d)
        : [...draft.days, d];
      b.classList.toggle("selected");
      b.setAttribute("aria-pressed", draft.days.includes(d));
    },
    draftAdd: () =>
      U.picker({
        onSelect: (list) => {
          draft.exercises.push(...list.map((e) => SN.normalizeExercise(e)));
          editor();
        },
      }),
    draftRemove: (_, b) => {
      draft.exercises.splice(+b.dataset.value, 1);
      editor();
    },
    draftMove: (_, b) => {
      const [i, d] = b.dataset.value.split(":").map(Number),
        j = i + d;
      if (j < 0 || j >= draft.exercises.length) return;
      [draft.exercises[i], draft.exercises[j]] = [
        draft.exercises[j],
        draft.exercises[i],
      ];
      editor();
    },
    templates,
    templatePreview: (_, b) => templatePreview(b.dataset.value),
    templateApply: (_, b) => templateApply(b.dataset.value),
    schedule,
    generator: () => {
      generated = null;
      generatorSheet();
    },
    generateNow: () => {
      generate();
      generatorSheet();
    },
    useGenerated: () => {
      if (generated?.exercises.length) startWorkout(generated);
    },
    saveSessionRoutine: (_, b) => {
      const s = SN.sessions().find((x) => x.id === b.dataset.value);
      if (!s) return;
      edit({
        id: "routine-" + Date.now(),
        name: s.workoutName,
        days: [],
        exercises: s.exercises
          .filter((e) => e.completedSets)
          .map((e) => ({
            ...e,
            sets: e.completedSets,
            repMin: SN.repRange(e).min,
            repMax: SN.repRange(e).max,
          })),
      });
    },
  });
  U.routes.builder = editor;
  Object.assign(Pages, {
    draftDirty: () => draft && JSON.stringify(draft) !== draftOriginal,
    clearDraft: () => (draft = null),
  });
})();
