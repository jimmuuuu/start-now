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
      name: "My START/NOW Plan",
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

  function planMuscles(plan) {
    const muscles = [...new Set(plan.workouts.flatMap(workout => (workout.exercises || []).map(ex => ex.muscle)).filter(Boolean))];
    return muscles.slice(0, 4).join(", ") || "Balanced training";
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
        <div class="logo">START/<span>NOW</span></div>
        <button class="avatar" data-go="profile">MG</button>
      </div>

      <section class="hero-copy">
        <div class="eyebrow">Good morning 👋</div>
        <h1>Let’s get stronger today.</h1>
      </section>

      <section class="card plan-card active-main-plan ${todayWorkout ? "" : "rest-plan-card"}">
        <div class="current-plan-pill">CURRENT PLAN</div>
        <div class="card-label">${todayWorkout ? "🏋 TODAY’S WORKOUT" : "✓ TODAY’S PLAN"}</div>
        <div class="plan-grid">
          <div>
            <h2>${todayWorkout ? escapeHtml(todayWorkout.name) : "Rest Day"}</h2>
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

      <section class="card section-card">
        <div class="section-head">
          <strong class="blue">◎ ${todayWorkout ? "Muscle focus" : "Current plan"}</strong>
          <a href="#" data-go="workouts">Manage plan →</a>
        </div>
        <div class="focus-wrap">
          <div class="body-visual">${bodySvg()}</div>
          <div class="focus-copy">
            <h3>${escapeHtml(todayWorkout ? workoutMuscles(todayWorkout) : planMuscles(plan))}</h3>
            <p>${todayWorkout
              ? "This is the workout scheduled for today in your current START/NOW plan."
              : "No workout is scheduled today. Your current plan is still active, and your next workout is ready when its day arrives."}</p>
            <div class="muscle-list">
              ${(todayWorkout
                ? [...new Set(todayWorkout.exercises.map(ex => ex.muscle))].slice(0, 3)
                : [...new Set(plan.workouts.flatMap(workout => workout.exercises.map(ex => ex.muscle)))].slice(0, 3)
              ).map((muscle, i) => `<div class="muscle-row"><span><i class="dot"></i>${escapeHtml(muscle)}</span><span>${i === 0 ? "Primary" : "Focus"}</span></div>`).join("")}
            </div>
          </div>
        </div>
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
          : "Rest days are part of the plan too. Recovery helps you come back ready for your next session."}</p>
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
    const plan = getActivePlan();
    if (!plan) return;

    const schedule = document.querySelector(".schedule-card");
    if (!schedule || document.querySelector(".active-plan-banner")) return;

    const banner = document.createElement("div");
    banner.className = "active-plan-banner";
    banner.innerHTML = `<span>✓</span><div><strong>Current plan</strong></div>`;
    schedule.insertAdjacentElement("beforebegin", banner);
  };
})();