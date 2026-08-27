// START/NOW v101 - replaces workout emoji with the app's shared SVG training icons.
(() => {
  function icon(name = "dumbbell", size = 22) {
    if (window.START_NOW_ICONS?.icon) {
      return window.START_NOW_ICONS.icon(name, "sn101-icon", size);
    }
    return '<svg class="sn101-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 9v6M4 10v4M18 9v6M20 10v4M6 12h12"/></svg>';
  }

  function installStyles() {
    if (document.getElementById("snWorkoutIconCleanupStyles")) return;
    const style = document.createElement("style");
    style.id = "snWorkoutIconCleanupStyles";
    style.textContent = `
      .sn101-icon{display:block;flex:0 0 auto}
      .exercise-option-icon,.workout-icon{display:grid;place-items:center}
      .exercise-option-icon .sn101-icon{width:22px;height:22px;color:#4f8cff}
      .workout-icon .sn101-icon{width:22px;height:22px}
      .tile .sn101-tile-icon{display:grid;place-items:center;width:24px;height:24px;margin:0!important;font-size:0!important;opacity:1}
      .tile .sn101-tile-icon .sn101-icon{width:23px;height:23px}
      .streak-card .fire .sn101-icon{width:29px;height:29px;color:#7faf19}
      .sn101-inline-icon{display:inline-flex;vertical-align:middle;margin-right:7px}
      .sn101-inline-icon .sn101-icon{width:17px;height:17px}
      .sn-streak-celebration .sn101-inline-icon{color:#ff5a5f}
      .sn-summary-card.pr > span .sn101-inline-icon{color:#d89a0e}
    `;
    document.head.appendChild(style);
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

  function decorateWorkoutIcons() {
    installStyles();

    document.querySelectorAll(".exercise-option-icon").forEach(node => {
      if (!node.querySelector(".sn101-icon")) node.innerHTML = icon("dumbbell", 22);
    });

    document.querySelectorAll(".workout-icon").forEach(node => {
      if (!node.querySelector(".sn101-icon")) node.innerHTML = icon("dumbbell", 22);
    });

    document.querySelectorAll(".tile").forEach(tile => {
      if (!/workouts/i.test(tile.querySelector("strong")?.textContent || "") || tile.querySelector(".sn101-tile-icon")) return;
      const firstText = [...tile.childNodes].find(child => child.nodeType === Node.TEXT_NODE && /[\u{1F300}-\u{1FAFF}]/u.test(child.textContent));
      if (!firstText) return;
      firstText.remove();
      const holder = document.createElement("span");
      holder.className = "sn101-tile-icon";
      holder.innerHTML = icon("dumbbell", 23);
      tile.insertBefore(holder, tile.firstChild);
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
      decorateWorkoutIcons();
      return result;
    };
  }

  ["render", "renderHome", "renderWorkouts", "renderBuilder", "renderWorkout", "renderSummary"].forEach(wrap);
  decorateWorkoutIcons();
})();
