// START/NOW v22 — transparent, stricter workout grading with +/- grades.
(() => {
  const PROGRESS_KEY = "sn_progress_sessions";

  function clamp(value, min=0, max=100){
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : min;
  }

  function loadSessions(){
    if(window.SN36?.sessions) return window.SN36.sessions();
    try{
      const value = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    }catch{
      return [];
    }
  }

  function saveSessions(sessions){
    if(window.SN36?.saveSessions) return window.SN36.saveSessions(sessions);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(sessions.slice(-180)));
  }

  function gradeLetter(score){
    score = Math.round(clamp(score));
    if(score >= 97) return "A+";
    if(score >= 93) return "A";
    if(score >= 90) return "A-";
    if(score >= 87) return "B+";
    if(score >= 83) return "B";
    if(score >= 80) return "B-";
    if(score >= 77) return "C+";
    if(score >= 73) return "C";
    if(score >= 70) return "C-";
    if(score >= 67) return "D+";
    if(score >= 63) return "D";
    if(score >= 60) return "D-";
    return "F";
  }

  function todayName(){
    return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()];
  }

  function liveSet(exerciseIndex, setIndex, exercise){
    const live = state.__progressLiveSets?.[`${exerciseIndex}:${setIndex}`] || {};
    return {
      reps: Math.max(0, Number(live.reps ?? exercise.reps ?? 0) || 0),
      weight: Math.max(0, Number(live.weight ?? exercise.weight ?? 0) || 0)
    };
  }

  function calculateWorkoutGrade(){
    const workout = state.activeWorkout || getTodayWorkout();
    const exercises = workout?.exercises || [];
    let plannedSets = 0;
    let completedSets = 0;
    let repRatioTotal = 0;
    let repRatioCount = 0;
    let loggedCompletedSets = 0;

    exercises.forEach((exercise, exerciseIndex) => {
      const sets = Math.max(1, Number(exercise.sets) || 1);
      const plannedReps = Math.max(1, Number(exercise.reps) || 1);
      plannedSets += sets;

      for(let setIndex=0; setIndex<sets; setIndex++){
        const done = Boolean(state.completedSets?.[exerciseIndex]?.[setIndex]);
        if(!done) continue;

        completedSets += 1;
        const live = liveSet(exerciseIndex, setIndex, exercise);
        const repRatio = Math.min(1, live.reps / plannedReps);
        repRatioTotal += repRatio;
        repRatioCount += 1;
        if(live.reps > 0) loggedCompletedSets += 1;
      }
    });

    const completion = plannedSets ? (completedSets / plannedSets) * 100 : 0;
    const repAdherence = repRatioCount ? (repRatioTotal / repRatioCount) * 100 : 0;
    const logging = completedSets ? (loggedCompletedSets / completedSets) * 100 : 0;

    const scheduledDays = Array.isArray(workout?.days) ? workout.days : [];
    const scheduleMatch = !scheduledDays.length ? 100 : scheduledDays.includes(todayName()) ? 100 : 60;

    // Deliberately no points for lifting heavier, training longer, or doing extra sets.
    // The grade rewards following the plan well, not overdoing the workout.
    const score = Math.round(
      completion * 0.65 +
      repAdherence * 0.20 +
      logging * 0.10 +
      scheduleMatch * 0.05
    );

    return {
      score: clamp(score),
      letter: gradeLetter(score),
      completion: Math.round(completion),
      repAdherence: Math.round(repAdherence),
      logging: Math.round(logging),
      scheduleMatch: Math.round(scheduleMatch),
      completedSets,
      plannedSets
    };
  }

  function updateLatestRecordedSession(result){
    const sessions = loadSessions();
    if(!sessions.length) return;
    const latest = sessions[sessions.length - 1];
    latest.grade = result.score;
    latest.gradeLetter = result.letter;
    latest.gradeBreakdown = {
      completion: result.completion,
      repAdherence: result.repAdherence,
      logging: result.logging,
      scheduleMatch: result.scheduleMatch
    };
    saveSessions(sessions);
  }

  function renderStrictSummary(result){
    const workout = state.activeWorkout || getTodayWorkout();
    app.innerHTML = `
      <section class="summary">
        <div class="eyebrow">${escapeHtml(workout.name)} complete</div>
        <div class="big-grade">${result.letter}</div>
        <h2>${result.score}% workout grade</h2>
        <p>This grade measures how closely you completed the workout you planned. It does <strong>not</strong> reward lifting dangerously heavy, rushing, or adding unnecessary sets.</p>

        <div class="reason-list">
          <div class="reason"><strong>✅ Completion — 65%</strong>${result.completedSets}/${result.plannedSets} planned sets completed (${result.completion}%). This is the biggest part of the grade.</div>
          <div class="reason"><strong>🎯 Rep targets — 20%</strong>${result.repAdherence}% of your planned rep targets were hit on completed sets.</div>
          <div class="reason"><strong>📝 Logging — 10%</strong>${result.logging}% of completed sets had usable rep data. Logging helps Level Up Fitness understand what you actually did.</div>
          <div class="reason"><strong>📅 Schedule — 5%</strong>${result.scheduleMatch === 100 ? "Workout matched today’s schedule." : "Workout was completed on a different day than scheduled."}</div>
        </div>

        <div class="tip" style="margin:16px 0">
          <strong>How +/- grades work</strong>
          <p>A+ 97–100 • A 93–96 • A− 90–92 • B+ 87–89 • B 83–86 • B− 80–82 • C+ 77–79 • C 73–76 • C− 70–72 • D range 60–69 • F below 60.</p>
        </div>

        <button class="primary" id="finishSummary">Back to Home</button>
      </section>`;

    document.getElementById("finishSummary").onclick = () => {
      state.activeWorkout = null;
      state.page = "home";
      render();
    };
  }

  // progress.js records the session first; then replace the old lenient summary
  // with the strict transparent grade and correct the recorded grade.
  const previousRenderSummary = renderSummary;
  renderSummary = function(){
    previousRenderSummary();
    const result = calculateWorkoutGrade();
    updateLatestRecordedSession(result);
    renderStrictSummary(result);
  };

  function overallGrade(){
    const sessions = loadSessions().slice(-8);
    if(!sessions.length) return null;

    const quality = sessions.reduce((sum, session) => sum + clamp(session.grade), 0) / sessions.length;
    const scheduledDays = new Set((state.customWorkouts || []).flatMap(workout => workout.days || []));
    const target = Math.max(1, scheduledDays.size || 3);
    const cutoff = Date.now() - 7 * 86400000;
    const recentCount = loadSessions().filter(session => Number(session.timestamp) >= cutoff).length;
    const consistency = Math.min(100, (recentCount / target) * 100);
    const score = Math.round(quality * 0.85 + consistency * 0.15);
    return { score, letter: gradeLetter(score) };
  }

  const previousRenderProgress = renderProgress;
  renderProgress = function(){
    previousRenderProgress();
    const grade = overallGrade();
    const pill = document.querySelector(".progress-grade-pill");
    if(pill){
      pill.innerHTML = grade ? `<strong>${grade.letter}</strong><span>${grade.score}%</span>` : `<strong>—</strong><span>No grade yet</span>`;
    }
  };

  const previousRenderProfile = renderProfile;
  renderProfile = function(){
    previousRenderProfile();
    const grade = overallGrade();
    document.querySelectorAll(".toggle-row").forEach(row => {
      const label = row.querySelector("span");
      if(label?.textContent.trim() !== "Overall grade") return;
      const value = row.querySelector("strong");
      if(value) value.textContent = grade ? `${grade.letter} • ${grade.score}%` : "Not graded yet";
    });
  };
})();
