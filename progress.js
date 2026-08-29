// START/NOW progress tracking enhancements.
// Tracks performance-focused workout history locally and upgrades the Progress tab.
(() => {
  const PROGRESS_KEY = "sn_progress_sessions";
  const MAX_HISTORY = 180;

  function loadProgressSessions(){
    if(window.SN36?.sessions) return window.SN36.sessions();
    try{
      const value = JSON.parse(localStorage.getItem(PROGRESS_KEY));
      return Array.isArray(value) ? value : [];
    }catch{
      return [];
    }
  }

  function saveProgressSessions(sessions){
    if(window.SN36?.saveSessions) return window.SN36.saveSessions(sessions);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(sessions.slice(-MAX_HISTORY)));
  }

  function clampNumber(value, min, max, fallback=0){
    const n = Number(value);
    if(!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  function formatNumber(value){
    return Math.round(value).toLocaleString();
  }

  function startOfDay(date){
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  }

  function dateLabel(timestamp){
    return new Date(timestamp).toLocaleDateString(undefined, {month:"short",day:"numeric"});
  }

  function weekdayLabel(timestamp){
    return new Date(timestamp).toLocaleDateString(undefined, {weekday:"short"});
  }

  function getScheduledTarget(){
    try{
      const days = new Set((state.customWorkouts || []).flatMap(workout => workout.days || []));
      return days.size || 4;
    }catch{
      return 4;
    }
  }

  function sessionsWithinDays(sessions, days){
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return sessions.filter(session => session.timestamp >= cutoff);
  }

  function getWorkoutGrade(session){
    return clampNumber(session.grade, 0, 100, 0);
  }

  function captureVisibleSetInputs(){
    if(state.page !== "activeWorkout" || !state.activeWorkout) return;
    state.__progressLiveSets ||= {};
    document.querySelectorAll(".set-grid input[type='number']").forEach(input => {
      const label = input.getAttribute("aria-label") || "";
      const match = label.match(/(Weight|Reps) for set (\d+)/i);
      if(!match) return;
      const field = match[1].toLowerCase();
      const setIndex = Number(match[2]) - 1;
      const key = `${state.workoutIndex}:${setIndex}`;
      state.__progressLiveSets[key] ||= {};
      state.__progressLiveSets[key][field] = clampNumber(input.value, 0, 10000, 0);
    });
  }

  document.addEventListener("input", event => {
    const input = event.target;
    if(!(input instanceof HTMLInputElement)) return;
    if(state.page !== "activeWorkout" || !input.matches(".set-grid input[type='number']")) return;
    captureVisibleSetInputs();
  });

  const originalStartWorkout = startWorkout;
  startWorkout = function(workout){
    state.__progressStartTime = Date.now();
    state.__progressLiveSets = {};
    state.__progressRecorded = false;
    return originalStartWorkout(workout);
  };

  function buildSession(){
    const workout = state.activeWorkout;
    if(!workout || !Array.isArray(workout.exercises)) return null;

    captureVisibleSetInputs();

    let plannedSets = 0;
    let completedSetCount = 0;
    let volume = 0;
    const exerciseResults = workout.exercises.map((exercise, exerciseIndex) => {
      const sets = Math.max(1, Number(exercise.sets) || 1);
      plannedSets += sets;
      let completedForExercise = 0;
      let exerciseVolume = 0;
      let bestWeight = 0;
      const setResults = [];

      for(let setIndex=0; setIndex<sets; setIndex++){
        const done = Boolean(state.completedSets?.[exerciseIndex]?.[setIndex]);
        const live = state.__progressLiveSets?.[`${exerciseIndex}:${setIndex}`] || {};
        const weight = clampNumber(live.weight ?? exercise.weight ?? 0, 0, 10000, 0);
        const reps = clampNumber(live.reps ?? exercise.reps ?? 0, 0, 500, 0);
        if(done){
          completedSetCount += 1;
          completedForExercise += 1;
          exerciseVolume += weight * reps;
          volume += weight * reps;
          bestWeight = Math.max(bestWeight, weight);
        }
        setResults.push({done, weight, reps});
      }

      return {
        id: exercise.id || String(exercise.name || "exercise").toLowerCase().replace(/[^a-z0-9]+/g,"-"),
        name: exercise.name || "Exercise",
        muscle: exercise.muscle || "Other",
        completedSets: completedForExercise,
        plannedSets: sets,
        bestWeight,
        volume: Math.round(exerciseVolume),
        sets: setResults
      };
    });

    const completion = plannedSets ? Math.round((completedSetCount / plannedSets) * 100) : 0;
    const grade = Math.max(72, Math.min(98, 78 + Math.round(completion * 0.2)));
    const started = Number(state.__progressStartTime) || Date.now();
    const durationMinutes = Math.max(1, Math.round((Date.now() - started) / 60000));

    return {
      id: `${Date.now()}-${state.completedWorkouts}`,
      timestamp: Date.now(),
      workoutId: workout.id || "workout",
      workoutName: workout.name || "Workout",
      grade,
      completion,
      completedSets: completedSetCount,
      plannedSets,
      volume: Math.round(volume),
      durationMinutes,
      exercises: exerciseResults
    };
  }

  function recordCurrentWorkout(){
    if(state.__progressRecorded) return;
    const session = buildSession();
    if(!session) return;
    const sessions = loadProgressSessions();
    sessions.push(session);
    saveProgressSessions(sessions);
    state.__progressRecorded = true;
  }

  const originalRenderSummary = renderSummary;
  renderSummary = function(){
    recordCurrentWorkout();
    return originalRenderSummary();
  };

  function gradeLetter(score){
    if(score >= 90) return "A";
    if(score >= 80) return "B";
    if(score >= 70) return "C";
    if(score >= 60) return "D";
    return "F";
  }

  function getPersonalRecords(sessions){
    const records = new Map();
    sessions.forEach(session => {
      (session.exercises || []).forEach(exercise => {
        if(!exercise.bestWeight) return;
        const current = records.get(exercise.id);
        if(!current || exercise.bestWeight > current.weight){
          records.set(exercise.id, {
            name: exercise.name,
            muscle: exercise.muscle,
            weight: exercise.bestWeight,
            timestamp: session.timestamp
          });
        }
      });
    });
    return [...records.values()].sort((a,b) => b.weight - a.weight);
  }

  function muscleSetTotals(sessions){
    if(window.SN36?.muscleActivity) return window.SN36.muscleActivity(sessions).map(item => [item.muscle, item.activity]);
    const totals = new Map();
    sessions.forEach(session => {
      (session.exercises || []).forEach(exercise => {
        const muscle = exercise.muscle || "Other";
        totals.set(muscle, (totals.get(muscle) || 0) + (exercise.completedSets || 0));
      });
    });
    return [...totals.entries()].sort((a,b) => b[1] - a[1]);
  }

  function lastSevenDays(sessions){
    const today = new Date();
    const items = [];
    for(let offset=6; offset>=0; offset--){
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
      const dayStart = startOfDay(date);
      const nextDay = dayStart + 86400000;
      const count = sessions.filter(session => session.timestamp >= dayStart && session.timestamp < nextDay).length;
      items.push({
        label: date.toLocaleDateString(undefined,{weekday:"narrow"}),
        full: date.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"}),
        count,
        today: offset === 0
      });
    }
    return items;
  }

  function progressInsight(weekSessions, target, records){
    if(!loadProgressSessions().length){
      return "Finish your next workout to start building real trends, personal records, and muscle-group history here.";
    }
    if(weekSessions.length < target){
      const remaining = target - weekSessions.length;
      return `${remaining} workout${remaining===1?"":"s"} left to match your current weekly schedule target.`;
    }
    if(records.length){
      return `You’ve matched your weekly target. Keep logging sets so START/NOW can spot new strength PRs automatically.`;
    }
    return "You’ve matched your weekly target. Keep the streak going with quality sessions and controlled reps.";
  }

  renderProgress = function(){
    const sessions = loadProgressSessions().sort((a,b) => a.timestamp - b.timestamp);
    const recentFirst = [...sessions].reverse();
    const weekSessions = sessionsWithinDays(sessions, 7);
    const monthSessions = sessionsWithinDays(sessions, 30);
    const target = getScheduledTarget();
    const targetPercent = Math.min(100, Math.round((weekSessions.length / Math.max(1,target)) * 100));
    const weekSets = weekSessions.reduce((sum,session) => sum + (session.completedSets || 0), 0);
    const weekMinutes = weekSessions.reduce((sum,session) => sum + (session.durationMinutes || 0), 0);
    const weekVolume = weekSessions.reduce((sum,session) => sum + (session.volume || 0), 0);
    const loggedAverage = sessions.length ? Math.round(sessions.reduce((sum,s)=>sum+getWorkoutGrade(s),0)/sessions.length) : null;
    const fallbackGrade = Math.min(98, 82 + state.completedWorkouts);
    const overallGrade = loggedAverage ?? fallbackGrade;
    const records = getPersonalRecords(sessions);
    const muscles = muscleSetTotals(monthSessions).slice(0,6);
    const maxMuscleSets = Math.max(1, ...muscles.map(item=>item[1]));
    const trend = sessions.slice(-6);
    const weekDays = lastSevenDays(sessions);
    const recent = recentFirst.slice(0,5);

    app.innerHTML = `
      <div class="topbar"><div class="logo">START/<span>NOW</span></div><button class="avatar" data-go="profile">MG</button></div>
      <div class="progress-title-row">
        <div>
          <div class="eyebrow">YOUR TRAINING</div>
          <h1 class="page-title compact-title">Progress</h1>
        </div>
        <div class="progress-grade-pill"><strong>${gradeLetter(overallGrade)}</strong><span>${overallGrade}%</span></div>
      </div>

      <section class="progress-overview-grid">
        <div class="card progress-stat-card accent-coral">
          <span class="progress-stat-label">This week</span>
          <strong>${weekSessions.length}<small> / ${target}</small></strong>
          <span>workouts</span>
        </div>
        <div class="card progress-stat-card accent-blue">
          <span class="progress-stat-label">Training time</span>
          <strong>${weekMinutes}<small> min</small></strong>
          <span>last 7 days</span>
        </div>
        <div class="card progress-stat-card accent-lime">
          <span class="progress-stat-label">Completed sets</span>
          <strong>${weekSets}</strong>
          <span>last 7 days</span>
        </div>
        <div class="card progress-stat-card accent-gold">
          <span class="progress-stat-label">Current streak</span>
          <strong>${state.streak}<small> days</small></strong>
          <span>keep showing up</span>
        </div>
      </section>

      <section class="card progress-section-card consistency-card">
        <div class="progress-section-head">
          <div><span class="section-kicker lime">CONSISTENCY</span><h2>Weekly activity</h2></div>
          <div class="progress-ring-small" style="--progress:${targetPercent*3.6}deg"><span>${targetPercent}%</span></div>
        </div>
        <div class="activity-week">
          ${weekDays.map(day=>`<div class="activity-day ${day.count?"active":""} ${day.today?"today":""}" title="${day.full}"><div class="activity-dot">${day.count?'<span data-sn-icon="check" data-sn-size="14" data-sn-stroke="2.5" aria-hidden="true"></span>':""}</div><span>${day.label}</span></div>`).join("")}
        </div>
        <p class="progress-insight">${progressInsight(weekSessions,target,records)}</p>
      </section>

      <section class="card progress-section-card">
        <div class="progress-section-head">
          <div><span class="section-kicker coral-text">WORKOUT QUALITY</span><h2>Grade trend</h2></div>
          <span class="section-meta">Last ${trend.length || 0} logged</span>
        </div>
        ${trend.length ? `
          <div class="grade-trend-chart" aria-label="Recent workout grade trend">
            ${trend.map(session=>`<div class="grade-bar-wrap"><div class="grade-value">${session.grade}%</div><div class="grade-bar-track"><div class="grade-bar-fill" style="height:${Math.max(10,session.grade)}%"></div></div><span>${weekdayLabel(session.timestamp)}</span></div>`).join("")}
          </div>` : `
          <div class="progress-empty"><strong>No grade history yet</strong><span>Your next finished workout will appear here.</span></div>`}
      </section>

      <section class="card progress-section-card">
        <div class="progress-section-head">
          <div><span class="section-kicker blue">STRENGTH</span><h2>Personal records</h2></div>
          <span class="section-meta">Heaviest logged set</span>
        </div>
        ${records.length ? `<div class="pr-list">${records.slice(0,5).map((record,index)=>`
          <div class="pr-row">
            <div class="pr-rank">${index+1}</div>
            <div class="pr-copy"><strong>${escapeHtml(record.name)}</strong><span>${escapeHtml(record.muscle)} • ${dateLabel(record.timestamp)}</span></div>
            <div class="pr-weight">${formatNumber(record.weight)} <small>lb</small></div>
          </div>`).join("")}</div>` : `
          <div class="progress-empty"><strong>No PRs yet</strong><span>Complete weighted sets and START/NOW will save your best lifts here.</span></div>`}
      </section>

      <section class="card progress-section-card">
        <div class="progress-section-head">
          <div><span class="section-kicker gold">TRAINING BALANCE</span><h2>Muscle groups</h2></div>
          <span class="section-meta">Last 30 days</span>
        </div>
        ${muscles.length ? `<div class="muscle-progress-list">${muscles.map(([muscle,sets])=>`
          <div class="muscle-progress-row"><div class="muscle-progress-label"><span>${escapeHtml(muscle)}</span><strong>${sets} sets</strong></div><div class="muscle-progress-track"><div class="muscle-progress-fill" style="width:${Math.round((sets/maxMuscleSets)*100)}%"></div></div></div>`).join("")}</div>` : `
          <div class="progress-empty"><strong>No muscle-group history yet</strong><span>Logged sets will show which areas you’ve trained most.</span></div>`}
      </section>

      <section class="card progress-section-card volume-card">
        <div class="progress-section-head">
          <div><span class="section-kicker blue">TRAINING LOAD</span><h2>Volume this week</h2></div>
          <strong class="volume-number">${formatNumber(weekVolume)} <small>lb</small></strong>
        </div>
        <p class="progress-helper">Volume is weight × reps for completed weighted sets. Use it as one performance signal—not a score you have to maximize every workout.</p>
      </section>

      <section class="progress-recent-section">
        <div class="section-title-row"><h2>Recent workouts</h2><span>${state.completedWorkouts} total</span></div>
        ${recent.length ? `<div class="recent-session-list">${recent.map(session=>`
          <div class="card recent-session-row">
            <div class="recent-grade ${session.grade>=90?"great":session.grade>=80?"good":"steady"}">${gradeLetter(session.grade)}</div>
            <div class="recent-session-copy"><strong>${escapeHtml(session.workoutName)}</strong><span>${dateLabel(session.timestamp)} • ${session.completedSets}/${session.plannedSets} sets • ${session.durationMinutes} min</span></div>
            <div class="recent-score">${session.grade}%</div>
          </div>`).join("")}</div>` : `
          <div class="card progress-empty standalone"><strong>Your workout history starts now</strong><span>Finish a workout and it’ll show up here automatically.</span></div>`}
      </section>

      <section class="card progress-section-card">
        <div class="progress-section-head"><div><span class="section-kicker gold">ACHIEVEMENTS</span><h2>Milestones</h2></div></div>
        <div class="achievement-mini-grid">
          <div class="achievement-mini ${state.streak>=7?"unlocked completed":"locked"}" data-achievement-id="streak-7">
            <div class="milestone-icon milestone-icon-coral" data-sn-icon="flame" data-sn-size="26" data-sn-stroke="2.1" aria-hidden="true"></div>
            <strong>7-day streak</strong><small>${state.streak>=7?"Unlocked":"Keep going"}</small>
            ${state.streak>=7?'<div class="milestone-complete" data-sn-icon="check" data-sn-size="13" data-sn-stroke="2.6" aria-hidden="true"></div>':""}
          </div>
          <div class="achievement-mini ${state.completedWorkouts>=5?"unlocked completed":"locked"}" data-achievement-id="first-five">
            <div class="milestone-icon milestone-icon-gold" data-sn-icon="trophy" data-sn-size="26" data-sn-stroke="2.1" aria-hidden="true"></div>
            <strong>First five</strong><small>${state.completedWorkouts>=5?"Unlocked":"Complete 5 workouts"}</small>
            ${state.completedWorkouts>=5?'<div class="milestone-complete" data-sn-icon="check" data-sn-size="13" data-sn-stroke="2.6" aria-hidden="true"></div>':""}
          </div>
          <div class="achievement-mini ${records.length>=3?"unlocked completed":"locked"}" data-achievement-id="strength-prs-3">
            <div class="milestone-icon milestone-icon-blue" data-sn-icon="trendingUp" data-sn-size="26" data-sn-stroke="2.1" aria-hidden="true"></div>
            <strong>3 strength PRs</strong><small>${records.length>=3?"Unlocked":"Log your lifts"}</small>
            ${records.length>=3?'<div class="milestone-complete" data-sn-icon="check" data-sn-size="13" data-sn-stroke="2.6" aria-hidden="true"></div>':""}
          </div>
        </div>
      </section>
    `;
    bindCommon();
  };
})();
