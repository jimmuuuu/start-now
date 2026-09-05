// Keeps the newest generated beginner routine as the user's active plan.
// Loaded after beginner-plan.js so newly generated plans immediately drive the Home tab.
(() => {
  const originalRenderHome = renderHome;
  const originalRenderWorkouts = renderWorkouts;
  const WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function planStamp(workout) {
    const match = String(workout?.id || "").match(/^starter-plan-(\d+)-/);
    return match ? Number(match[1]) : 0;
  }

  function getActivePlan() {
    const generated = state.customWorkouts.filter(workout => workout.beginnerGenerated && planStamp(workout));
    if (!generated.length) return null;

    const newestStamp = Math.max(...generated.map(planStamp));
    const workouts = generated
      .filter(workout => planStamp(workout) === newestStamp)
      .sort((a, b) => {
        const aDay = WEEK.indexOf((a.days || [])[0]);
        const bDay = WEEK.indexOf((b.days || [])[0]);
        return aDay - bDay;
      });

    if (!workouts.length) return null;
    return {
      id: `starter-plan-${newestStamp}`,
      name: "My Level Up Fitness Plan",
      stamp: newestStamp,
      workouts
    };
  }

  function activeWorkoutForDay(plan, day) {
    return plan?.workouts.find(workout => (workout.days || []).includes(day)) || null;
  }

  function nextWorkout(plan) {
    if (!plan?.workouts?.length) return null;
    const todayIndex = new Date().getDay();
    let best = null;

    plan.workouts.forEach(workout => {
      const day = (workout.days || [])[0];
      const index = WEEK.indexOf(day);
      if (index < 0) return;
      let offset = (index - todayIndex + 7) % 7;
      if (offset === 0) offset = 7;
      if (!best || offset < best.offset) best = { workout, day, offset };
    });

    return best;
  }

  renderHome = function () {
    const plan = getActivePlan();
    if (!plan) {
      originalRenderHome();
      return;
    }

    const todayName = dayName();
    const todayWorkout = activeWorkoutForDay(plan, todayName);
    const next = todayWorkout ? null : nextWorkout(plan);

    app.innerHTML = `
      <div class="topbar">
        <div class="logo">LEVEL <span>UP</span></div>
        <button class="avatar" data-go="profile">MG</button>
      </div>

      <section class="hero-copy">
        <div class="eyebrow">${escapeHtml(greetingForTime())}</div>
        <h1>Let’s get stronger today.</h1>
      </section>

      <section class="card plan-card active-main-plan ${todayWorkout ? "" : "rest-plan-card"}">
        <div class="current-plan-pill">CURRENT PLAN</div>
        <div class="card-label">${todayWorkout ? "🏋 TODAY’S WORKOUT" : "✓ TODAY’S PLAN"}</div>
        <div class="plan-grid">
          <div>
            <h2>${todayWorkout ? escapeHtml(todayWorkout.name) : "No workout today"}</h2>
            <div class="meta">${todayWorkout
              ? `${todayWorkout.exercises.length} exercises • ~${estimateMinutes(todayWorkout)} min`
              : next
                ? `Next: ${escapeHtml(next.workout.name)} • ${escapeHtml(next.day)}`
                : "Your next workout is already scheduled."}</div>
            <div class="streak">🔥 ${state.streak} day streak</div>
          </div>
          <div class="machine-art">${machineSvg(todayWorkout ? "#FF5A5F" : "#B7E34A")}</div>
        </div>
        ${todayWorkout
          ? `<button class="primary" id="startActivePlanWorkout">Start Workout →</button>`
          : `<button class="secondary active-plan-schedule-btn" id="viewActivePlanSchedule">View my schedule →</button>`}
      </section>

      <section class="tiles">
        <button class="tile coral" data-go="home">📅<strong>Today</strong><span>Your plan</span></button>
        <button class="tile bluebg" data-go="workouts">🏋<strong>Workouts</strong><span>Create & schedule</span></button>
        <button class="tile limebg" data-go="progress">📈<strong>Progress</strong><span>Track results</span></button>
        <button class="tile goldbg" data-go="progress">🏆<strong>Achievements</strong><span>Earn rewards</span></button>
      </section>

      <section class="card streak-card">
        <div class="fire">🔥</div>
        <div>
          <div class="streak-row">
            <div><strong>You’re on fire!</strong><div class="lime">${state.streak} day streak</div></div>
            <div class="days">
              ${["M","T","W","T","F","S","S"].map((d,i)=>`<div class="day ${i<6?"done":""}">${i<6?"✓":d}</div>`).join("")}
            </div>
          </div>
        </div>
      </section>

      <section class="tip">
        <strong>☆ Daily Tip</strong>
        <p>${todayWorkout
          ? "Focus on controlled reps and a weight you can move with good form."
          : "Your plan is still active. Recovery today helps you come back ready for your next scheduled session."}</p>
      </section>
    `;

    bindCommon();
    document.getElementById("startActivePlanWorkout")?.addEventListener("click", () => startWorkout(todayWorkout));
    document.getElementById("viewActivePlanSchedule")?.addEventListener("click", () => {
      state.page = "workouts";
      render();
    });
  };

  renderWorkouts = function () {
    originalRenderWorkouts();
  };
})();