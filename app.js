const app = document.getElementById("app");
const toast = document.getElementById("toast");

const exerciseLibrary = [
  {id:"chest-press",name:"Chest Press",muscle:"Chest",sets:3,reps:10,weight:50,cue:"Keep your shoulder blades back and press smoothly."},
  {id:"incline-press",name:"Incline Press",muscle:"Chest",sets:3,reps:10,weight:35,cue:"Control the lowering phase and press through a steady path."},
  {id:"cable-fly",name:"Cable Fly",muscle:"Chest",sets:3,reps:12,weight:15,cue:"Use a controlled arc and squeeze your chest."},
  {id:"shoulder-press",name:"Shoulder Press",muscle:"Shoulders",sets:3,reps:10,weight:25,cue:"Keep your ribs down and avoid locking your elbows."},
  {id:"lateral-raise",name:"Lateral Raise",muscle:"Shoulders",sets:3,reps:12,weight:10,cue:"Raise to shoulder height without swinging."},
  {id:"triceps-pushdown",name:"Triceps Pushdown",muscle:"Triceps",sets:3,reps:12,weight:30,cue:"Keep your elbows pinned to your sides."},
  {id:"lat-pulldown",name:"Lat Pulldown",muscle:"Back",sets:3,reps:10,weight:55,cue:"Pull your elbows down and keep your chest tall."},
  {id:"seated-row",name:"Seated Row",muscle:"Back",sets:3,reps:10,weight:50,cue:"Pull toward your lower ribs and avoid shrugging."},
  {id:"reverse-fly",name:"Reverse Fly",muscle:"Rear Delts",sets:3,reps:12,weight:20,cue:"Move slowly and squeeze your shoulder blades together."},
  {id:"biceps-curl",name:"Biceps Curl",muscle:"Biceps",sets:3,reps:12,weight:20,cue:"Keep your elbows still and control each rep."},
  {id:"hammer-curl",name:"Hammer Curl",muscle:"Biceps",sets:3,reps:12,weight:15,cue:"Keep your wrists neutral and avoid swinging."},
  {id:"leg-press",name:"Leg Press",muscle:"Legs",sets:3,reps:10,weight:90,cue:"Keep your back against the pad and control the depth."},
  {id:"leg-extension",name:"Leg Extension",muscle:"Quads",sets:3,reps:12,weight:40,cue:"Lift smoothly and avoid snapping your knees straight."},
  {id:"leg-curl",name:"Leg Curl",muscle:"Hamstrings",sets:3,reps:12,weight:40,cue:"Keep your hips down and curl with control."},
  {id:"calf-raise",name:"Calf Raise",muscle:"Calves",sets:3,reps:15,weight:50,cue:"Pause at the top and lower through a full range."},
  {id:"hip-abduction",name:"Hip Abduction",muscle:"Glutes",sets:3,reps:12,weight:45,cue:"Stay controlled and avoid bouncing the weight."},
  {id:"plank",name:"Plank",muscle:"Core",sets:3,reps:30,weight:0,cue:"Keep your body in one straight line and brace your core."},
  {id:"cable-crunch",name:"Cable Crunch",muscle:"Core",sets:3,reps:12,weight:30,cue:"Move through your torso instead of pulling with your arms."}
];

const defaultWorkout = {
  id:"default-push",
  name:"Push Day",
  builtIn:true,
  days:[],
  exercises:["chest-press","shoulder-press","cable-fly","triceps-pushdown","lateral-raise","incline-press"].map(id=>({...(exerciseLibrary.find(e=>e.id===id))}))
};

function loadJSON(key, fallback){
  try{
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  }catch{
    return fallback;
  }
}

