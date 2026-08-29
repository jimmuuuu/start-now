// START/NOW v24 — derive streaks and completed-workout counts from real workout history.
(() => {
  const PROGRESS_KEY = "sn_progress_sessions";
  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function loadSessions(){
    if(window.SN36?.sessions) return window.SN36.sessions();
    try{
      const value = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "[]");
      return Array.isArray(value) ? value.filter(session => Number(session?.timestamp) > 0) : [];
    }catch{
      return [];
    }
  }

  function startOfDay(value){
    const date = value instanceof Date ? value : new Date(value);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function dayKey(value){
    const date = startOfDay(value);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function sessionDaySet(sessions){
    return new Set(sessions.map(session => dayKey(Number(session.timestamp))));
  }

  function scheduledDaySet(){
    const days = new Set();
    (state.customWorkouts || []).forEach(workout => {
      (workout.days || []).forEach(day => {
        if(DAY_NAMES.includes(day)) days.add(day);
      });
    });
    return days;
  }

  function scheduledStreak(completedDays, schedule){
    if(!completedDays.size) return 0;

    const today = startOfDay(new Date());
    let streak = 0;
    let cursor = new Date(today);

    // Look back far enough to cover normal workout schedules without scanning forever.
    for(let offset = 0; offset < 180; offset++){
      const dayName = DAY_NAMES[cursor.getDay()];
      const isScheduled = schedule.has(dayName);

      if(isScheduled){
        const completed = completedDays.has(dayKey(cursor));

        // A workout scheduled for today is still available to complete, so it does not
        // break an existing streak before the day is over.
        if(offset === 0 && !completed){
          cursor.setDate(cursor.getDate() - 1);
          continue;
        }

        if(completed) streak += 1;
        else break;
      }

      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }

  function unscheduledStreak(completedDays){
    if(!completedDays.size) return 0;

    const today = startOfDay(new Date());
    let cursor = new Date(today);
    let streak = 0;

    // If there is no formal schedule, use consecutive calendar workout days.
    // Today does not break the streak if the user simply has not trained yet.
    if(!completedDays.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);

    for(let offset = 0; offset < 180; offset++){
      if(completedDays.has(dayKey(cursor))) streak += 1;
      else break;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }

  function calculateRealStats(){
    const sessions = loadSessions();
    const completedDays = sessionDaySet(sessions);
    if(window.SN36?.streaks){
      const result = window.SN36.streaks(sessions, window.SN36.workouts?.());
      return { sessions, completedDays, streak:result.current, completedWorkouts:sessions.length };
    }
    const schedule = scheduledDaySet();
    const streak = schedule.size
      ? scheduledStreak(completedDays, schedule)
      : unscheduledStreak(completedDays);

    return {
      sessions,
      completedDays,
      streak,
      completedWorkouts: sessions.length
    };
  }

  function syncRealStats(){
    const stats = calculateRealStats();
    state.streak = stats.streak;
    state.completedWorkouts = stats.completedWorkouts;

    // Keep the legacy values accurate too, because older UI code still reads these keys.
    localStorage.setItem("sn_streak", String(stats.streak));
    localStorage.setItem("sn_completed", String(stats.completedWorkouts));
    return stats;
  }

  function patchHomeStreak(){
    const stats = calculateRealStats();
    const card = document.querySelector(".streak-card");
    if(!card) return;

    const title = card.querySelector(".streak-row strong");
    const value = card.querySelector(".streak-row .lime");
    if(title) title.textContent = stats.streak > 0 ? "You’re on fire!" : "Start your streak";
    if(value) value.textContent = `${stats.streak} day streak`;

    const days = card.querySelector(".days");
    if(days){
      const today = startOfDay(new Date());
      const cells = [];
      for(let offset = 6; offset >= 0; offset--){
        const date = new Date(today);
        date.setDate(today.getDate() - offset);
        const completed = stats.completedDays.has(dayKey(date));
        const label = DAY_NAMES[date.getDay()].slice(0, 1);
        cells.push(`<div class="day ${completed ? "done" : ""}" title="${DAY_NAMES[date.getDay()]}">${completed ? "✓" : label}</div>`);
      }
      days.innerHTML = cells.join("");
    }
  }

  // The base app used to increment streak/completed counts directly at workout finish.
  // Recalculate from the saved finished-session history immediately afterward instead.
  const previousRenderSummary = renderSummary;
  renderSummary = function(){
    const result = previousRenderSummary();
    syncRealStats();
    return result;
  };

  const previousRenderHome = renderHome;
  renderHome = function(){
    syncRealStats();
    const result = previousRenderHome();
    patchHomeStreak();
    return result;
  };

  const previousRenderProgress = renderProgress;
  renderProgress = function(){
    syncRealStats();
    return previousRenderProgress();
  };

  const previousRenderProfile = renderProfile;
  renderProfile = function(){
    syncRealStats();
    return previousRenderProfile();
  };

  // Correct the old placeholder values (12-day streak / 6 completed workouts) as soon
  // as this version loads, then redraw the current page using real history only.
  syncRealStats();
  render();
})();
