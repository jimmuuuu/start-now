/* Shared view primitives, navigation, dialogs and exercise picker. */
(() => {
  const SN = window.SN36,
    esc = escapeHtml;
  const paths = {
    dumbbell:
      '<path d="m6 6 12 12M4 9 9 4M15 20l5-5M2 7l5-5M17 22l5-5M5 12l7-7M12 19l7-7"/>',
    history: '<path d="M3 11a9 9 0 1 1 2.6 7.4M3 4v7h7M12 7v5l3 2"/>',
    book: '<path d="M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H4zM13 7a3 3 0 0 1 3-3h5v15h-4a4 4 0 0 0-4 2"/>',
    chart: '<path d="M4 3v17h17M7 14l4-4 4 2 6-7"/>',
    user: '<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    chevron: '<path d="m9 5 7 7-7 7"/>',
    back: '<path d="m14 5-7 7 7 7"/>',
    down: '<path d="m5 9 7 7 7-7"/>',
    up: '<path d="m5 15 7-7 7 7"/>',
    x: '<path d="m6 6 12 12M6 18 18 6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    play: '<path d="m8 4 12 8-12 8z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    timer:
      '<circle cx="12" cy="14" r="8"/><path d="M9 2h6M12 6V2M12 10v5M18 6l2-2"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    calendar:
      '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 11h18"/>',
    settings:
      '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
    trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
    edit: '<path d="m15 4 5 5M4 20l5-1L21 7l-5-5L4 14z"/>',
    shuffle:
      '<path d="M3 6h3l12 12h3M17 14l4 4-4 4M3 18h3l4-4M14 10l4-4h3M17 2l4 4-4 4"/>',
    award: '<circle cx="12" cy="8" r="5"/><path d="m8 12-2 10 6-3 6 3-2-10"/>',
    moon: '<path d="M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10Z"/>',
    cloud:
      '<path d="M6 19a5 5 0 0 1-1-10 7 7 0 0 1 13-1 5.5 5.5 0 0 1 0 11z"/>',
    logout: '<path d="M9 4H4v16h5M9 12h12M17 8l4 4-4 4"/>',
    image:
      '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1"/><path d="m3 17 6-6 4 4 3-3 5 5"/>',
  };
  const icon = (name) =>
    '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    (paths[name] || paths.dumbbell) +
    "</svg>";
  const actions = {},
    routes = {},
    nav = [
      ["home", "Workout", "dumbbell"],
      ["history", "History", "history"],
      ["exerciseLibrary", "Exercises", "book"],
      ["progress", "Progress", "chart"],
      ["profile", "Profile", "user"],
    ];
  let currentSheet = null,
    returnFocus = null,
    scrollLock = null;
  let routeIndex = history.state?.routeIndex || 0;
  let restoringHistory = false;
  const attr = (action, value = "") =>
    'data-act="' + esc(action) + '" data-value="' + esc(value) + '"';
  const button = (text, action, value = "", cls = "btn") =>
    '<button class="' +
    cls +
    '" ' +
    attr(action, value) +
    ">" +
    text +
    "</button>";
  const iconButton = (name, label, action, value = "") =>
    '<button class="icon-btn" aria-label="' +
    esc(label) +
    '" ' +
    attr(action, value) +
    ">" +
    icon(name) +
    "</button>";
  const header = (title, actions = "", back = false, subtitle = "") =>
    '<header class="page-head">' +
    (back ? iconButton("back", "Back", "back") : "") +
    '<div class="title-group"><h1>' +
    esc(title) +
    "</h1>" +
    (subtitle ? '<p class="meta">' + esc(subtitle) + "</p>" : "") +
    '</div><div class="head-actions">' +
    actions +
    "</div></header>";
  const empty = (title, copy, cta = "", action = "", name = "dumbbell") =>
    '<div class="empty">' +
    icon(name) +
    "<h3>" +
    esc(title) +
    "</h3><p>" +
    esc(copy) +
    "</p>" +
    (cta ? button(esc(cta), action, "", "btn soft") : "") +
    "</div>";
  const section = (title, content, action = "") =>
    '<section class="section"><div class="section-head"><h2>' +
    esc(title) +
    "</h2>" +
    action +
    "</div>" +
    content +
    "</section>";
  const menu = (title, subtitle, name, action, value = "", extra = "") =>
    '<button class="menu-row" ' +
    attr(action, value) +
    ">" +
    icon(name) +
    "<span><strong>" +
    esc(title) +
    "</strong>" +
    (subtitle ? "<small>" + esc(subtitle) + "</small>" : "") +
    "</span>" +
    extra +
    icon("chevron") +
    "</button>";
  const mediaEntry = (ex) =>
    window.START_NOW_EXERCISE_MEDIA?.resolve(ex, { quiet: true })?.entry;
  const mediaUrl = (ex) =>
    mediaEntry(ex)?.media?.[0]?.url || mediaEntry(ex)?.media?.[0] || "";
  function thumb(ex) {
    const src = mediaUrl(ex);
    return (
      '<span class="exercise-thumb" aria-hidden="true">' +
      icon("dumbbell") +
      (typeof src === "string" && src.startsWith("https://")
        ? '<img src="' +
          esc(src) +
          '" alt="" loading="lazy" decoding="async" width="52" height="52">'
        : "") +
      "</span>"
    );
  }
  function exerciseRow(
    ex,
    action = "detail",
    value = SN.exerciseId(ex),
    end = icon("chevron"),
    sub = "",
  ) {
    return (
      '<button class="exercise-row" ' +
      attr(action, value) +
      ">" +
      thumb(ex) +
      '<span class="copy"><strong>' +
      esc(ex.name) +
      "</strong><small>" +
      esc(sub || SN.meta(ex).primary + " · " + SN.equipment(ex)) +
      "</small></span>" +
      end +
      "</button>"
    );
  }
  function lock() {
    if (scrollLock !== null) return;
    scrollLock = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = -scrollLock + "px";
    document.body.style.width = "100%";
    document.querySelector(".app-shell").inert = true;
  }
  function unlock() {
    if (scrollLock === null) return;
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.querySelector(".app-shell").inert = false;
    const y = scrollLock;
    scrollLock = null;
    window.scrollTo(0, y);
  }
  function closeSheet() {
    currentSheet?.remove();
    currentSheet = null;
    unlock();
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  }
  function sheet(title, content, { footer = "", onClose = null } = {}) {
    const trigger = currentSheet ? returnFocus : document.activeElement;
    closeSheet();
    returnFocus = trigger;
    lock();
    const m = document.createElement("div");
    m.className = "sheet-backdrop";
    m.id = "appSheet";
    m.innerHTML =
      '<section class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheetTitle" tabindex="-1"><header class="sheet-head"><h2 id="sheetTitle">' +
      esc(title) +
      "</h2>" +
      iconButton("x", "Close", "closeSheet") +
      "</header>" +
      content +
      (footer ? '<footer class="sheet-footer">' + footer + "</footer>" : "") +
      "</section>";
    currentSheet = m;
    document.body.append(m);
    m.addEventListener("click", (e) => {
      if (e.target === m) {
        closeSheet();
        onClose?.();
      }
    });
    m.querySelector('[data-act="closeSheet"]').focus({ preventScroll: true });
    return m;
  }
  function confirm(title, copy, label = "Confirm", danger = false) {
    return new Promise((resolve) => {
      const m = sheet(
        title,
        '<p class="sheet-copy">' +
          esc(copy) +
          '</p><div class="button-row"><button class="btn" data-answer="no">Cancel</button><button class="btn ' +
          (danger ? "destructive" : "primary") +
          '" data-answer="yes">' +
          esc(label) +
          "</button></div>",
        { onClose: () => resolve(false) },
      );
      m.addEventListener("click", (e) => {
        const answer = e.target.closest("[data-answer]");
        if (answer) {
          closeSheet();
          resolve(answer.dataset.answer === "yes");
        } else if (e.target.closest('[data-act="closeSheet"]')) resolve(false);
      });
      m.addEventListener("keydown", (e) => {
        if (e.key === "Escape") resolve(false);
      });
    });
  }
  function navRender() {
    const active =
      {
        activeWorkout: "home",
        summary: "home",
        builder: "home",
        workouts: "home",
        session: "history",
        calendar: "history",
        exerciseHistory: "progress",
        settings: "profile",
      }[state.page] || state.page;
    document.getElementById("navigation").innerHTML = nav
      .map(
        ([id, label, name]) =>
          '<button class="nav-item ' +
          (active === id ? "active" : "") +
          '" ' +
          attr("go", id) +
          " " +
          (active === id ? 'aria-current="page"' : "") +
          ">" +
          icon(name) +
          "<span>" +
          label +
          "</span></button>",
      )
      .join("");
    const workout = SN.active;
    const show =
      !!workout && state.page !== "activeWorkout" && state.page !== "home";
    document.body.classList.toggle("has-active", show);
    document.getElementById("activeDock").innerHTML = show
      ? '<div class="active-dock"><div><strong>' +
        esc(workout.workoutName) +
        '</strong><small><span class="active-dot"></span>Workout in progress</small></div>' +
        button("Resume", "go", "activeWorkout", "btn soft small") +
        "</div>"
      : "";
  }
  function renderPage() {
    navRender();
    document.getElementById("brand").hidden = state.page === "activeWorkout";
    try {
      (routes[state.page] || routes.home)?.();
    } catch (error) {
      console.error("Screen failed", error);
      app.innerHTML = empty(
        "This screen couldn’t open",
        "Your saved workouts are still on this device.",
        "Return to Workout",
        "home",
      );
    }
    if (!navigator.onLine)
      app.insertAdjacentHTML(
        "afterbegin",
        '<p class="offline-note">Offline · Changes are saved on this device.</p>',
      );
  }
  function go(page, options = {}) {
    const aliases = {
      workouts: "home",
      myStats: "progress",
      quickWorkout: "home",
    };
    page = aliases[page] || page;
    if (!routes[page]) page = "home";
    if (
      state.page === "builder" &&
      page !== "builder" &&
      !options.force &&
      window.Pages?.draftDirty?.()
    ) {
      confirm(
        "Leave routine editor?",
        "Your unsaved changes will be discarded.",
        "Leave",
        true,
      ).then((ok) => {
        if (ok) {
          Pages.clearDraft();
          go(page, { ...options, force: true });
        }
      });
      return;
    }
    closeSheet();
    state.page = page;
    if (!options.pop)
      history.pushState(
        {
          routeIndex: ++routeIndex,
          page,
          sessionId: state.sessionId,
          exerciseHistoryId: state.exerciseHistoryId,
        },
        "",
        "#/" + page,
      );
    renderPage();
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  }
  function picker({
    title = "Add exercises",
    items = exerciseLibrary,
    onSelect,
    multi = true,
    help = "",
  } = {}) {
    const selected = new Set();
    const m = sheet(
      title,
      (help ? '<p class="sheet-copy">' + esc(help) + "</p>" : "") +
        '<label class="search">' +
        icon("search") +
        '<input type="search" id="pickerSearch" placeholder="Search exercises" aria-label="Search exercises"></label><div class="filters"><select id="pickerMuscle" aria-label="Filter by muscle"><option value="">All muscles</option>' +
        [...new Set(items.map((e) => SN.meta(e).primary))]
          .sort()
          .map((x) => "<option>" + esc(x) + "</option>")
          .join("") +
        '</select><select id="pickerEquipment" aria-label="Filter by equipment"><option value="">All equipment</option>' +
        [...new Set(items.map((e) => SN.equipment(e)))]
          .sort()
          .map((x) => "<option>" + esc(x) + "</option>")
          .join("") +
        '</select></div><div id="pickerResults"></div>',
      {
        footer: multi
          ? '<button class="btn primary full" id="pickerDone" disabled>Add exercises</button>'
          : "",
      },
    );
    const update = () => {
      const query = m.querySelector("#pickerSearch").value.toLowerCase(),
        muscle = m.querySelector("#pickerMuscle").value,
        equipment = m.querySelector("#pickerEquipment").value;
      const filtered = items.filter(
        (e) =>
          (!query ||
            (e.name + " " + e.muscle + " " + SN.equipment(e))
              .toLowerCase()
              .includes(query)) &&
          (!muscle || SN.meta(e).primary === muscle) &&
          (!equipment || SN.equipment(e) === equipment),
      );
      m.querySelector("#pickerResults").innerHTML = filtered.length
        ? filtered
            .map((e) =>
              exerciseRow(
                e,
                "pick",
                SN.exerciseId(e),
                icon(selected.has(SN.exerciseId(e)) ? "check" : "plus"),
              ),
            )
            .join("")
        : empty(
            "No matching exercises",
            "Try another name, muscle, or equipment filter.",
            "",
            "",
            "search",
          );
      m.querySelectorAll('[data-act="pick"]').forEach((b) => {
        b.setAttribute("aria-pressed", String(selected.has(b.dataset.value)));
        b.onclick = () => {
          const id = b.dataset.value,
            ex = items.find((e) => SN.exerciseId(e) === id);
          if (!multi) {
            closeSheet();
            onSelect([ex]);
            return;
          }
          selected.has(id) ? selected.delete(id) : selected.add(id);
          update();
          const done = m.querySelector("#pickerDone");
          done.disabled = !selected.size;
          done.textContent =
            "Add " +
            selected.size +
            " exercise" +
            (selected.size === 1 ? "" : "s");
        };
      });
    };
    m.querySelector("#pickerSearch").oninput = update;
    m.querySelectorAll("select").forEach((s) => (s.onchange = update));
    if (multi)
      m.querySelector("#pickerDone").onclick = () => {
        const result = [...selected].map((id) =>
          items.find((e) => SN.exerciseId(e) === id),
        );
        closeSheet();
        onSelect(result);
      };
    update();
  }
  actions.go = (_, b) => go(b.dataset.value);
  actions.home = () => go("home");
  actions.back = () => {
    if (history.state?.page && history.length > 1) history.back();
    else go("home");
  };
  actions.closeSheet = closeSheet;
  document.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-act]");
    if (!b || b.disabled) return;
    const fn = actions[b.dataset.act];
    if (!fn) return;
    try {
      await fn(e, b);
    } catch (error) {
      console.error("Action failed", error);
      showToast("That action couldn’t finish. Please try again.");
    }
  });
  document.addEventListener("keydown", (e) => {
    const m = currentSheet || document.querySelector(".sn-auth-modal.open");
    if (!m) return;
    if (e.key === "Escape") {
      e.preventDefault();
      if (currentSheet) closeSheet();
      else m.querySelector("#snAuthClose")?.click();
      return;
    }
    if (e.key !== "Tab") return;
    const list = [
      ...m.querySelectorAll(
        'button,input,select,textarea,a[href],[tabindex="0"]',
      ),
    ].filter((el) => !el.disabled && el.getClientRects().length);
    if (!list.length) return;
    if (!m.contains(document.activeElement)) {
      e.preventDefault();
      list[0].focus();
      return;
    }
    if (e.shiftKey && document.activeElement === list[0]) {
      e.preventDefault();
      list.at(-1).focus();
    }
    if (!e.shiftKey && document.activeElement === list.at(-1)) {
      e.preventDefault();
      list[0].focus();
    }
  });
  document.addEventListener(
    "error",
    (e) => {
      if (e.target instanceof HTMLImageElement) {
        e.target.closest(".exercise-thumb")?.classList.add("failed");
        if (e.target.closest(".detail-media")) {
          e.target.alt = "Photo unavailable. See the instructions below.";
          e.target.removeAttribute("src");
        }
      }
    },
    true,
  );
  window.addEventListener("popstate", (event) => {
    if (restoringHistory) {
      restoringHistory = false;
      return;
    }
    const nextIndex = event.state?.routeIndex || 0;
    const targetPage = location.hash.slice(2) || "home";
    if (state.page === "builder" && window.Pages?.draftDirty?.()) {
      const delta = routeIndex - nextIndex;
      restoringHistory = true;
      history.go(delta || 1);
      confirm(
        "Leave routine editor?",
        "Your unsaved changes will be discarded.",
        "Leave",
        true,
      ).then((ok) => {
        if (ok) {
          Pages.clearDraft();
          history.go(-delta || -1);
        }
      });
      return;
    }
    routeIndex = nextIndex;
    state.sessionId = event.state?.sessionId;
    state.exerciseHistoryId = event.state?.exerciseHistoryId;
    go(targetPage, { pop: true, force: true });
  });
  function syncViewport() {
    if (!window.visualViewport) return;
    document.documentElement.style.setProperty(
      "--visible-height",
      visualViewport.height + "px",
    );
    document.documentElement.style.setProperty(
      "--visible-top",
      visualViewport.offsetTop + "px",
    );
  }
  window.visualViewport?.addEventListener("resize", syncViewport);
  window.visualViewport?.addEventListener("scroll", syncViewport);
  syncViewport();
  window.UI = {
    esc,
    icon,
    attr,
    button,
    iconButton,
    header,
    empty,
    section,
    menu,
    thumb,
    exerciseRow,
    mediaEntry,
    sheet,
    closeSheet,
    confirm,
    picker,
    lock,
    unlock,
    go,
    render: renderPage,
    navRender,
    actions,
    routes,
  };
})();
