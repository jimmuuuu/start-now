// Drag-and-drop enhancement for the existing START/NOW schedule editor.
// Keeps the tap-to-change workflow as an accessible fallback.
(() => {
  let drag = null;
  let pointerDrag = null;

  function installStyles() {
    if (document.getElementById("snScheduleDragStyles")) return;
    const style = document.createElement("style");
    style.id = "snScheduleDragStyles";
    style.textContent = `
      .sn-schedule-row{position:relative;transition:transform .16s ease,border-color .16s ease,background .16s ease,opacity .16s ease}
      .sn-schedule-row.sn-dragging{opacity:.52;transform:scale(.985)}
      .sn-schedule-row.sn-drop-target{border-color:var(--coral)!important;background:rgba(255,90,95,.09)!important;box-shadow:0 0 0 2px rgba(255,90,95,.10)}
      .sn-drag-handle{display:inline-flex;align-items:center;gap:6px;color:var(--muted);font-size:11px;font-weight:900;letter-spacing:.02em;cursor:grab;user-select:none;-webkit-user-select:none;touch-action:none;padding:8px 2px;min-width:42px;justify-content:flex-end}
      .sn-drag-handle:active{cursor:grabbing}
      .sn-drag-grip{font-size:18px;line-height:1;letter-spacing:-4px;color:var(--muted)}
      .sn-drag-tip{margin:0 0 12px;padding:10px 12px;border-radius:13px;background:rgba(255,90,95,.06);border:1px solid rgba(255,90,95,.16);color:var(--muted);font-size:11px;line-height:1.4}
      .sn-drag-tip strong{color:var(--text)}
      @media(max-width:430px){.sn-drag-handle .sn-drag-word{display:none}.sn-drag-handle{min-width:34px}}
    `;
    document.head.appendChild(style);
  }

  function clearHighlights() {
    document.querySelectorAll(".sn-schedule-row.sn-dragging,.sn-schedule-row.sn-drop-target").forEach(row => {
      row.classList.remove("sn-dragging", "sn-drop-target");
    });
  }

  function workoutName(row) {
    return row?.querySelector(".sn-row-copy strong")?.textContent?.trim() || "";
  }

  function isWorkoutRow(row) {
    const name = workoutName(row);
    return Boolean(name && name.toLowerCase() !== "rest day");
  }

  function applyMove(sourceName, sourceDay, targetDay) {
    if (!sourceName || !targetDay || sourceDay === targetDay) return;
    const target = document.querySelector(`.sn-schedule-row[data-day="${CSS.escape(targetDay)}"]`);
    if (!target) return;

    // Reuse the existing editor logic so drag/drop and tap-to-change stay in sync.
    target.click();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const options = [...document.querySelectorAll(".sn-picker-row")];
        const match = options.find(option => option.querySelector(".sn-picker-copy strong")?.textContent?.trim() === sourceName);
        if (match) match.click();
      });
    });
  }

  function targetRowAt(x, y) {
    return document.elementFromPoint(x, y)?.closest?.(".sn-schedule-row") || null;
  }

  function enhanceEditor() {
    const days = document.querySelector(".sn-schedule-days");
    if (!days) return;

    const subtitle = document.querySelector(".sn-schedule-sub");
    if (subtitle && !document.getElementById("snDragTip")) {
      const tip = document.createElement("div");
      tip.id = "snDragTip";
      tip.className = "sn-drag-tip";
      tip.innerHTML = `<strong>Drag to rearrange:</strong> grab the handle on a workout and drop it onto any other day, including a rest day. You can still tap Change if you prefer.`;
      subtitle.insertAdjacentElement("afterend", tip);
    }

    document.querySelectorAll(".sn-schedule-row").forEach(row => {
      if (row.dataset.dragEnhanced === "true") return;
      row.dataset.dragEnhanced = "true";

      const day = row.dataset.day;
      const name = workoutName(row);

      // Every day is a valid drop target, including rest days.
      row.addEventListener("dragover", event => {
        if (!drag || drag.sourceDay === row.dataset.day) return;
        event.preventDefault();
        clearHighlights();
        document.querySelector(`.sn-schedule-row[data-day="${CSS.escape(drag.sourceDay)}"]`)?.classList.add("sn-dragging");
        row.classList.add("sn-drop-target");
        if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
      });

      row.addEventListener("drop", event => {
        if (!drag) return;
        event.preventDefault();
        const current = drag;
        drag = null;
        clearHighlights();
        applyMove(current.sourceName, current.sourceDay, row.dataset.day);
      });

      // Rest days can receive drops, but only actual workouts can be dragged.
      if (!isWorkoutRow(row)) return;

      row.draggable = true;
      row.setAttribute("aria-label", `${name} on ${day}. Drag to another day or tap to change.`);

      const oldAction = row.querySelector(".sn-change");
      if (oldAction) {
        oldAction.innerHTML = `<span class="sn-drag-handle" role="button" tabindex="0" aria-label="Drag ${name}"><span class="sn-drag-word">Drag</span><span class="sn-drag-grip">⋮⋮</span></span>`;
      }
      const handle = row.querySelector(".sn-drag-handle");

      row.addEventListener("dragstart", event => {
        drag = { sourceDay: day, sourceName: name };
        row.classList.add("sn-dragging");
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", name);
        }
      });

      row.addEventListener("dragend", () => {
        drag = null;
        clearHighlights();
      });

      if (handle) {
        handle.addEventListener("click", event => event.stopPropagation());
        handle.addEventListener("keydown", event => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            row.click();
          }
        });

        handle.addEventListener("pointerdown", event => {
          if (event.pointerType === "mouse") return; // desktop uses native drag/drop
          if (event.button !== 0) return;
          event.preventDefault();
          event.stopPropagation();
          pointerDrag = { sourceDay: day, sourceName: name, pointerId: event.pointerId };
          handle.setPointerCapture?.(event.pointerId);
          row.classList.add("sn-dragging");
        });

        handle.addEventListener("pointermove", event => {
          if (!pointerDrag || pointerDrag.pointerId !== event.pointerId) return;
          const target = targetRowAt(event.clientX, event.clientY);
          clearHighlights();
          row.classList.add("sn-dragging");
          if (target && target !== row) target.classList.add("sn-drop-target");
        });

        const finishPointer = event => {
          if (!pointerDrag || pointerDrag.pointerId !== event.pointerId) return;
          const current = pointerDrag;
          const target = targetRowAt(event.clientX, event.clientY);
          pointerDrag = null;
          clearHighlights();
          handle.releasePointerCapture?.(event.pointerId);
          if (target && target.dataset.day !== current.sourceDay) {
            applyMove(current.sourceName, current.sourceDay, target.dataset.day);
          }
        };

        handle.addEventListener("pointerup", finishPointer);
        handle.addEventListener("pointercancel", event => {
          if (!pointerDrag || pointerDrag.pointerId !== event.pointerId) return;
          pointerDrag = null;
          clearHighlights();
        });
      }
    });
  }

  installStyles();
  const observer = new MutationObserver(enhanceEditor);
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(enhanceEditor, 0);
})();
