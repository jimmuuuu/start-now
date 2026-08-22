// START/NOW schedule editor v13 — drag the workout card itself; no separate drag-handle boxes.
(() => {
  const WEEK = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  let draft = {};
  let editableWorkouts = [];
  let pickingDay = null;
  let dragState = null;

  function installStyles(){
    if(document.getElementById("snScheduleV13Styles")) return;
    const style = document.createElement("style");
    style.id = "snScheduleV13Styles";
    style.textContent = `
      .sn-edit-schedule-card{width:100%;margin:12px 0 14px;padding:14px 16px;border:1px solid rgba(255,90,95,.4);border-radius:18px;background:linear-gradient(145deg,var(--surface),rgba(255,90,95,.07));color:var(--text);display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:12px;align-items:center;text-align:left}
      .sn-edit-schedule-icon{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:var(--coral);color:#fff;font-size:20px;font-weight:900;box-shadow:0 8px 18px rgba(255,90,95,.22)}
      .sn-edit-schedule-copy strong{display:block;font-size:15px;margin-bottom:3px}.sn-edit-schedule-copy span{display:block;color:var(--muted);font-size:11px;line-height:1.35}.sn-edit-schedule-arrow{color:var(--coral);font-size:24px;font-weight:900}
      .sn-schedule-overlay{position:fixed;inset:0;z-index:5000;background:rgba(10,10,10,.58);backdrop-filter:blur(8px);display:flex;align-items:flex-end;justify-content:center;padding:14px}
      .sn-schedule-modal{width:min(580px,100%);max-height:90vh;overflow:auto;background:var(--surface);color:var(--text);border:1px solid var(--line);border-radius:28px 28px 20px 20px;box-shadow:0 26px 80px rgba(0,0,0,.32);padding:18px;overscroll-behavior:contain}
      .sn-schedule-top{display:grid;grid-template-columns:44px 1fr 44px;align-items:center;gap:8px;margin-bottom:12px}.sn-schedule-close,.sn-schedule-back{width:42px;height:42px;border:1px solid var(--line);border-radius:50%;background:var(--surface);color:var(--text);display:grid;place-items:center;font-size:22px}
      .sn-schedule-kicker{text-align:center;color:var(--coral);font-size:11px;font-weight:900;letter-spacing:.1em}.sn-schedule-modal h1{margin:6px 0 8px;font-size:31px;line-height:1.05;letter-spacing:-1px}.sn-schedule-sub{margin:0 0 10px;color:var(--muted);font-size:14px;line-height:1.5}
      .sn-drag-tip{margin:0 0 14px;padding:10px 12px;border-radius:13px;background:rgba(255,90,95,.07);border:1px solid rgba(255,90,95,.18);color:var(--muted);font-size:11px;line-height:1.4}.sn-drag-tip strong{color:var(--text)}
      .sn-schedule-days,.sn-schedule-picker{display:grid;gap:9px}
      .sn-schedule-row{width:100%;display:grid;grid-template-columns:54px minmax(0,1fr) auto;gap:11px;align-items:center;padding:11px 12px;border:1px solid var(--line);border-radius:17px;background:var(--surface);color:var(--text);text-align:left;transition:transform .14s ease,border-color .14s ease,background .14s ease,opacity .14s ease,box-shadow .14s ease;position:relative}
      .sn-schedule-row.has-workout{border-color:rgba(255,90,95,.25);background:linear-gradient(145deg,var(--surface),rgba(255,90,95,.04));cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none}
      .sn-schedule-row.has-workout:active{cursor:grabbing}
      .sn-schedule-row.sn-dragging{opacity:.55;transform:scale(.985);box-shadow:0 12px 30px rgba(0,0,0,.18)}
      .sn-schedule-row.sn-drop-target{border-color:var(--coral)!important;background:rgba(255,90,95,.10)!important;box-shadow:0 0 0 2px rgba(255,90,95,.12)}
      .sn-day-box{width:50px;height:50px;border-radius:14px;background:rgba(127,127,127,.1);display:grid;place-items:center;font-weight:900;pointer-events:none}.sn-row-copy{min-width:0;pointer-events:none}.sn-row-copy strong,.sn-picker-copy strong{display:block;font-size:14px;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sn-row-copy span,.sn-picker-copy span{display:block;color:var(--muted);font-size:11px;line-height:1.35}
      .sn-change-btn{min-height:40px;padding:0 12px;border:0;border-radius:11px;background:rgba(127,127,127,.09);color:var(--text);font-size:11px;font-weight:850;cursor:pointer;position:relative;z-index:2;-webkit-user-drag:none}.sn-change-btn:hover{background:rgba(127,127,127,.14)}
      .sn-picker-row{width:100%;display:grid;grid-template-columns:52px minmax(0,1fr) 28px;gap:10px;align-items:center;padding:12px;border:1px solid var(--line);border-radius:17px;background:var(--surface);color:var(--text);text-align:left}.sn-picker-row.selected{border-color:var(--coral);box-shadow:0 0 0 2px rgba(255,90,95,.08)}.sn-picker-check{width:26px;height:26px;border-radius:9px;border:1px solid var(--line);display:grid;place-items:center;color:#fff;font-weight:900}.sn-picker-row.selected .sn-picker-check{background:var(--coral);border-color:var(--coral)}
      .sn-schedule-actions{display:grid;grid-template-columns:.8fr 1.2fr;gap:9px;margin-top:14px}.sn-schedule-actions button{min-height:50px}.sn-schedule-note{margin:12px 0 0;padding:11px 12px;border-radius:14px;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.2);color:var(--muted);font-size:11px;line-height:1.4}
      @media(min-width:560px){.sn-schedule-overlay{align-items:center}.sn-schedule-modal{border-radius:28px}}
      @media(max-width:430px){.sn-schedule-overlay{padding:8px}.sn-schedule-modal{padding:15px}.sn-schedule-row{grid-template-columns:50px minmax(0,1fr) auto;gap:8px}.sn-change-btn{padding:0 9px}.sn-schedule-actions{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function planStamp(workout){
    const match = String(workout?.id || "").match(/^starter-plan-(\d+)-/);
    return match ? Number(match[1]) : 0;
  }

  function currentPlanWorkouts(){
    const generated = state.customWorkouts.filter(w => w.beginnerGenerated && planStamp(w));
    if(!generated.length) return [];
    const newest = Math.max(...generated.map(planStamp));
    return generated.filter(w => planStamp(w) === newest);
  }

  function getEditableWorkouts(){
    const current = currentPlanWorkouts();
    return current.length ? current : state.customWorkouts.filter(w => !w.archived);
  }

  function workoutById(id){ return editableWorkouts.find(w => w.id === id) || null; }

  function ensureLauncher(){
    if(state.page !== "workouts") return;
    const schedule = document.querySelector(".schedule-card");
    if(!schedule || document.getElementById("snEditSchedule")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.id = "snEditSchedule";
    button.className = "sn-edit-schedule-card";
    button.innerHTML = `<span class="sn-edit-schedule-icon">✎</span><span class="sn-edit-schedule-copy"><strong>Edit my schedule</strong><span>Grab any workout card and drag it to a different day.</span></span><span class="sn-edit-schedule-arrow">›</span>`;
    button.addEventListener("click", openEditor);
    const banner = document.querySelector(".active-plan-banner");
    if(banner) banner.insertAdjacentElement("afterend", button); else schedule.insertAdjacentElement("beforebegin", button);
    const sub = schedule.querySelector(".schedule-sub");
    if(sub) sub.textContent = "Drag a workout card to move it, or tap Change.";
  }

  function buildDraft(){
    editableWorkouts = getEditableWorkouts();
    const ids = new Set(editableWorkouts.map(w => w.id));
    draft = {};
    WEEK.forEach(day => {
      const w = state.customWorkouts.find(item => ids.has(item.id) && (item.days || []).includes(day));
      draft[day] = w?.id || null;
    });
  }

  function openEditor(){
    buildDraft();
    pickingDay = null;
    dragState = null;
    document.getElementById("snScheduleOverlay")?.remove();
    const overlay = document.createElement("div");
    overlay.id = "snScheduleOverlay";
    overlay.className = "sn-schedule-overlay";
    overlay.innerHTML = `<div class="sn-schedule-modal" role="dialog" aria-modal="true" aria-labelledby="snScheduleTitle"></div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", e => { if(e.target === overlay) closeEditor(); });
    renderEditor();
  }

  function closeEditor(){
    dragState = null;
    document.getElementById("snScheduleOverlay")?.remove();
  }

  function clearDragClasses(){
    document.querySelectorAll(".sn-schedule-row").forEach(row => row.classList.remove("sn-dragging","sn-drop-target"));
  }

  function rowAtPoint(x,y){
    return document.elementFromPoint(x,y)?.closest?.(".sn-schedule-row") || null;
  }

  function moveWorkout(sourceDay,targetDay){
    if(!sourceDay || !targetDay || sourceDay === targetDay) return;
    const sourceWorkout = draft[sourceDay] || null;
    if(!sourceWorkout) return;
    const targetWorkout = draft[targetDay] || null;
    draft[targetDay] = sourceWorkout;
    draft[sourceDay] = targetWorkout;
    renderEditor();
  }

  function highlightTarget(sourceDay,targetRow){
    clearDragClasses();
    document.querySelector(`.sn-schedule-row[data-day="${CSS.escape(sourceDay)}"]`)?.classList.add("sn-dragging");
    if(targetRow && targetRow.dataset.day !== sourceDay) targetRow.classList.add("sn-drop-target");
  }

  function bindRowDrag(){
    const rows = [...document.querySelectorAll(".sn-schedule-row")];

    rows.forEach(row => {
      const sourceDay = row.dataset.day;
      const hasWorkout = Boolean(draft[sourceDay]);

      row.addEventListener("dragover", e => {
        if(!dragState) return;
        e.preventDefault();
        highlightTarget(dragState.sourceDay,row);
        if(e.dataTransfer) e.dataTransfer.dropEffect = "move";
      });

      row.addEventListener("drop", e => {
        if(!dragState) return;
        e.preventDefault();
        const source = dragState.sourceDay;
        dragState = null;
        clearDragClasses();
        moveWorkout(source,row.dataset.day);
      });

      if(!hasWorkout) return;

      row.draggable = true;
      row.setAttribute("aria-label", `${workoutById(draft[sourceDay])?.name || "Workout"} on ${sourceDay}. Drag this card to another day.`);

      row.addEventListener("dragstart", e => {
        if(e.target?.closest?.(".sn-change-btn")){
          e.preventDefault();
          return;
        }
        dragState = {sourceDay,mode:"mouse"};
        row.classList.add("sn-dragging");
        if(e.dataTransfer){
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain",sourceDay);
        }
      });

      row.addEventListener("dragend", () => {
        dragState = null;
        clearDragClasses();
      });

      row.addEventListener("pointerdown", e => {
        if(e.pointerType === "mouse") return;
        if(e.target?.closest?.(".sn-change-btn")) return;
        if(e.button !== undefined && e.button !== 0) return;
        e.preventDefault();
        dragState = {sourceDay,pointerId:e.pointerId,mode:"pointer"};
        row.setPointerCapture?.(e.pointerId);
        row.classList.add("sn-dragging");
      });

      row.addEventListener("pointermove", e => {
        if(!dragState || dragState.mode !== "pointer" || dragState.pointerId !== e.pointerId) return;
        e.preventDefault();
        highlightTarget(dragState.sourceDay,rowAtPoint(e.clientX,e.clientY));
      });

      row.addEventListener("pointerup", e => {
        if(!dragState || dragState.mode !== "pointer" || dragState.pointerId !== e.pointerId) return;
        e.preventDefault();
        const source = dragState.sourceDay;
        const target = rowAtPoint(e.clientX,e.clientY);
        dragState = null;
        clearDragClasses();
        try{ row.releasePointerCapture?.(e.pointerId); }catch(_){ }
        if(target) moveWorkout(source,target.dataset.day);
      });

      row.addEventListener("pointercancel", e => {
        if(!dragState || dragState.mode !== "pointer" || dragState.pointerId !== e.pointerId) return;
        dragState = null;
        clearDragClasses();
      });
    });
  }

  function renderEditor(){
    const modal = document.querySelector(".sn-schedule-modal");
    if(!modal) return;
    if(pickingDay){ renderPicker(pickingDay); return; }

    modal.innerHTML = `
      <div class="sn-schedule-top"><button type="button" class="sn-schedule-close" id="snCloseSchedule">×</button><div class="sn-schedule-kicker">YOUR WEEK</div><div></div></div>
      <h1 id="snScheduleTitle">Edit your schedule.</h1>
      <p class="sn-schedule-sub">Grab a workout card itself and drag it onto another day.</p>
      <div class="sn-drag-tip"><strong>Drag anywhere on the workout card.</strong> Drop it on another workout to swap the two days, or drop it on a rest day to move it there. Use Change if you want to pick manually.</div>
      <div class="sn-schedule-days">
        ${WEEK.map(day => {
          const w = workoutById(draft[day]);
          return `<div class="sn-schedule-row ${w ? "has-workout" : ""}" data-day="${day}">
            <span class="sn-day-box">${day.slice(0,3)}</span>
            <span class="sn-row-copy"><strong>${w ? escapeHtml(w.name) : "Rest day"}</strong><span>${w ? `${w.exercises?.length || 0} exercises • ${escapeHtml(workoutMuscles(w))}` : "No workout scheduled"}</span></span>
            <button type="button" class="sn-change-btn" data-change-day="${day}">Change</button>
          </div>`;
        }).join("")}
      </div>
      <div class="sn-schedule-actions"><button type="button" class="secondary" id="snCancelSchedule">Cancel</button><button type="button" class="primary" id="snSaveSchedule">Save schedule</button></div>`;

    document.getElementById("snCloseSchedule").onclick = closeEditor;
    document.getElementById("snCancelSchedule").onclick = closeEditor;
    document.getElementById("snSaveSchedule").onclick = saveSchedule;
    document.querySelectorAll("[data-change-day]").forEach(btn => {
      btn.addEventListener("pointerdown",e => e.stopPropagation());
      btn.addEventListener("mousedown",e => e.stopPropagation());
      btn.onclick = e => {
        e.stopPropagation();
        pickingDay = btn.dataset.changeDay;
        renderEditor();
      };
    });
    bindRowDrag();
  }

  function renderPicker(day){
    const modal = document.querySelector(".sn-schedule-modal");
    const currentId = draft[day];
    modal.innerHTML = `
      <div class="sn-schedule-top"><button type="button" class="sn-schedule-back" id="snBackSchedule">←</button><div class="sn-schedule-kicker">${day.toUpperCase()}</div><button type="button" class="sn-schedule-close" id="snCloseSchedule">×</button></div>
      <h1 id="snScheduleTitle">Choose ${day}.</h1>
      <p class="sn-schedule-sub">Pick a workout or make this a rest day.</p>
      <div class="sn-schedule-picker">
        <button type="button" class="sn-picker-row ${!currentId ? "selected" : ""}" data-workout-id=""><span class="sn-day-box">☾</span><span class="sn-picker-copy"><strong>Rest day</strong><span>No workout scheduled</span></span><span class="sn-picker-check">${!currentId ? "✓" : ""}</span></button>
        ${editableWorkouts.map(w => `<button type="button" class="sn-picker-row ${currentId === w.id ? "selected" : ""}" data-workout-id="${escapeHtml(w.id)}"><span class="sn-day-box">🏋</span><span class="sn-picker-copy"><strong>${escapeHtml(w.name)}</strong><span>${w.exercises?.length || 0} exercises • ${escapeHtml(workoutMuscles(w))}</span></span><span class="sn-picker-check">${currentId === w.id ? "✓" : ""}</span></button>`).join("")}
      </div>
      <div class="sn-schedule-note">If you choose a workout that is already on another day, START/NOW swaps the two days automatically.</div>`;
    document.getElementById("snBackSchedule").onclick = () => { pickingDay = null; renderEditor(); };
    document.getElementById("snCloseSchedule").onclick = closeEditor;
    document.querySelectorAll("[data-workout-id]").forEach(btn => btn.onclick = () => chooseForDay(day,btn.dataset.workoutId || null));
  }

  function chooseForDay(day,workoutId){
    if(!workoutId){ draft[day] = null; pickingDay = null; renderEditor(); return; }
    const oldTarget = draft[day] || null;
    const otherDay = WEEK.find(d => d !== day && draft[d] === workoutId);
    draft[day] = workoutId;
    if(otherDay) draft[otherDay] = oldTarget;
    pickingDay = null;
    renderEditor();
  }

  function saveSchedule(){
    const editableIds = new Set(editableWorkouts.map(w => w.id));
    state.customWorkouts = state.customWorkouts.map(w => editableIds.has(w.id) ? {...w,days:[]} : w);
    WEEK.forEach(day => {
      const id = draft[day];
      if(!id) return;
      const w = state.customWorkouts.find(item => item.id === id);
      if(w) w.days = [day];
    });
    saveCustomWorkouts();
    closeEditor();
    state.page = "workouts";
    render();
    if(typeof showToast === "function") showToast("Schedule updated");
  }

  installStyles();
  if(typeof renderWorkouts === "function"){
    const previousRenderWorkouts = renderWorkouts;
    renderWorkouts = function(){ previousRenderWorkouts(); ensureLauncher(); };
  }
  const observer = new MutationObserver(ensureLauncher);
  observer.observe(document.getElementById("app"),{childList:true,subtree:true});
  setTimeout(ensureLauncher,0);
})();