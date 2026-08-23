// START/NOW v63 — interactive workout calendar and schedule-aware streak history.
(() => {
  const PROGRESS_KEY = "sn_progress_sessions";
  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let visibleMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  let selectedKey = null;

  function esc(value = "") {
    if (typeof escapeHtml === "function") return escapeHtml(value);
    return String(value).replace(/[&<>'"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]));
  }

  function icon(name, size = 18, stroke = 2.2) {
    if (window.START_NOW_ICONS?.icon) return window.START_NOW_ICONS.icon(name, "", size, stroke);
    const paths = {
      trophy: '<path d="M8 21h8M12 17v4"/><path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 6H4a2 2 0 0 0 2 4h1M17 6h3a2 2 0 0 1-2 4h-1"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      chart: '<path d="M3 3v18h18"/><path d="m7 16 4-5 4 3 5-7"/>',
      moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
      x: '<path d="M18 6 6 18M6 6l12 12"/>',
      chevronLeft: '<path d="m15 18-6-6 6-6"/>',
      chevronRight: '<path d="m9 18 6-6-6-6"/>',
      arrowLeft: '<path d="m15 18-6-6 6-6"/>'
    };
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.check}</svg>`;
  }

  function loadSessions() {
    try {
      const rows = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "[]");
      return Array.isArray(rows) ? rows.filter(row => Number(row?.timestamp) > 0) : [];
    } catch { return []; }
  }

  function startOfDay(value) {
    const d = value instanceof Date ? value : new Date(value);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function dayKey(value) {
    const d = startOfDay(value);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  function sameDay(a, b) { return dayKey(a) === dayKey(b); }

  function scheduleMap() {
    const map = new Map();
    (state.customWorkouts || []).forEach(workout => {
      (workout.days || []).forEach(day => {
        if (DAY_NAMES.includes(day) && !map.has(day)) map.set(day, workout);
      });
    });
    return map;
  }

  function sessionMap() {
    const map = new Map();
    loadSessions().forEach(session => {
      const key = dayKey(Number(session.timestamp));
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(session);
    });
    return map;
  }

  function dateState(date, sessionsByDay = sessionMap(), schedule = scheduleMap()) {
    const today = startOfDay(new Date());
    const key = dayKey(date);
    const sessions = sessionsByDay.get(key) || [];
    const workout = schedule.get(DAY_NAMES[date.getDay()]) || null;
    const future = startOfDay(date) > today;
    const isToday = sameDay(date, today);

    if (sessions.length) return { type: "completed", key, sessions, workout, isToday, future:false };
    if (future) return workout
      ? { type:"scheduled", key, sessions, workout, isToday, future:true }
      : { type:"neutral", key, sessions, workout:null, isToday, future:true };
    if (!workout) return { type:"rest", key, sessions, workout:null, isToday, future:false };
    if (isToday) return { type:"scheduled", key, sessions, workout, isToday:true, future:false };
    return { type:"missed", key, sessions, workout, isToday:false, future:false };
  }

  function calculateStreaks() {
    const sessions = loadSessions();
    const completed = new Set(sessions.map(s => dayKey(Number(s.timestamp))));
    const schedule = scheduleMap();
    const today = startOfDay(new Date());

    if (!completed.size) return { current:0, longest:0 };

    if (!schedule.size) {
      const sorted = [...completed].sort();
      let longest = 0, run = 0, prev = null;
      sorted.forEach(key => {
        const d = new Date(`${key}T12:00:00`);
        if (prev && Math.round((d-prev)/86400000) === 1) run += 1; else run = 1;
        longest = Math.max(longest, run); prev = d;
      });
      let cursor = new Date(today), current = 0;
      if (!completed.has(dayKey(cursor))) cursor.setDate(cursor.getDate()-1);
      while (completed.has(dayKey(cursor))) { current += 1; cursor.setDate(cursor.getDate()-1); }
      return { current, longest };
    }

    let first = new Date(today); first.setDate(first.getDate()-365);
    if (sessions.length) {
      const earliest = startOfDay(Math.min(...sessions.map(s => Number(s.timestamp))));
      if (earliest < first) first = earliest;
    }

    let longest = 0, run = 0;
    for (let d = new Date(first); d <= today; d.setDate(d.getDate()+1)) {
      const scheduled = schedule.has(DAY_NAMES[d.getDay()]);
      if (!scheduled) continue;
      if (completed.has(dayKey(d))) { run += 1; longest = Math.max(longest, run); }
      else if (!sameDay(d, today)) run = 0;
    }

    let current = 0;
    for (let d = new Date(today), scanned = 0; scanned < 365; d.setDate(d.getDate()-1), scanned++) {
      if (!schedule.has(DAY_NAMES[d.getDay()])) continue;
      const done = completed.has(dayKey(d));
      if (sameDay(d, today) && !done) continue;
      if (done) current += 1; else break;
    }
    return { current, longest };
  }

  function monthSummary(monthDate) {
    const sessionsByDay = sessionMap();
    const schedule = scheduleMap();
    const now = startOfDay(new Date());
    const year = monthDate.getFullYear(), month = monthDate.getMonth();
    const last = new Date(year, month + 1, 0).getDate();
    let scheduledElapsed = 0, scheduledCompleted = 0, workouts = 0;

    for (let day=1; day<=last; day++) {
      const d = new Date(year, month, day);
      const key = dayKey(d);
      const sessionCount = (sessionsByDay.get(key) || []).length;
      workouts += sessionCount;
      if (d <= now && schedule.has(DAY_NAMES[d.getDay()])) {
        scheduledElapsed += 1;
        if (sessionCount) scheduledCompleted += 1;
      }
    }
    const consistency = scheduledElapsed ? Math.round((scheduledCompleted / scheduledElapsed) * 100) : (workouts ? 100 : 0);
    return { workouts, consistency };
  }

  function monthCells(monthDate) {
    const year = monthDate.getFullYear(), month = monthDate.getMonth();
    const first = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0).getDate();
    const mondayOffset = (first.getDay() + 6) % 7;
    const sessionsByDay = sessionMap();
    const schedule = scheduleMap();
    const cells = [];
    for (let i=0; i<mondayOffset; i++) cells.push(null);
    for (let day=1; day<=lastDay; day++) {
      const date = new Date(year, month, day);
      cells.push({ date, ...dateState(date, sessionsByDay, schedule) });
    }
    while (cells.length % 7) cells.push(null);
    return cells;
  }

  function gradeLetter(score) {
    const n = Number(score);
    if (!Number.isFinite(n)) return null;
    if (n >= 97) return "A+"; if (n >= 93) return "A"; if (n >= 90) return "A-";
    if (n >= 87) return "B+"; if (n >= 83) return "B"; if (n >= 80) return "B-";
    if (n >= 77) return "C+"; if (n >= 73) return "C"; if (n >= 70) return "C-";
    if (n >= 67) return "D+"; if (n >= 63) return "D"; if (n >= 60) return "D-"; return "F";
  }

  function statusIcon(type) {
    if (type === "completed") return icon("check", 13, 2.7);
    if (type === "rest") return icon("moon", 13, 2.1);
    if (type === "missed") return icon("x", 13, 2.3);
    return "";
  }

  function renderDetail(key) {
    const host = document.querySelector(".sn63-day-detail");
    if (!host) return;
    if (!key) { host.innerHTML = ""; return; }
    const [y,m,d] = key.split("-").map(Number);
    const date = new Date(y,m-1,d);
    const info = dateState(date);
    const dateLabel = date.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});

    if (info.type === "completed") {
      const s = info.sessions[info.sessions.length-1];
      const metrics = [];
      const exCount = Array.isArray(s.exercises) ? s.exercises.length : null;
      if (exCount != null) metrics.push(`${exCount} exercise${exCount===1?"":"s"}`);
      if (Number.isFinite(Number(s.completedSets))) metrics.push(`${Number(s.completedSets)} sets`);
      if (Number.isFinite(Number(s.durationMinutes))) metrics.push(`${Number(s.durationMinutes)} min`);
      const letter = gradeLetter(s.grade);
      if (letter) metrics.push(`Grade ${letter}`);
      if (Number(s.volume) > 0) metrics.push(`${Math.round(Number(s.volume)).toLocaleString()} lb volume`);
      host.innerHTML = `<div class="sn63-detail-card completed"><div class="sn63-detail-date">${esc(dateLabel)}</div><div class="sn63-detail-head"><div><h3>${esc(s.workoutName || info.workout?.name || "Workout")}</h3><span class="sn63-status good">Completed</span></div>${icon("check",22,2.6)}</div>${metrics.length?`<div class="sn63-detail-metrics">${metrics.map(v=>`<span>${esc(v)}</span>`).join("")}</div>`:""}</div>`;
      return;
    }
    if (info.type === "rest") {
      host.innerHTML = `<div class="sn63-detail-card rest"><div class="sn63-detail-date">${esc(dateLabel)}</div><div class="sn63-detail-head"><div><h3>Rest Day</h3><span class="sn63-status rest">Recovery day</span></div>${icon("moon",22,2.1)}</div><p>Rest days are part of your plan and do not break your streak.</p></div>`;
      return;
    }
    if (info.type === "missed") {
      host.innerHTML = `<div class="sn63-detail-card missed"><div class="sn63-detail-date">${esc(dateLabel)}</div><div class="sn63-detail-head"><div><h3>${esc(info.workout?.name || "Scheduled workout")}</h3><span class="sn63-status missed">Missed</span></div>${icon("x",22,2.2)}</div><p>This workout was scheduled but no completed workout was logged for this day.</p></div>`;
      return;
    }
    if (info.type === "scheduled") {
      host.innerHTML = `<div class="sn63-detail-card scheduled"><div class="sn63-detail-date">${esc(dateLabel)}</div><div class="sn63-detail-head"><div><h3>${esc(info.workout?.name || "Scheduled workout")}</h3><span class="sn63-status scheduled">Scheduled</span></div></div><p>${info.future?"Upcoming workout on your current plan.":"You still have today to complete this workout."}</p></div>`;
      return;
    }
    host.innerHTML = `<div class="sn63-detail-card"><div class="sn63-detail-date">${esc(dateLabel)}</div><h3>No workout scheduled</h3></div>`;
  }

  function renderActivity(monthDate) {
    const sessionsByDay = sessionMap();
    const schedule = scheduleMap();
    const y = monthDate.getFullYear(), m = monthDate.getMonth();
    const last = new Date(y,m+1,0).getDate();
    const rows = [];
    for (let day=last; day>=1; day--) {
      const date = new Date(y,m,day);
      const info = dateState(date,sessionsByDay,schedule);
      if (info.type === "neutral" || info.type === "scheduled" && info.future) continue;
      if (info.type === "completed") {
        info.sessions.slice().reverse().forEach(s => rows.push({date, type:"completed", title:s.workoutName||info.workout?.name||"Workout", sub:[Number.isFinite(Number(s.durationMinutes))?`${Number(s.durationMinutes)} min`:null, gradeLetter(s.grade)?gradeLetter(s.grade):null].filter(Boolean).join(" • ")}));
      } else if (info.type === "rest") rows.push({date,type:"rest",title:"Rest Day",sub:"Recovery day"});
      else if (info.type === "missed") rows.push({date,type:"missed",title:info.workout?.name||"Scheduled workout",sub:"Missed"});
    }
    if (!rows.some(r=>r.type==="completed")) {
      return `<div class="sn63-empty"><strong>Your training history starts here</strong><span>Complete your first workout and it will appear on this calendar.</span></div>`;
    }
    return rows.slice(0,12).map(row => `<button class="sn63-activity-row" data-calendar-day="${dayKey(row.date)}"><div class="sn63-activity-icon ${row.type}">${statusIcon(row.type)}</div><div><strong>${row.date.toLocaleDateString(undefined,{month:"short",day:"numeric"})} — ${esc(row.title)}</strong><span>${esc(row.sub)}</span></div></button>`).join("");
  }

  function renderCalendar() {
    const streaks = calculateStreaks();
    const summary = monthSummary(visibleMonth);
    const cells = monthCells(visibleMonth);
    const todayMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const maxFuture = new Date(todayMonth.getFullYear(), todayMonth.getMonth()+1, 1);
    const canNext = visibleMonth < maxFuture;

    app.innerHTML = `
      <div class="sn63-calendar-page">
        <div class="sn63-topbar"><button class="sn63-back" aria-label="Back">${icon("arrowLeft",22,2.3)}</button><div><div class="eyebrow">TRAINING HISTORY</div><h1>Workout Calendar</h1></div></div>

        <section class="card sn63-summary">
          <div><span class="sn63-summary-icon fire">🔥</span><strong>${streaks.current}</strong><small>Current streak</small></div>
          <div><span class="sn63-summary-svg">${icon("trophy",19,2.1)}</span><strong>${streaks.longest}</strong><small>Longest streak</small></div>
          <div><span class="sn63-summary-svg">${icon("check",19,2.4)}</span><strong>${summary.workouts}</strong><small>Workouts</small></div>
          <div><span class="sn63-summary-svg">${icon("chart",19,2.1)}</span><strong>${summary.consistency}%</strong><small>Consistency</small></div>
        </section>

        <section class="card sn63-calendar-card">
          <div class="sn63-month-head"><button class="sn63-month-btn" data-month="prev" aria-label="Previous month">${icon("chevronLeft",21,2.3)}</button><h2>${MONTH_NAMES[visibleMonth.getMonth()]} ${visibleMonth.getFullYear()}</h2><button class="sn63-month-btn" data-month="next" aria-label="Next month" ${canNext?"":"disabled"}>${icon("chevronRight",21,2.3)}</button></div>
          <div class="sn63-weekdays">${["MON","TUE","WED","THU","FRI","SAT","SUN"].map(d=>`<span>${d}</span>`).join("")}</div>
          <div class="sn63-month-grid">
            ${cells.map(cell => cell ? `<button class="sn63-day ${cell.type} ${cell.isToday?"today":""} ${selectedKey===cell.key?"selected":""}" data-calendar-day="${cell.key}" aria-label="${cell.date.toLocaleDateString()} ${cell.type}"><span class="sn63-date">${cell.date.getDate()}</span><span class="sn63-day-mark">${statusIcon(cell.type)}</span>${cell.workout && (cell.type==="completed"||cell.type==="scheduled"||cell.type==="missed")?`<small>${esc(cell.workout.name.split(/\s+/).slice(0,2).join(" "))}</small>`:cell.type==="rest"?"<small>Rest</small>":""}</button>` : '<div class="sn63-day blank"></div>').join("")}
          </div>
          <div class="sn63-legend"><span><i class="completed"></i>Completed</span><span><i class="rest"></i>Rest</span><span><i class="missed"></i>Missed</span><span><i class="scheduled"></i>Scheduled</span></div>
        </section>

        <div class="sn63-day-detail"></div>

        <section class="sn63-activity"><div class="section-title-row"><h2>${MONTH_NAMES[visibleMonth.getMonth()]} activity</h2></div><div class="sn63-activity-list">${renderActivity(visibleMonth)}</div></section>
      </div>`;

    document.querySelector('.sn63-back')?.addEventListener('click',()=>{ state.page='home'; render(); });
    document.querySelector('[data-month="prev"]')?.addEventListener('click',()=>{ visibleMonth=new Date(visibleMonth.getFullYear(),visibleMonth.getMonth()-1,1); selectedKey=null; renderCalendar(); });
    document.querySelector('[data-month="next"]')?.addEventListener('click',()=>{ if(!canNext)return; visibleMonth=new Date(visibleMonth.getFullYear(),visibleMonth.getMonth()+1,1); selectedKey=null; renderCalendar(); });
    document.querySelectorAll('[data-calendar-day]').forEach(btn=>btn.addEventListener('click',()=>{ selectedKey=btn.dataset.calendarDay; document.querySelectorAll('.sn63-day').forEach(d=>d.classList.toggle('selected',d.dataset.calendarDay===selectedKey)); renderDetail(selectedKey); }));
    if (selectedKey) renderDetail(selectedKey);
  }

  function enhanceHomeCard() {
    const card = document.querySelector('.streak-card');
    if (!card || card.dataset.calendarReady === '1') return;
    card.dataset.calendarReady = '1';
    card.classList.add('sn63-streak-entry');
    card.setAttribute('role','button'); card.setAttribute('tabindex','0'); card.setAttribute('aria-label','Open workout calendar and streak history');
    const chevron = document.createElement('span'); chevron.className='sn63-streak-chevron'; chevron.innerHTML=icon('chevronRight',18,2.3); card.appendChild(chevron);
    const open=()=>{ visibleMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1); selectedKey=null; state.page='calendar'; render(); };
    card.addEventListener('click',open);
    card.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault();open();} });
  }

  function installStyles() {
    if (document.getElementById('sn63-calendar-styles')) return;
    const style=document.createElement('style'); style.id='sn63-calendar-styles'; style.textContent=`
      .sn63-streak-entry{position:relative;cursor:pointer;transition:transform .16s ease,box-shadow .16s ease;padding-right:42px}
      .sn63-streak-entry:hover{transform:translateY(-1px);box-shadow:0 16px 38px rgba(18,18,18,.10)}
      .sn63-streak-entry:active{transform:scale(.99)}
      .sn63-streak-entry:focus-visible{outline:3px solid rgba(59,130,246,.28);outline-offset:3px}
      .sn63-streak-chevron{position:absolute;right:16px;top:50%;transform:translateY(-50%);color:#8A9098;display:grid;place-items:center}
      .sn63-calendar-page{padding-bottom:18px}.sn63-topbar{display:flex;align-items:center;gap:12px;margin-bottom:18px}.sn63-topbar h1{font-size:30px;letter-spacing:-1px;margin:4px 0 0}.sn63-back,.sn63-month-btn{border:1px solid var(--line);background:var(--surface);color:var(--text);display:grid;place-items:center}.sn63-back{width:42px;height:42px;border-radius:14px}.sn63-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:14px 10px;margin-bottom:14px}.sn63-summary>div{display:grid;justify-items:center;text-align:center;gap:3px;min-width:0}.sn63-summary-icon,.sn63-summary-svg{width:28px;height:28px;border-radius:9px;display:grid;place-items:center;background:#F5F7F8}.sn63-summary-icon.fire{font-size:20px;background:#F1F9DD}.sn63-summary strong{font-size:19px;line-height:1}.sn63-summary small{font-size:9px;color:var(--muted);line-height:1.15;font-weight:700}.sn63-calendar-card{padding:14px}.sn63-month-head{display:grid;grid-template-columns:38px 1fr 38px;align-items:center;gap:8px;margin-bottom:14px}.sn63-month-head h2{text-align:center;font-size:18px;margin:0}.sn63-month-btn{width:38px;height:38px;border-radius:12px}.sn63-month-btn:disabled{opacity:.28;cursor:default}.sn63-weekdays,.sn63-month-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:5px}.sn63-weekdays{margin-bottom:6px}.sn63-weekdays span{text-align:center;font-size:9px;font-weight:800;color:#9AA0A7}.sn63-day{min-width:0;height:58px;border:1px solid transparent;border-radius:12px;background:transparent;color:var(--text);padding:5px 2px;display:grid;grid-template-rows:auto 14px auto;justify-items:center;align-content:start;gap:1px;position:relative}.sn63-day.blank{pointer-events:none}.sn63-date{font-size:12px;font-weight:800}.sn63-day-mark{height:14px;display:grid;place-items:center}.sn63-day small{font-size:7px;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--muted)}.sn63-day.completed{background:#F5FAE8;border-color:#DCECB6}.sn63-day.completed .sn63-day-mark{color:#78A91E}.sn63-day.rest{background:#F3F7FD;color:#486B9A}.sn63-day.rest .sn63-day-mark{color:#6A96D3}.sn63-day.missed{background:#FFF8F8;border-color:#F4DADA}.sn63-day.missed .sn63-day-mark{color:#D66A6D}.sn63-day.scheduled{background:#F6F9FF;border-color:#D8E6FF}.sn63-day.scheduled .sn63-day-mark{width:6px;height:6px;border-radius:99px;background:#76A7F7;margin-top:4px}.sn63-day.scheduled .sn63-day-mark svg{display:none}.sn63-day.today::after{content:"";position:absolute;inset:-2px;border:2px solid var(--blue);border-radius:14px;pointer-events:none}.sn63-day.selected{box-shadow:0 0 0 2px rgba(23,23,23,.12)}.sn63-legend{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:12px;padding-top:11px;border-top:1px solid var(--line);font-size:9px;color:var(--muted);font-weight:700}.sn63-legend span{display:inline-flex;align-items:center;gap:4px}.sn63-legend i{width:8px;height:8px;border-radius:50%;display:inline-block}.sn63-legend i.completed{background:#9BCB3B}.sn63-legend i.rest{background:#8DB4E8}.sn63-legend i.missed{background:#E58A8D}.sn63-legend i.scheduled{background:#76A7F7}.sn63-day-detail{margin-top:12px}.sn63-detail-card{border:1px solid var(--line);border-radius:20px;background:var(--surface);padding:16px;box-shadow:var(--shadow)}.sn63-detail-date{font-size:11px;color:var(--muted);font-weight:700;margin-bottom:8px}.sn63-detail-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px}.sn63-detail-head h3,.sn63-detail-card h3{font-size:20px;margin:0 0 5px}.sn63-status{font-size:11px;font-weight:800}.sn63-status.good{color:#719F20}.sn63-status.rest{color:#5F8AC5}.sn63-status.missed{color:#C66064}.sn63-status.scheduled{color:var(--blue)}.sn63-detail-card p{font-size:12px;color:var(--muted);line-height:1.5;margin:11px 0 0}.sn63-detail-metrics{display:flex;flex-wrap:wrap;gap:7px;margin-top:13px}.sn63-detail-metrics span{font-size:10px;font-weight:700;background:#F5F6F7;border-radius:999px;padding:7px 9px}.sn63-activity{margin-top:20px}.sn63-activity .section-title-row{margin-bottom:10px}.sn63-activity-list{display:grid;gap:8px}.sn63-activity-row{width:100%;border:1px solid var(--line);border-radius:16px;background:var(--surface);padding:11px 12px;display:grid;grid-template-columns:34px 1fr;gap:10px;align-items:center;text-align:left;color:var(--text)}.sn63-activity-icon{width:32px;height:32px;border-radius:10px;display:grid;place-items:center}.sn63-activity-icon.completed{background:#F1F8DD;color:#719F20}.sn63-activity-icon.rest{background:#EEF5FF;color:#5F8AC5}.sn63-activity-icon.missed{background:#FFF0F0;color:#C66064}.sn63-activity-row strong,.sn63-activity-row span{display:block}.sn63-activity-row strong{font-size:12px}.sn63-activity-row span{font-size:10px;color:var(--muted);margin-top:3px}.sn63-empty{padding:24px 14px;text-align:center;border:1px dashed var(--line);border-radius:18px}.sn63-empty strong,.sn63-empty span{display:block}.sn63-empty strong{font-size:14px}.sn63-empty span{font-size:11px;color:var(--muted);margin-top:5px}.dark .sn63-summary-icon,.dark .sn63-summary-svg,.dark .sn63-detail-metrics span{background:#24272A}.dark .sn63-day.completed{background:#1C2415;border-color:#34471F}.dark .sn63-day.rest{background:#172130}.dark .sn63-day.missed{background:#2A191A;border-color:#4D292B}.dark .sn63-day.scheduled{background:#172235;border-color:#2A4166}@media(max-width:390px){.sn63-summary{gap:3px;padding:12px 6px}.sn63-summary small{font-size:8px}.sn63-weekdays,.sn63-month-grid{gap:3px}.sn63-day{height:54px;border-radius:10px}.sn63-day small{font-size:6.5px}}
    `; document.head.appendChild(style);
  }

  installStyles();
  const previousRender = window.render;
  window.render = function(...args) {
    if (state.page === 'calendar') { navActive?.(); renderCalendar(); return; }
    const result = previousRender.apply(this,args);
    if (state.page === 'home') enhanceHomeCard();
    return result;
  };
  if (state.page === 'home') enhanceHomeCard();
  window.START_NOW_WORKOUT_CALENDAR = { version:'v63', render:renderCalendar, calculateStreaks };
})();