function escapeHtml(value=""){
  return String(value).replace(/[&<>'"]/g, ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]));
}

function cloneWorkout(workout){
  return {
    ...workout,
    days:[...(workout.days||[])],
    exercises:(workout.exercises||[]).map(ex=>({...ex}))
  };
}

const state = {
  page:"home",
  streak:Number(localStorage.getItem("sn_streak") || 12),
  completedWorkouts:Number(localStorage.getItem("sn_completed") || 6),
  dark:localStorage.getItem("sn_dark") === "true",
  workoutIndex:0,
  completedSets:{},
  customWorkouts:loadJSON("sn_custom_workouts", []),
  activeWorkout:null,
  builder:{name:"",days:[],exercises:[]}
};

document.documentElement.classList.toggle("dark", state.dark);

function saveCustomWorkouts(){
  localStorage.setItem("sn_custom_workouts", JSON.stringify(state.customWorkouts));
}

function machineSvg(accent="#FF5A5F"){
  return `<svg viewBox="0 0 220 150" aria-hidden="true">
    <rect x="34" y="106" width="150" height="10" rx="5" fill="#1f1f1f"/>
    <rect x="58" y="52" width="18" height="60" rx="4" fill="#2d2d2d"/>
    <rect x="114" y="42" width="16" height="74" rx="4" fill="#2d2d2d"/>
    <rect x="138" y="64" width="12" height="52" rx="4" fill="#2d2d2d"/>
    <rect x="80" y="65" width="55" height="12" rx="6" fill="#5a5a5a"/>
    <rect x="84" y="76" width="40" height="28" rx="7" fill="#1f1f1f"/>
    <circle cx="48" cy="108" r="18" fill="#242424"/>
    <circle cx="168" cy="108" r="18" fill="#242424"/>
    <circle cx="48" cy="108" r="8" fill="${accent}"/>
    <circle cx="168" cy="108" r="8" fill="${accent}"/>
  </svg>`;
}

function bodySvg(){
  return `<svg viewBox="0 0 180 230" aria-hidden="true">
    <circle cx="90" cy="26" r="18" fill="none" stroke="#8a8d92" stroke-width="2"/>
    <path d="M74 48 Q90 58 106 48 L120 82 108 118 103 172 94 214 M106 48 L142 88 M74 48 L38 88 M60 82 L72 120 77 172 86 214" fill="none" stroke="#8a8d92" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M75 50 Q90 63 105 50 Q108 70 118 80 Q107 94 90 95 Q73 94 62 80 Q72 70 75 50" fill="#3B82F6" opacity=".95"/>
    <path d="M62 80 Q51 74 43 87 L51 105 Q63 98 69 87" fill="#3B82F6"/>
    <path d="M118 80 Q129 74 137 87 L129 105 Q117 98 111 87" fill="#3B82F6"/>
  </svg>`;
}

function dayName(){
  return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()];
}

function shortDay(day){
  return day.slice(0,3);
}

function getScheduledWorkout(day=dayName()){
  return state.customWorkouts.find(workout=>(workout.days||[]).includes(day)) || null;
}

function getTodayWorkout(){
  return getScheduledWorkout() || defaultWorkout;
}

function estimateMinutes(workout){
  return Math.max(20, (workout.exercises?.length || 1) * 9);
}

function workoutMuscles(workout){
  const muscles=[...new Set((workout.exercises||[]).map(ex=>ex.muscle).filter(Boolean))];
  return muscles.slice(0,3).join(", ") || "Full body";
}

function navActive(){
  document.querySelectorAll(".nav-item").forEach(btn=>btn.classList.toggle("active", btn.dataset.page===state.page));
}

function render(){
  navActive();
  if(state.page==="home") renderHome();
  if(state.page==="workouts") renderWorkouts();
  if(state.page==="builder") renderBuilder();
  if(state.page==="progress") renderProgress();
  if(state.page==="profile") renderProfile();
  if(state.page==="activeWorkout") renderWorkout();
  if(state.page==="summary") renderSummary();
}

function renderHome(){
  const today=getTodayWorkout();
  const isCustom=!today.builtIn;
  app.innerHTML = `
    <div class="topbar">
      <div class="logo">START/<span>NOW</span></div>
      <button class="avatar" data-go="profile">MG</button>
    </div>

    <section class="hero-copy">
      <div class="eyebrow">Good morning 👋</div>
      <h1>Let’s get stronger today.</h1>
      <p>${isCustom?`${escapeHtml(dayName())} • Your schedule`:"Consistency &gt; Motivation."}</p>
    </section>

    <section class="card plan-card">
      <div class="card-label">🏋 Today’s plan</div>
      <div class="plan-grid">
        <div>
          <h2>${escapeHtml(today.name)}</h2>
          <div class="meta">${today.exercises.length} exercises • ~${estimateMinutes(today)} min</div>
          <div class="streak">🔥 ${state.streak} day streak</div>
        </div>
        <div class="machine-art">${machineSvg()}</div>
      </div>
      <button class="primary" id="startWorkout">Start Workout →</button>
    </section>

    <section class="card section-card">
      <div class="section-head">
        <strong class="blue">◎ Muscle focus</strong>
        <a href="#" data-go="workouts">Manage plan →</a>
      </div>
      <div class="focus-wrap">
        <div class="body-visual">${bodySvg()}</div>
        <div class="focus-copy">
          <h3>${escapeHtml(workoutMuscles(today))}</h3>
          <p>${isCustom?"This workout comes from the schedule you built in the Workouts tab.":"Pressing movements that build upper-body strength with beginner-friendly machines."}</p>
          <div class="muscle-list">
            ${[...new Set(today.exercises.map(ex=>ex.muscle))].slice(0,3).map((muscle,i)=>`<div class="muscle-row"><span><i class="dot"></i>${escapeHtml(muscle)}</span><span>${i===0?"Primary":"Focus"}</span></div>`).join("")}
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
      <p>Focus on controlled reps and full range of motion. Quality beats rushing through the set.</p>
    </section>
  `;
  bindCommon();
  document.getElementById("startWorkout").onclick=()=>startWorkout(today);
}

function renderWorkouts(){
  const days=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  app.innerHTML = `
    <div class="topbar"><div class="logo">START/<span>NOW</span></div><button class="avatar" data-go="profile">MG</button></div>
    <div class="workouts-heading-row">
      <div>
        <div class="eyebrow">YOUR TRAINING</div>
        <h1 class="page-title compact-title">Workouts</h1>
      </div>
      <button class="create-workout-btn" id="createWorkout">＋ Create</button>
    </div>

    <section class="card schedule-card">
      <div class="section-head schedule-head">
        <div><strong>Weekly schedule</strong><div class="schedule-sub">Tap Create to build your own routine.</div></div>
      </div>
      <div class="weekly-schedule">
        ${days.map(day=>{
          const workout=getScheduledWorkout(day);
          const today=day===dayName();
          return `<div class="schedule-day ${today?"today":""}">
            <div class="schedule-day-name">${shortDay(day)}</div>
            <div class="schedule-dot ${workout?"scheduled":""}"></div>
            <div class="schedule-workout-name">${workout?escapeHtml(workout.name):"Rest"}</div>
          </div>`;
        }).join("")}
      </div>
    </section>

    <section class="workout-library-section">
      <div class="section-title-row"><h2>My workouts</h2><span>${state.customWorkouts.length+1} total</span></div>
      <div class="list">
        <div class="card custom-workout-row">
          <div class="workout-icon coral-icon">🏋</div>
          <div class="custom-workout-copy">
            <h3>Push Day</h3>
            <p>6 exercises • Chest, Shoulders, Triceps</p>
            <span class="built-in-label">START/NOW plan</span>
          </div>
          <button class="mini-start" data-start-default>Start</button>
        </div>
        ${state.customWorkouts.map(workout=>`
          <div class="card custom-workout-row">
            <div class="workout-icon blue-icon">✦</div>
            <div class="custom-workout-copy">
              <h3>${escapeHtml(workout.name)}</h3>
              <p>${workout.exercises.length} exercises • ${escapeHtml(workoutMuscles(workout))}</p>
              <span class="schedule-label">${workout.days.length?workout.days.map(shortDay).join(" • "):"Not scheduled"}</span>
            </div>
            <div class="workout-row-actions">
              <button class="mini-start" data-start-custom="${workout.id}">Start</button>
              <button class="delete-workout" data-delete-workout="${workout.id}" aria-label="Delete ${escapeHtml(workout.name)}">•••</button>
            </div>
          </div>`).join("")}
      </div>
    </section>

    <button class="card add-workout-card" id="createWorkoutBottom">
      <span class="add-workout-plus">＋</span>
      <span><strong>Create a workout</strong><small>Pick exercises, sets, reps, and training days.</small></span>
      <span class="add-arrow">→</span>
    </button>
  `;
  bindCommon();
  document.getElementById("createWorkout").onclick=openBuilder;
  document.getElementById("createWorkoutBottom").onclick=openBuilder;
  document.querySelector("[data-start-default]").onclick=()=>startWorkout(defaultWorkout);
  document.querySelectorAll("[data-start-custom]").forEach(btn=>{
    btn.onclick=()=>{
      const workout=state.customWorkouts.find(w=>w.id===btn.dataset.startCustom);
      if(workout) startWorkout(workout);
    };
  });
  document.querySelectorAll("[data-delete-workout]").forEach(btn=>{
    btn.onclick=()=>{
      const id=btn.dataset.deleteWorkout;
      const workout=state.customWorkouts.find(w=>w.id===id);
      if(!workout) return;
      if(confirm(`Delete “${workout.name}”?`)){
        state.customWorkouts=state.customWorkouts.filter(w=>w.id!==id);
        saveCustomWorkouts();
        showToast("Workout deleted");
        renderWorkouts();
      }
    };
  });
}

function openBuilder(){
  state.builder={name:"",days:[],exercises:[]};
  state.page="builder";
  render();
}

function renderBuilder(){
  const selectedIds=new Set(state.builder.exercises.map(ex=>ex.id));
  const days=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  app.innerHTML=`
    <section class="builder-page">
      <div class="builder-topbar">
        <button class="icon-btn" id="backFromBuilder">←</button>
        <div class="builder-step">CUSTOM WORKOUT</div>
        <div class="builder-spacer"></div>
      </div>

      <h1 class="builder-title">Build your workout.</h1>
      <p class="builder-intro">Choose exactly what you want to train, then put it on your weekly schedule.</p>

      <label class="builder-label" for="workoutName">Workout name</label>
      <input class="builder-name-input" id="workoutName" maxlength="32" placeholder="Example: Back + Biceps" value="${escapeHtml(state.builder.name)}" />

      <div class="builder-section-heading">
        <div><h2>Training days</h2><p>Optional — you can use a workout without scheduling it.</p></div>
      </div>
      <div class="builder-days">
        ${days.map(day=>`<button class="builder-day ${state.builder.days.includes(day)?"selected":""}" data-builder-day="${day}"><strong>${shortDay(day).slice(0,1)}</strong><span>${shortDay(day)}</span></button>`).join("")}
      </div>

      <div class="builder-section-heading exercise-heading">
        <div><h2>Exercises</h2><p>${state.builder.exercises.length} selected</p></div>
      </div>
      <div class="exercise-search-wrap"><span>⌕</span><input id="exerciseSearch" type="search" placeholder="Search exercises or muscles" /></div>

      ${state.builder.exercises.length?`
        <div class="selected-exercises">
          <div class="selected-title">YOUR WORKOUT</div>
          ${state.builder.exercises.map((ex,index)=>`
            <div class="selected-exercise-card">
              <div class="selected-order">${index+1}</div>
              <div class="selected-main">
                <strong>${escapeHtml(ex.name)}</strong><span>${escapeHtml(ex.muscle)}</span>
                <div class="set-rep-controls">
                  <label>Sets <input type="number" min="1" max="8" value="${ex.sets}" data-setting="sets" data-ex-id="${ex.id}"></label>
                  <label>Reps <input type="number" min="1" max="50" value="${ex.reps}" data-setting="reps" data-ex-id="${ex.id}"></label>
                </div>
              </div>
              <button class="remove-exercise" data-remove-exercise="${ex.id}" aria-label="Remove ${escapeHtml(ex.name)}">×</button>
            </div>`).join("")}
        </div>`:""}

      <div class="exercise-picker" id="exercisePicker">
        ${exerciseLibrary.map(ex=>`
          <div class="exercise-option" data-search-text="${escapeHtml((ex.name+" "+ex.muscle).toLowerCase())}">
            <div class="exercise-option-icon">${ex.muscle==="Legs"||ex.muscle==="Quads"||ex.muscle==="Hamstrings"||ex.muscle==="Calves"||ex.muscle==="Glutes"?"🦵":"🏋"}</div>
            <div class="exercise-option-copy"><strong>${escapeHtml(ex.name)}</strong><span>${escapeHtml(ex.muscle)} • ${ex.sets} × ${ex.reps}</span></div>
            <button class="exercise-add ${selectedIds.has(ex.id)?"added":""}" data-add-exercise="${ex.id}" ${selectedIds.has(ex.id)?"disabled":""}>${selectedIds.has(ex.id)?"✓":"＋"}</button>
          </div>`).join("")}
      </div>

      <div class="builder-save-wrap">
        <button class="primary" id="saveWorkout">Save workout</button>
        <p id="builderError" class="builder-error" role="alert"></p>
      </div>
    </section>
  `;

  document.getElementById("backFromBuilder").onclick=()=>{state.page="workouts";render();};
  document.getElementById("workoutName").addEventListener("input",e=>state.builder.name=e.target.value);
  document.querySelectorAll("[data-builder-day]").forEach(btn=>{
    btn.onclick=()=>{
      const day=btn.dataset.builderDay;
      if(state.builder.days.includes(day)) state.builder.days=state.builder.days.filter(d=>d!==day);
      else state.builder.days.push(day);
      btn.classList.toggle("selected");
    };
  });
  document.getElementById("exerciseSearch").addEventListener("input",e=>{
    const query=e.target.value.trim().toLowerCase();
    document.querySelectorAll(".exercise-option").forEach(row=>{
      row.hidden=query && !row.dataset.searchText.includes(query);
    });
  });
  document.querySelectorAll("[data-add-exercise]").forEach(btn=>{
    btn.onclick=()=>{
      const ex=exerciseLibrary.find(item=>item.id===btn.dataset.addExercise);
      if(ex && !state.builder.exercises.some(item=>item.id===ex.id)){
        state.builder.exercises.push({...ex});
        renderBuilder();
      }
    };
  });
  document.querySelectorAll("[data-remove-exercise]").forEach(btn=>{
    btn.onclick=()=>{
      state.builder.exercises=state.builder.exercises.filter(ex=>ex.id!==btn.dataset.removeExercise);
      renderBuilder();
    };
  });
  document.querySelectorAll("[data-setting]").forEach(input=>{
    input.addEventListener("change",()=>{
      const ex=state.builder.exercises.find(item=>item.id===input.dataset.exId);
      if(!ex) return;
      const min=1;
      const max=input.dataset.setting==="sets"?8:50;
      const value=Math.max(min,Math.min(max,Number(input.value)||min));
      ex[input.dataset.setting]=value;
      input.value=value;
    });
  });
  document.getElementById("saveWorkout").onclick=saveWorkoutFromBuilder;
}

function saveWorkoutFromBuilder(){
  const error=document.getElementById("builderError");
  const name=state.builder.name.trim();
  if(!name){error.textContent="Give your workout a name first.";return;}
  if(!state.builder.exercises.length){error.textContent="Add at least one exercise.";return;}

  const chosenDays=[...state.builder.days];
  if(chosenDays.length){
    state.customWorkouts=state.customWorkouts.map(workout=>({
      ...workout,
      days:(workout.days||[]).filter(day=>!chosenDays.includes(day))
    }));
  }

  const workout={
    id:`custom-${Date.now()}`,
    name,
    builtIn:false,
    days:chosenDays,
    exercises:state.builder.exercises.map(ex=>({...ex}))
  };
  state.customWorkouts.push(workout);
  saveCustomWorkouts();
  state.page="workouts";
  showToast(chosenDays.length?"Workout saved to your schedule":"Workout saved");
  render();
}

function renderProgress(){
  const grade=Math.min(98,82+state.completedWorkouts);
  app.innerHTML=`
    <div class="topbar"><div class="logo">START/<span>NOW</span></div><button class="avatar" data-go="profile">MG</button></div>
    <h1 class="page-title">Progress</h1>
    <section class="metric-grid">
      <div class="card metric"><small>Workout Grade</small><strong>${grade}%</strong><span class="lime">A</span></div>
      <div class="card metric"><small>Current Streak</small><strong>${state.streak}</strong><span>days 🔥</span></div>
      <div class="card metric"><small>Workouts</small><strong>${state.completedWorkouts}</strong><span>completed</span></div>
      <div class="card metric"><small>Consistency</small><strong>92%</strong><span>this month</span></div>
    </section>
    <section class="card section-card">
      <div class="section-head"><strong class="lime">Overall grade</strong><span>Based on recent workouts</span></div>
      <div class="grade-circle"><span>A</span></div>
      <p style="text-align:center;color:var(--muted);line-height:1.5">You’re staying consistent, completing most sets, and keeping your sessions balanced.</p>
    </section>
    <section class="card section-card">
      <div class="section-head"><strong class="gold">Achievements</strong></div>
      <div class="list">
        <div class="reason"><strong>🔥 Consistency Starter</strong>7+ day workout streak</div>
        <div class="reason"><strong>🏆 First Five</strong>Complete 5 workouts</div>
        <div class="reason"><strong>📈 Progress Tracker</strong>Log weights across 3 sessions</div>
      </div>
    </section>`;
  bindCommon();
}

function renderProfile(){
  app.innerHTML=`
    <div class="topbar"><div class="logo">START/<span>NOW</span></div></div>
    <h1 class="page-title">Profile</h1>
    <section class="card profile-card">
      <div class="profile-avatar">MG</div>
      <h2 style="margin:0">Marcus</h2>
      <p style="color:var(--muted)">Beginner • Building consistency</p>
      <div class="toggle-row">
        <div style="text-align:left"><strong>Dark mode</strong><div style="color:var(--muted);font-size:12px">Optional theme</div></div>
        <button class="switch ${state.dark?"on":""}" id="darkToggle"><span></span></button>
      </div>
      <div class="toggle-row"><span>Saved workouts</span><strong>${state.customWorkouts.length}</strong></div>
      <div class="toggle-row"><span>Workout streak</span><strong>${state.streak} days</strong></div>
      <div class="toggle-row"><span>Overall grade</span><strong class="lime">A • 88%</strong></div>
      <div class="toggle-row"><span>Completed workouts</span><strong>${state.completedWorkouts}</strong></div>
    </section>`;
  bindCommon();
  document.getElementById("darkToggle").onclick=()=>{
    state.dark=!state.dark;
    localStorage.setItem("sn_dark",state.dark);
    document.documentElement.classList.toggle("dark",state.dark);
    renderProfile();
  };
}

function startWorkout(workout=getTodayWorkout()){
  state.activeWorkout=cloneWorkout(workout);
  state.page="activeWorkout";
  state.workoutIndex=0;
  state.completedSets={};
  render();
}

function renderWorkout(){
  const workout=state.activeWorkout || cloneWorkout(getTodayWorkout());
  const activeExercises=workout.exercises;
  const ex=activeExercises[state.workoutIndex];
  if(!ex){state.page="workouts";render();return;}
  const progress=(state.workoutIndex/activeExercises.length)*100;
  if(!state.completedSets[state.workoutIndex]) state.completedSets[state.workoutIndex]=Array(ex.sets).fill(false);
  app.innerHTML=`
    <section class="workout-screen">
      <div class="workout-top">
        <button class="icon-btn" id="exitWorkout">←</button>
        <strong>${escapeHtml(workout.name)}</strong>
        <span>${state.workoutIndex+1}/${activeExercises.length}</span>
      </div>
      <div class="progressbar"><span style="width:${progress}%"></span></div>
      <div class="exercise-visual">${machineSvg("#3B82F6")}</div>
      <h1 class="exercise-title">${escapeHtml(ex.name)}</h1>
      <p class="exercise-sub">${ex.sets} sets • ${ex.reps} reps • Rest 60–90 sec</p>
      <div class="tip" style="margin-bottom:16px"><strong>Coach cue</strong><p>${escapeHtml(ex.cue||"Move with control and use a comfortable range of motion.")}</p></div>
      <div class="set-grid" style="font-size:12px;color:var(--muted)">
        <span>SET</span><span style="text-align:center">WEIGHT</span><span style="text-align:center">REPS</span><span></span>
      </div>
      ${Array.from({length:ex.sets},(_,i)=>`
        <div class="set-grid">
          <strong>${i+1}</strong>
          <input type="number" value="${ex.weight||0}" aria-label="Weight for set ${i+1}">
          <input type="number" value="${ex.reps}" aria-label="Reps for set ${i+1}">
          <button class="check ${state.completedSets[state.workoutIndex][i]?"done":""}" data-set="${i}">${state.completedSets[state.workoutIndex][i]?"✓":"○"}</button>
        </div>`).join("")}
      <div class="workout-actions">
        <button class="secondary" id="skipExercise">Skip</button>
        <button class="primary" id="nextExercise">${state.workoutIndex===activeExercises.length-1?"Finish Workout":"Next Exercise →"}</button>
      </div>
    </section>`;
  document.querySelectorAll("[data-set]").forEach(btn=>{
    btn.onclick=()=>{
      const i=Number(btn.dataset.set);
      state.completedSets[state.workoutIndex][i]=!state.completedSets[state.workoutIndex][i];
      renderWorkout();
    };
  });
  document.getElementById("exitWorkout").onclick=()=>{state.page="workouts";render();};
  document.getElementById("skipExercise").onclick=nextExercise;
  document.getElementById("nextExercise").onclick=nextExercise;
}

function nextExercise(){
  const activeExercises=(state.activeWorkout||getTodayWorkout()).exercises;
  if(state.workoutIndex<activeExercises.length-1){
    state.workoutIndex++;
    renderWorkout();
  }else{
    state.completedWorkouts++;
    state.streak++;
    localStorage.setItem("sn_completed",state.completedWorkouts);
    localStorage.setItem("sn_streak",state.streak);
    state.page="summary";
    render();
  }
}

function renderSummary(){
  const workout=state.activeWorkout||getTodayWorkout();
  const totalSets=workout.exercises.reduce((sum,ex)=>sum+ex.sets,0);
  const done=Object.values(state.completedSets).flat().filter(Boolean).length;
  const completion=totalSets?Math.round((done/totalSets)*100):0;
  const score=Math.max(72,Math.min(98,78+Math.round(completion*.2)));
  const letter=score>=90?"A":score>=80?"B":score>=70?"C":"D";
  app.innerHTML=`
    <section class="summary">
      <div class="eyebrow">${escapeHtml(workout.name)} complete</div>
      <div class="big-grade">${letter}</div>
      <h2>${score}% workout grade</h2>
      <p>Your grade is based on completion, consistency, and finishing the planned session.</p>
      <div class="reason-list">
        <div class="reason"><strong>✅ Completion</strong>${done}/${totalSets} sets marked complete.</div>
        <div class="reason"><strong>🔥 Consistency</strong>Your streak is now ${state.streak} days.</div>
        <div class="reason"><strong>📈 Progress</strong>Finishing planned workouts helps raise your overall profile grade.</div>
      </div>
      <button class="primary" id="finishSummary">Back to Home</button>
    </section>`;
  document.getElementById("finishSummary").onclick=()=>{state.activeWorkout=null;state.page="home";render();};
}

function bindCommon(){
  document.querySelectorAll("[data-go]").forEach(el=>{
    el.onclick=e=>{e.preventDefault();state.page=el.dataset.go;render();};
  });
}

document.querySelectorAll(".nav-item").forEach(btn=>{
  btn.addEventListener("click",()=>{state.page=btn.dataset.page;render();});
});

document.getElementById("quickStart").addEventListener("click",()=>startWorkout(getTodayWorkout()));

function showToast(msg){
  toast.textContent=msg;
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),1800);
}

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
}

render();