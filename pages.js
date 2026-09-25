/* Primary destinations and shared exercise/history presentation. */
(() => {
  const SN = SN36,
    U = UI,
    { esc, icon, button, iconButton, header, section, empty, menu } = U;
  let library = { query: "", muscle: "", equipment: "" },
    historyMode = "list",
    calendarDate = new Date(),
    calendarSelected = SN.dayKey(Date.now()),
    progressDays = 30;
  function weeklyStrip() {
    const start = new Date();
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    const done = new Set(SN.sessions().map((s) => SN.dayKey(s.timestamp)));
    return (
      '<div class="week-strip">' +
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const key = SN.dayKey(d),
          isToday = key === SN.dayKey(Date.now());
        return (
          '<button class="week-day ' +
          (isToday ? "today " : "") +
          (done.has(key) ? "done" : "") +
          '" ' +
          U.attr("calendarDay", key) +
          ' aria-label="' +
          esc(SN.formatDate(d)) +
          (done.has(key) ? ", workout completed" : "") +
          '"><span>' +
          d.toLocaleDateString(undefined, { weekday: "narrow" }) +
          "</span><strong>" +
          d.getDate() +
          "</strong>" +
          (SN.scheduledWorkout(SN.days[d.getDay()]) ? "<i></i>" : "") +
          "</button>"
        );
      }).join("") +
      "</div>"
    );
  }
  function routine(w) {
    const prev = SN.previousWorkout(w),
      count = w.exercises.length,
      focus = [...new Set(w.exercises.map((e) => SN.meta(e).primary))]
        .slice(0, 3)
        .join(", ");
    return (
      '<article class="routine"><div class="routine-head"><button ' +
      U.attr("routineDetail", w.id) +
      "><h3>" +
      esc(w.name) +
      "</h3><small>" +
      count +
      " exercises" +
      (focus ? " · " + esc(focus) : "") +
      "</small></button>" +
      iconButton("more", "Options for " + w.name, "routineOptions", w.id) +
      "</div>" +
      '<div class="routine-exercises">' +
      w.exercises.slice(0, 5).map(U.thumb).join("") +
      (count > 5 ? "<small> +" + (count - 5) + "</small>" : "") +
      "</div><p>" +
      esc(
        w.exercises
          .slice(0, 3)
          .map((e) => e.name)
          .join(", "),
      ) +
      (count > 3 ? "…" : "") +
      "</p>" +
      '<div class="routine-foot"><small>' +
      (prev
        ? "Last trained " + SN.formatShortDate(prev.timestamp)
        : w.days.length
          ? w.days.map((d) => d.slice(0, 3)).join(" · ")
          : "Not trained yet") +
      "</small>" +
      button("Start routine", "startRoutine", w.id, "btn soft small") +
      "</div></article>"
    );
  }
  function home() {
    const workouts = SN.workouts(),
      today = SN.scheduledWorkout();
    app.innerHTML =
      header(
        "Workout",
        iconButton("calendar", "Weekly schedule", "schedule"),
        false,
        new Date().toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        }),
      ) +
      '<div class="quick-start">' +
      (SN.active
        ? button(
            icon("play") + " Resume workout",
            "go",
            "activeWorkout",
            "btn primary full",
          ) +
          '<p class="meta active-context">' +
          esc(SN.active.workoutName) +
          " · Workout in progress</p>"
        : button(
            icon("plus") + " Start empty workout",
            "startEmpty",
            "",
            "btn primary full",
          )) +
      "</div>" +
      (workouts.some((w) => w.days.length) ? weeklyStrip() : "") +
      (today
        ? '<section class="today-plan"><span class="label">Today’s routine</span><h2>' +
          esc(today.name) +
          '</h2><p class="meta">' +
          today.exercises.length +
          " exercises · " +
          today.exercises.reduce((a, e) => a + e.sets, 0) +
          " sets</p>" +
          button(
            icon("play") + " Start workout",
            "startRoutine",
            today.id,
            "btn soft full",
          ) +
          "</section>"
        : workouts.some((w) => w.days.length)
          ? '<div class="rest-line">' +
            icon("moon") +
            '<div><strong>Rest day</strong><p class="meta">Your next session can wait. Make time to recover.</p></div>' +
            iconButton("chevron", "Recovery plan", "recovery") +
            "</div>"
          : "") +
      section(
        "My routines",
        workouts.length
          ? workouts.map(routine).join("")
          : empty(
              "Your routines start here",
              "Save a routine to reuse your exercises, sets, and rep targets.",
              "Create a routine",
              "newRoutine",
            ),
        button(icon("plus") + " New", "newRoutine", "", "text-btn"),
      ) +
      section(
        "Explore",
        menu(
          "Routine library",
          "Choose a training split",
          "book",
          "templates",
        ) +
          menu(
            "Generate a workout",
            "Choose your time, focus, and equipment",
            "shuffle",
            "generator",
          ),
      );
  }
  function historyRow(s) {
    return (
      '<button class="history-row" ' +
      U.attr("session", s.id) +
      "><small>" +
      esc(
        new Date(s.timestamp).toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
      ) +
      "</small><h3>" +
      esc(s.workoutName) +
      '</h3><div class="history-metrics"><span>' +
      icon("clock") +
      SN.num(s.durationMinutes) +
      " min</span><span>" +
      icon("dumbbell") +
      Math.round(s.volume).toLocaleString() +
      " lb</span><span>" +
      icon("check") +
      s.completedSets +
      ' sets</span></div><p class="history-preview">' +
      esc(
        s.exercises
          .filter((e) => e.completedSets)
          .slice(0, 3)
          .map((e) => e.completedSets + " × " + e.name)
          .join(" · "),
      ) +
      "</p></button>"
    );
  }
  function calendar() {
    const year = calendarDate.getFullYear(),
      month = calendarDate.getMonth(),
      offset = (new Date(year, month, 1).getDay() + 6) % 7,
      days = new Date(year, month + 1, 0).getDate(),
      sessions = SN.sessions();
    const done = new Set(sessions.map((s) => SN.dayKey(s.timestamp)));
    return (
      '<div class="calendar-head">' +
      iconButton("back", "Previous month", "calendarMonth", -1) +
      "<h2>" +
      calendarDate.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      }) +
      "</h2>" +
      iconButton("chevron", "Next month", "calendarMonth", 1) +
      '</div><div class="calendar-grid">' +
      ["M", "T", "W", "T", "F", "S", "S"]
        .map((d) => "<span>" + d + "</span>")
        .join("") +
      Array.from({ length: offset }, () => "<span></span>").join("") +
      Array.from({ length: days }, (_, i) => {
        const d = new Date(year, month, i + 1),
          key = SN.dayKey(d);
        return (
          '<button class="' +
          (done.has(key) ? "logged " : "") +
          (key === calendarSelected ? "selected " : "") +
          (key === SN.dayKey(Date.now()) ? "today" : "") +
          '" ' +
          U.attr("selectDate", key) +
          ' aria-label="' +
          esc(SN.formatDate(d)) +
          (done.has(key) ? ", workout completed" : "") +
          '">' +
          (i + 1) +
          "</button>"
        );
      }).join("") +
      "</div>" +
      section(
        SN.formatDate(new Date(calendarSelected + "T12:00:00")),
        sessions
          .filter((s) => SN.dayKey(s.timestamp) === calendarSelected)
          .map(historyRow)
          .join("") || '<p class="meta">No workouts logged on this day.</p>',
      )
    );
  }
  function historyPage() {
    const sessions = [...SN.sessions()].reverse();
    let lastMonth = "";
    const list = sessions
      .map((s) => {
        const month = new Date(s.timestamp).toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
          }),
          heading =
            month !== lastMonth
              ? '<div class="section-head section"><h2>' + month + "</h2></div>"
              : "";
        lastMonth = month;
        return heading + historyRow(s);
      })
      .join("");
    app.innerHTML =
      header(
        "History",
        "",
        false,
        sessions.length +
          " " +
          (sessions.length === 1 ? "workout" : "workouts") +
          " logged",
      ) +
      '<div class="segmented" aria-label="History view">' +
      ["list", "calendar"]
        .map(
          (mode) =>
            "<button " +
            U.attr("historyMode", mode) +
            ' class="' +
            (historyMode === mode ? "active" : "") +
            '" aria-pressed="' +
            (historyMode === mode) +
            '">' +
            (mode === "list" ? "Workouts" : "Calendar") +
            "</button>",
        )
        .join("") +
      "</div>" +
      (historyMode === "calendar"
        ? calendar()
        : sessions.length
          ? list
          : empty(
              "Your first workout goes here",
              "Finish a workout to see your exercises, sets, and personal records.",
              "Start a workout",
              "startEmpty",
              "history",
            ));
  }
  function sessionPage() {
    const s = SN.sessions().find((x) => x.id === state.sessionId);
    if (!s) {
      U.go("history");
      return;
    }
    app.innerHTML =
      header(
        s.workoutName,
        iconButton("more", "Workout options", "sessionOptions", s.id),
        true,
        SN.formatDate(s.timestamp),
      ) +
      Workout.reviewMetrics(s) +
      s.exercises
        .map(
          (ex) =>
            '<section class="section">' +
            U.exerciseRow(ex, "detail", SN.exerciseId(ex), "") +
            (ex.note
              ? '<p class="previous-note">' + esc(ex.note) + "</p>"
              : "") +
            '<div class="set-grid set-head"><span>SET</span><span>WEIGHT</span><span>REPS</span><span></span><span></span></div>' +
            ex.sets
              .map(
                (set, i) =>
                  '<div class="set-grid"><span>' +
                  (i + 1) +
                  "</span><strong>" +
                  SN.round1(set.weight) +
                  " lb</strong><strong>" +
                  set.reps +
                  '</strong><span></span><span class="' +
                  (set.done ? "accent" : "muted") +
                  '">' +
                  (set.done ? icon("check") : "—") +
                  "</span></div>",
              )
              .join("") +
            "</section>",
        )
        .join("") +
      section(
        "Session grade",
        "<strong>" +
          esc(s.gradeLetter || SN.gradeLetter(s.grade)) +
          " · " +
          SN.num(s.grade) +
          '/100</strong><p class="meta">Completed sets, rep targets, and consistency.</p>',
      ) +
      '<div class="section">' +
      button("Repeat workout", "repeatSession", s.id, "btn primary full") +
      "</div>";
  }
  function libraryPage() {
    app.innerHTML =
      header("Exercises", "", false, exerciseLibrary.length + " exercises") +
      '<label class="search">' +
      icon("search") +
      '<input id="exerciseSearch" type="search" placeholder="Search exercises" aria-label="Search exercises" value="' +
      esc(library.query) +
      '"></label><div class="filters"><select id="muscleFilter" aria-label="Filter by muscle"><option value="">All muscles</option>' +
      [...new Set(exerciseLibrary.map((e) => SN.meta(e).primary))]
        .sort()
        .map(
          (x) =>
            "<option " +
            (library.muscle === x ? "selected" : "") +
            ">" +
            esc(x) +
            "</option>",
        )
        .join("") +
      '</select><select id="equipmentFilter" aria-label="Filter by equipment"><option value="">All equipment</option>' +
      [...new Set(exerciseLibrary.map(SN.equipment))]
        .sort()
        .map(
          (x) =>
            "<option " +
            (library.equipment === x ? "selected" : "") +
            ">" +
            esc(x) +
            "</option>",
        )
        .join("") +
      '</select></div><div id="libraryResults"></div>';
    const update = () => {
      const q = library.query.toLowerCase(),
        list = exerciseLibrary.filter(
          (e) =>
            (!q ||
              (e.name + " " + e.muscle + " " + SN.equipment(e))
                .toLowerCase()
                .includes(q)) &&
            (!library.muscle || SN.meta(e).primary === library.muscle) &&
            (!library.equipment || SN.equipment(e) === library.equipment),
        );
      document.getElementById("libraryResults").innerHTML =
        '<p class="results-count" role="status">' +
        list.length +
        " results</p>" +
        (list.length
          ? list.map((e) => U.exerciseRow(e)).join("")
          : empty(
              "No matching exercises",
              "Try another search or clear your filters.",
              "Clear filters",
              "clearFilters",
              "search",
            ));
    };
    document.getElementById("exerciseSearch").oninput = (e) => {
      library.query = e.target.value;
      update();
    };
    document.getElementById("muscleFilter").onchange = (e) => {
      library.muscle = e.target.value;
      update();
    };
    document.getElementById("equipmentFilter").onchange = (e) => {
      library.equipment = e.target.value;
      update();
    };
    update();
  }
  function detail(id) {
    const ex =
      exerciseLibrary.find((e) => SN.exerciseId(e) === id) ||
      SN.sessions()
        .flatMap((s) => s.exercises)
        .find((e) => SN.exerciseId(e) === id);
    if (!ex) return;
    const entry = U.mediaEntry(ex),
      m = SN.meta(ex);
    U.sheet(
      ex.name,
      (entry?.media
        ? '<div class="detail-media">' +
          entry.media
            .map(
              (src, i) =>
                '<img src="' +
                esc(typeof src === "string" ? src : src.url) +
                '" alt="' +
                esc(entry.sourceExerciseName || ex.name) +
                " " +
                (i === 0 ? "starting" : "finishing") +
                ' position" width="220" height="180">',
            )
            .join("") +
          '</div><p class="meta">' +
          esc(entry.mediaLabel || "Exercise demonstration") +
          " · " +
          esc(entry.source || "Free Exercise DB") +
          "</p>" +
          (entry.matchType === "related-photographic-guide"
            ? '<p class="meta">Related movement shown: ' +
              esc(entry.sourceExerciseName) +
              ". Follow the instructions for this exercise below.</p>"
            : "")
        : "") +
        '<div class="detail-meta"><span>' +
        esc(m.primary) +
        "</span><span>" +
        esc(m.equipment) +
        '</span></div><div class="detail-block"><h3>How to perform</h3><p>' +
        esc(ex.cue || m.instructions) +
        '</p></div><div class="detail-block"><h3>Muscles worked</h3><p>' +
        esc(m.primary) +
        (m.secondary.length ? " · " + esc(m.secondary.join(", ")) : "") +
        '</p></div><div class="detail-block"><h3>Keep in mind</h3><ul>' +
        SN.mistakes(ex)
          .map((x) => "<li>" + esc(x) + "</li>")
          .join("") +
        "</ul></div>",
      {
        footer: button(
          "View exercise history",
          "exerciseHistory",
          id,
          "btn soft full",
        ),
      },
    );
  }
  function barChart(values, label) {
    const max = Math.max(1, ...values.map((v) => v.value));
    return (
      '<div class="chart" role="img" aria-label="' +
      esc(
        label + ": " + values.map((v) => v.label + " " + v.value).join(", "),
      ) +
      '">' +
      values
        .map(
          (v) =>
            '<div class="chart-col"><strong>' +
            esc(v.value >= 10000 ? Math.round(v.value / 1000) + "k" : v.value) +
            '</strong><div class="bar" style="height:' +
            Math.max(2, (v.value / max) * 110) +
            'px"></div><small>' +
            esc(v.label) +
            "</small></div>",
        )
        .join("") +
      "</div>"
    );
  }
  function progress() {
    const all = SN.sessions(),
      rows = all.filter(
        (s) => s.timestamp >= Date.now() - progressDays * 86400000,
      ),
      summary = SN.summary(rows);
    const exercises = [
      ...new Map(
        [...all]
          .reverse()
          .flatMap((s) => s.exercises.filter((e) => e.completedSets))
          .map((e) => [SN.exerciseId(e), e]),
      ).values(),
    ];
    const weekly = Array.from({ length: 6 }, (_, i) => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - (5 - i) * 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      return {
        label: start.toLocaleDateString(undefined, {
          month: "numeric",
          day: "numeric",
        }),
        value: all.filter((s) => s.timestamp >= +start && s.timestamp < +end)
          .length,
      };
    });
    app.innerHTML =
      header("Progress") +
      '<div class="segmented" aria-label="Progress period">' +
      [7, 30, 90]
        .map(
          (n) =>
            "<button " +
            U.attr("progressPeriod", n) +
            ' class="' +
            (n === progressDays ? "active" : "") +
            '" aria-pressed="' +
            (n === progressDays) +
            '">' +
            n +
            " days</button>",
        )
        .join("") +
      "</div>" +
      (all.length
        ? '<div class="metric-pair"><div><strong>' +
          summary.workouts +
          "</strong><small>Workouts</small></div><div><strong>" +
          summary.volume.toLocaleString() +
          "</strong><small>Volume · lb</small></div><div><strong>" +
          summary.completedSets +
          "</strong><small>Sets</small></div></div>" +
          (!rows.length
            ? '<p class="meta">No workouts in the selected period.</p>'
            : "") +
          section(
            "Workout consistency",
            '<p class="meta">Workouts per week · last 6 weeks</p>' +
              barChart(weekly, "Workouts per week"),
          ) +
          section(
            "Sets by muscle",
            '<p class="meta">Primary muscles · last ' +
              progressDays +
              " days</p>" +
              summary.muscles
                .filter((m) => m.primarySets)
                .slice(0, 8)
                .map(
                  (m) =>
                    '<div class="muscle-row"><span>' +
                    esc(m.muscle) +
                    '</span><div class="muscle-track"><i style="width:' +
                    Math.round(
                      (m.primarySets /
                        Math.max(
                          1,
                          ...summary.muscles.map((x) => x.primarySets),
                        )) *
                        100,
                    ) +
                    '%"></i></div><strong>' +
                    m.primarySets +
                    "</strong></div>",
                )
                .join(""),
          ) +
          section(
            "Exercise performance",
            exercises
              .map((e) => U.exerciseRow(e, "exerciseHistory", SN.exerciseId(e)))
              .join(""),
          )
        : empty(
            "Build your baseline",
            "Log your first workout to start tracking consistency and exercise performance.",
            "Start a workout",
            "startEmpty",
            "chart",
          ));
  }
  function exerciseHistory() {
    const ex =
      exerciseLibrary.find(
        (e) => SN.exerciseId(e) === state.exerciseHistoryId,
      ) ||
      SN.sessions()
        .flatMap((s) => s.exercises)
        .find((e) => SN.exerciseId(e) === state.exerciseHistoryId);
    if (!ex) {
      U.go("progress");
      return;
    }
    const entries = SN.exerciseHistory(ex).map((s) => ({
        s,
        ex: s.exercises.find((e) => SN.exerciseMatches(e, ex)),
      })),
      best = Math.max(
        0,
        ...entries.flatMap((e) =>
          e.ex.sets.filter((s) => s.done).map((s) => s.weight),
        ),
      );
    app.innerHTML =
      header(
        ex.name,
        iconButton(
          "book",
          "Exercise instructions",
          "detail",
          SN.exerciseId(ex),
        ),
        true,
        "Exercise performance",
      ) +
      (entries.length
        ? '<div class="metric-pair"><div><strong>' +
          best +
          "<small> lb</small></strong><small>Heaviest weight</small></div><div><strong>" +
          entries.length +
          "</strong><small>Workouts</small></div></div>" +
          section(
            "Volume per workout",
            '<p class="meta">Total weight × reps · lb</p>' +
              barChart(
                entries
                  .slice(0, 6)
                  .reverse()
                  .map((e) => ({
                    label: new Date(e.s.timestamp).toLocaleDateString(
                      undefined,
                      { month: "numeric", day: "numeric" },
                    ),
                    value: e.ex.volume,
                  })),
                "Volume in pounds",
              ),
          ) +
          section(
            "Logged sets",
            entries
              .map(
                (e) =>
                  '<button class="history-row" ' +
                  U.attr("session", e.s.id) +
                  "><small>" +
                  SN.formatDate(e.s.timestamp) +
                  "</small><h3>" +
                  esc(e.s.workoutName) +
                  '</h3><p class="history-preview">' +
                  esc(SN.formatSets(e.ex)) +
                  "</p>" +
                  (e.ex.note
                    ? '<p class="previous-note">' + esc(e.ex.note) + "</p>"
                    : "") +
                  "</button>",
              )
              .join(""),
          )
        : empty(
            "No history yet",
            "Complete a set of " + ex.name + " to see your performance here.",
            "",
            "",
            "chart",
          ));
  }
  Object.assign(U.routes, {
    home,
    history: historyPage,
    calendar: historyPage,
    session: sessionPage,
    exerciseLibrary: libraryPage,
    progress,
    exerciseHistory,
  });
  Object.assign(U.actions, {
    detail: (_, b) => detail(b.dataset.value),
    clearFilters: () => {
      library = { query: "", muscle: "", equipment: "" };
      libraryPage();
    },
    historyMode: (_, b) => {
      historyMode = b.dataset.value;
      historyPage();
    },
    calendarMonth: (_, b) => {
      calendarDate = new Date(
        calendarDate.getFullYear(),
        calendarDate.getMonth() + Number(b.dataset.value),
        1,
      );
      historyPage();
    },
    selectDate: (_, b) => {
      calendarSelected = b.dataset.value;
      historyPage();
    },
    calendarDay: (_, b) => {
      calendarSelected = b.dataset.value;
      calendarDate = new Date(calendarSelected + "T12:00:00");
      historyMode = "calendar";
      U.go("history");
    },
    session: (_, b) => {
      state.sessionId = b.dataset.value;
      U.go("session");
    },
    progressPeriod: (_, b) => {
      progressDays = +b.dataset.value;
      progress();
    },
    exerciseHistory: (_, b) => {
      state.exerciseHistoryId = b.dataset.value;
      U.go("exerciseHistory");
    },
    sessionOptions: (_, b) =>
      U.sheet(
        "Workout options",
        menu("Rename workout", "", "edit", "renameSession", b.dataset.value) +
          menu("Edit logged sets", "", "edit", "editSession", b.dataset.value) +
          menu(
            "Save as routine",
            "",
            "book",
            "saveSessionRoutine",
            b.dataset.value,
          ) +
          menu("Delete workout", "", "trash", "deleteSession", b.dataset.value),
      ),
    renameSession: (_, b) => {
      const s = SN.sessions().find((x) => x.id === b.dataset.value),
        m = U.sheet(
          "Rename workout",
          '<label class="field">Workout name<input id="sessionName" maxlength="80" value="' +
            esc(s.workoutName) +
            '"></label>',
          {
            footer:
              '<button class="btn primary full" id="sessionNameSave">Save</button>',
          },
        );
      m.querySelector("#sessionNameSave").onclick = () => {
        const name = m.querySelector("input").value.trim();
        if (!name) return showToast("Enter a name.");
        if (SN.updateSession(s.id, { workoutName: name })) {
          U.closeSheet();
          sessionPage();
        }
      };
    },
    deleteSession: async (_, b) => {
      if (
        await U.confirm(
          "Delete workout?",
          "This workout and its logged sets will be removed from your history and progress.",
          "Delete workout",
          true,
        )
      ) {
        if (SN.deleteSession(b.dataset.value)) {
          U.go("history");
          showToast("Workout deleted.");
        }
      }
    },
    repeatSession: (_, b) => {
      const s = SN.sessions().find((x) => x.id === b.dataset.value);
      startWorkout({
        id: s.workoutId,
        name: s.workoutName,
        days: [],
        exercises: s.exercises
          .filter((e) => e.completedSets)
          .map((e) => ({ ...e, sets: e.completedSets })),
      });
    },
    recovery: () =>
      U.sheet(
        "Recovery day",
        '<p class="sheet-copy">Give your muscles time between sessions.</p>' +
          menu(
            "Easy movement",
            "A comfortable walk or gentle mobility.",
            "moon",
            "closeSheet",
          ) +
          menu(
            "Sleep and recovery",
            "Make room for a full night’s rest.",
            "clock",
            "closeSheet",
          ) +
          menu(
            "Your next session",
            "Check your weekly schedule.",
            "calendar",
            "schedule",
          ),
      ),
    editSession: (_, b) => {
      const s = cloneWorkout(
          SN.sessions().find((x) => x.id === b.dataset.value),
        ),
        m = U.sheet(
          "Edit logged sets",
          s.exercises
            .map(
              (ex, i) =>
                '<div class="section"><h3>' +
                esc(ex.name) +
                "</h3>" +
                ex.sets
                  .map(
                    (set, j) =>
                      '<div class="prescriptions"><label>Weight · lb<input type="number" min="0" step="any" data-edit-weight="' +
                      i +
                      ":" +
                      j +
                      '" value="' +
                      set.weight +
                      '"></label><label>Reps<input type="number" min="1" max="999" data-edit-reps="' +
                      i +
                      ":" +
                      j +
                      '" value="' +
                      set.reps +
                      '"></label><label>Completed<input type="checkbox" data-edit-done="' +
                      i +
                      ":" +
                      j +
                      '" ' +
                      (set.done ? "checked" : "") +
                      "></label></div>",
                  )
                  .join("") +
                "</div>",
            )
            .join(""),
          {
            footer:
              '<button id="historySave" class="btn primary full">Save changes</button>',
          },
        );
      m.querySelector("#historySave").onclick = () => {
        let valid = true;
        m.querySelectorAll("input").forEach((input) => {
          const key = Object.keys(input.dataset)[0],
            [i, j] = input.dataset[key].split(":").map(Number),
            field = key.replace("edit", "").toLowerCase();
          const value = field === "done" ? input.checked : Number(input.value);
          if (
            field !== "done" &&
            (!Number.isFinite(value) ||
              value < 0 ||
              (field === "reps" && (!Number.isInteger(value) || value > 999)))
          )
            valid = false;
          s.exercises[i].sets[j][field] = value;
        });
        if (
          s.exercises.some((ex) =>
            ex.sets.some(
              (set) => set.done && (set.reps < 1 || set.weight > 9999),
            ),
          )
        )
          valid = false;
        if (!valid) return showToast("Check your weights and reps.");
        const normalized = SN.normalizeSession(s),
          grade = SN.calculateGrade(normalized);
        if (
          SN.updateSession(s.id, {
            exercises: s.exercises,
            grade: grade.score,
            gradeLetter: grade.letter,
            gradeBreakdown: grade,
            prs: SN.detectPRs(
              normalized,
              SN.sessions().filter(
                (x) => x.id !== s.id && x.timestamp < s.timestamp,
              ),
            ),
          })
        ) {
          U.closeSheet();
          sessionPage();
          showToast("Workout updated.");
        }
      };
    },
  });
  SN.openExerciseHistory = (id) => {
    state.exerciseHistoryId = id;
    U.go("exerciseHistory");
  };
  SN.openExerciseDetail = (ex) => detail(SN.exerciseId(ex));
  window.Pages = { routine, historyRow };
})();
