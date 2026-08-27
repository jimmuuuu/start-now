// START/NOW v103 - uses verified thumbnails for individual exercise rows only.
(() => {
  function icon(name = "dumbbell", size = 22) {
    if (window.START_NOW_ICONS?.icon) {
      return window.START_NOW_ICONS.icon(name, "sn101-icon", size);
    }
    return '<svg class="sn101-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 9v6M4 10v4M18 9v6M20 10v4M6 12h12"/></svg>';
  }

  function library() {
    return typeof exerciseLibrary !== "undefined" && Array.isArray(exerciseLibrary) ? exerciseLibrary : [];
  }

  function exerciseByName(name) {
    const normalized = String(name || "").trim().toLowerCase();
    return library().find(exercise => String(exercise.name || "").trim().toLowerCase() === normalized) || null;
  }

  function mediaFor(exercise) {
    try {
      const result = window.START_NOW_EXERCISE_MEDIA?.resolve(exercise, { quiet: true });
      return result?.status === "ready" ? result.entry?.media?.[0] || null : null;
    } catch (_) {
      return null;
    }
  }

  function installStyles() {
    if (document.getElementById("snWorkoutIconCleanupStyles")) return;
    const style = document.createElement("style");
    style.id = "snWorkoutIconCleanupStyles";
    style.textContent = `
      .sn101-icon{display:block;flex:0 0 auto}
      .exercise-option-icon{display:grid;place-items:center;overflow:hidden}
      .exercise-option-icon.sn101-has-image{background:#f5f6f8}
      .sn101-exercise-image{display:block;width:100%;height:100%;object-fit:cover;object-position:center}
      .exercise-option-icon .sn101-icon{width:22px;height:22px;color:#4f8cff}
      .dark .exercise-option-icon.sn101-has-image{background:#23262a}
      .tile .sn101-tile-icon{display:grid;place-items:center;width:25px;height:25px;margin:0!important;font-size:0!important;opacity:1;overflow:hidden;border-radius:6px;background:rgba(255,255,255,.18)}
      .tile .sn101-tile-icon .sn101-exercise-image{object-fit:cover}
      .tile .sn101-tile-icon .sn101-icon{width:18px;height:18px}
      .streak-card .fire .sn101-icon{width:29px;height:29px;color:#7faf19}
      .sn101-inline-icon{display:inline-flex;vertical-align:middle;margin-right:7px}
      .sn101-inline-icon .sn101-icon{width:17px;height:17px}
      .sn-streak-celebration .sn101-inline-icon{color:#ff5a5f}
      .sn-summary-card.pr > span .sn101-inline-icon{color:#d89a0e}
    `;
    document.head.appendChild(style);
  }

  function setVisual(node, exercise, fallback = "dumbbell") {
    if (!node) return;
    const source = mediaFor(exercise);
    node.classList.remove("sn101-has-image");
    node.innerHTML = "";

    if (!source) {
      node.innerHTML = icon(fallback, 22);
      return;
    }

    const image = document.createElement("img");
    image.className = "sn101-exercise-image";
    image.src = source;
    image.alt = "";
    image.decoding = "async";
    image.loading = "lazy";
    image.addEventListener("error", () => {
      node.classList.remove("sn101-has-image");
      node.innerHTML = icon(fallback, 22);
    }, { once: true });
    node.classList.add("sn101-has-image");
    node.appendChild(image);
  }

  function replaceLeadingEmoji(node, markup) {
    const firstText = [...node.childNodes].find(child => child.nodeType === Node.TEXT_NODE && /[\u{1F300}-\u{1FAFF}]/u.test(child.textContent));
    if (!firstText) return;
    firstText.textContent = firstText.textContent.replace(/[\u{1F300}-\u{1FAFF}]/gu, "").trimStart();
    const holder = document.createElement("span");
    holder.className = "sn101-inline-icon";
    holder.innerHTML = markup;
    node.insertBefore(holder, node.firstChild);
  }

  function decorateWorkoutVisuals() {
    installStyles();

    document.querySelectorAll(".exercise-option-icon").forEach(node => {
      const name = node.closest(".exercise-option")?.querySelector(".exercise-option-copy strong")?.textContent;
      setVisual(node, exerciseByName(name));
    });

    document.querySelectorAll(".streak-card .fire").forEach(node => {
      if (!node.querySelector(".sn101-icon")) node.innerHTML = icon("flame", 29);
    });

    document.querySelectorAll(".sn-streak-celebration").forEach(node => {
      if (!node.querySelector(".sn101-inline-icon")) replaceLeadingEmoji(node, icon("flame", 17));
    });

    document.querySelectorAll(".sn-summary-card.pr > span").forEach(node => {
      if (!node.querySelector(".sn101-inline-icon")) replaceLeadingEmoji(node, icon("trophy", 17));
    });

    document.querySelectorAll(".sn-exercise-history, .sn-history-list").forEach(root => {
      root.querySelectorAll("*").forEach(node => {
        if (node.children.length || !/🏆/u.test(node.textContent)) return;
        node.textContent = node.textContent.replace(/🏆\s*/gu, "");
      });
    });
  }

  function wrap(name) {
    const previous = window[name];
    if (typeof previous !== "function") return;
    window[name] = function (...args) {
      const result = previous.apply(this, args);
      decorateWorkoutVisuals();
      return result;
    };
  }

  ["render", "renderHome", "renderWorkouts", "renderBuilder", "renderWorkout", "renderSummary"].forEach(wrap);
  decorateWorkoutVisuals();
})();
