const app = document.getElementById("app");
const toast = document.getElementById("toast");

const exercises = [
  {name:"Chest Press", sets:3, reps:10, weight:50, cue:"Keep your shoulder blades back and press smoothly."},
  {name:"Shoulder Press", sets:3, reps:10, weight:25, cue:"Keep your ribs down and avoid locking your elbows."},
  {name:"Cable Fly", sets:3, reps:12, weight:15, cue:"Use a controlled arc and squeeze your chest."},
  {name:"Triceps Pushdown", sets:3, reps:12, weight:30, cue:"Keep elbows pinned to your sides."},
  {name:"Lateral Raise", sets:3, reps:12, weight:10, cue:"Raise to shoulder height without swinging."},
  {name:"Incline Press", sets:3, reps:10, weight:35, cue:"Drive through a steady path and control the return."}
];

const state = {
  page: "home",
  streak: Number(localStorage.getItem("sn_streak") || 12),
  completedWorkouts: Number(localStorage.getItem("sn_completed") || 6),
  dark: localStorage.getItem("sn_dark")==="true",
  workoutIndex: 0,
  completedSets: {},
};

document.documentElement.classList.toggle("dark", state.dark);

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

function navActive(){
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active", b.dataset.page===state.page));
}

function render(){
  navActive();
  if(state.page==="home") renderHome();
  if(state.page==="workouts") renderWorkouts();
  if(state.page==="progress") renderProgress();
  if(state.page==="profile") renderProfile();
  if(state.page==="activeWorkout") renderWorkout();
  if(state.page==="summary") renderSummary();
}

function renderHome(){
  app.innerHTML = `
    <div class="topbar">
      <div class="logo">START/<span>NOW</span></div>
      <button class="avatar" data-go="profile">MG</button>
    </div>

    <section class="hero-copy">
      <div class="eyebrow">Good morning 👋</div>
      <h1>Let’s get stronger today.</h1>
      <p>Consistency &gt; Motivation.</p>
    </section>

    <section class="card plan-card">
      <div class="card-label">🏋 Today’s plan</div>
      <div class="plan-grid">
        <div>
          <h2>Push Day</h2>
          <div class="meta">6 exercises • ~60 min</div>
          <div class="streak">🔥 ${state.streak} day streak</div>
        </div>
        <div class="machine-art">${machineSvg()}</div>
      </div>
      <button class="primary" id="startWorkout">Start Workout →</button>
    </section>

    <section class="card section-card">
      <div class="section-head">
        <strong class="blue">◎ Muscle focus</strong>
        <a href="#" data-go="workouts">View all →</a>
      </div>
      <div class="focus-wrap">
        <div class="body-visual">${bodySvg()}</div>
        <div class="focus-copy">
          <h3>Chest, Shoulders, Triceps</h3>
          <p>Pressing movements that build upper-body strength with beginner-friendly machines.</p>
          <div class="muscle-list">
            <div class="muscle-row"><span><i class="dot"></i>Chest</span><span>Primary</span></div>
            <div class="muscle-row"><span><i class="dot"></i>Shoulders</span><span>Secondary</span></div>
            <div class="muscle-row"><span><i class="dot"></i>Triceps</span><span>Secondary</span></div>
          </div>
        </div>
      </div>
    </section>

    <section class="tiles">
      <button class="tile coral" data-go="home">📅<strong>Today</strong><span>Your plan</span></button>
      <button class="tile bluebg" data-go="workouts">🏋<strong>Exercises</strong><span>Beginner guides</span></button>
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
  document.getElementById("startWorkout").onclick = startWorkout;
}

function renderWorkouts(){
  app.innerHTML = `
    <div class="topbar"><div class="logo">START/<span>NOW</span></div><button class="avatar" data-go="profile">MG</button></div>
    <h1 class="page-title">Workouts</h1>
    <div class="list">
      ${[
        ["Push Day","Chest • Shoulders • Triceps","Today"],
        ["Pull Day","Back • Biceps","Next"],
        ["Leg Day","Quads • Hamstrings • Calves","Upcoming"],
        ["Full Body","Balanced beginner session","Optional"]
      ].map((w,i)=>`
        <div class="card workout-row">
          <div><h3>${w[0]}</h3><p>${w[1]}</p></div>
          <button class="badge" ${i===0?'id="workoutStart2"':''}>${w[2]}</button>
        </div>`).join("")}
    </div>
  `;
  bindCommon();
  const b=document.getElementById("workoutStart2");
  if(b) b.onclick=startWorkout;
}

function renderProgress(){
  const grade = Math.min(98, 82 + state.completedWorkouts);
  app.innerHTML = `
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
    </section>
  `;
  bindCommon();
}

function renderProfile(){
  app.innerHTML = `
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
      <div class="toggle-row"><span>Workout streak</span><strong>${state.streak} days</strong></div>
      <div class="toggle-row"><span>Overall grade</span><strong class="lime">A • 88%</strong></div>
      <div class="toggle-row"><span>Completed workouts</span><strong>${state.completedWorkouts}</strong></div>
    </section>
  `;
  bindCommon();
  document.getElementById("darkToggle").onclick=()=>{
    state.dark=!state.dark;
    localStorage.setItem("sn_dark", state.dark);
    document.documentElement.classList.toggle("dark", state.dark);
    renderProfile();
  };
}

function startWorkout(){
  state.page="activeWorkout";
  state.workoutIndex=0;
  state.completedSets={};
  render();
}

function renderWorkout(){
  const ex=exercises[state.workoutIndex];
  const progress=((state.workoutIndex)/exercises.length)*100;
  if(!state.completedSets[state.workoutIndex]) state.completedSets[state.workoutIndex]=Array(ex.sets).fill(false);
  app.innerHTML=`
    <section class="workout-screen">
      <div class="workout-top">
        <button class="icon-btn" id="exitWorkout">←</button>
        <strong>Push Day</strong>
        <span>${state.workoutIndex+1}/${exercises.length}</span>
      </div>
      <div class="progressbar"><span style="width:${progress}%"></span></div>
      <div class="exercise-visual">${machineSvg("#3B82F6")}</div>
      <h1 class="exercise-title">${ex.name}</h1>
      <p class="exercise-sub">${ex.sets} sets • ${ex.reps} reps • Rest 60–90 sec</p>
      <div class="tip" style="margin-bottom:16px"><strong>Coach cue</strong><p>${ex.cue}</p></div>
      <div class="set-grid" style="font-size:12px;color:var(--muted)">
        <span>SET</span><span style="text-align:center">WEIGHT</span><span style="text-align:center">REPS</span><span></span>
      </div>
      ${Array.from({length:ex.sets},(_,i)=>`
        <div class="set-grid">
          <strong>${i+1}</strong>
          <input type="number" value="${ex.weight}" aria-label="Weight for set ${i+1}">
          <input type="number" value="${ex.reps}" aria-label="Reps for set ${i+1}">
          <button class="check ${state.completedSets[state.workoutIndex][i]?"done":""}" data-set="${i}">${state.completedSets[state.workoutIndex][i]?"✓":"○"}</button>
        </div>`).join("")}
      <div class="workout-actions">
        <button class="secondary" id="skipExercise">Skip</button>
        <button class="primary" id="nextExercise">${state.workoutIndex===exercises.length-1?"Finish Workout":"Next Exercise →"}</button>
      </div>
    </section>
  `;
  document.querySelectorAll("[data-set]").forEach(btn=>{
    btn.onclick=()=>{
      const i=Number(btn.dataset.set);
      state.completedSets[state.workoutIndex][i]=!state.completedSets[state.workoutIndex][i];
      renderWorkout();
    };
  });
  document.getElementById("exitWorkout").onclick=()=>{state.page="home";render();};
  document.getElementById("skipExercise").onclick=nextExercise;
  document.getElementById("nextExercise").onclick=nextExercise;
}

function nextExercise(){
  if(state.workoutIndex < exercises.length-1){
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
  const totalSets=exercises.reduce((a,e)=>a+e.sets,0);
  const done=Object.values(state.completedSets).flat().filter(Boolean).length;
  const completion=Math.round((done/totalSets)*100);
  const score=Math.max(72,Math.min(98,78+Math.round(completion*.2)));
  const letter=score>=90?"A":score>=80?"B":score>=70?"C":"D";
  app.innerHTML=`
    <section class="summary">
      <div class="eyebrow">Workout complete</div>
      <div class="big-grade">${letter}</div>
      <h2>${score}% workout grade</h2>
      <p>Your grade is based on completion, consistency, and finishing the planned session.</p>
      <div class="reason-list">
        <div class="reason"><strong>✅ Completion</strong>${done}/${totalSets} sets marked complete.</div>
        <div class="reason"><strong>🔥 Consistency</strong>Your streak is now ${state.streak} days.</div>
        <div class="reason"><strong>📈 Progress</strong>Finishing planned workouts helps raise your overall profile grade.</div>
      </div>
      <button class="primary" id="finishSummary">Back to Home</button>
    </section>
  `;
  document.getElementById("finishSummary").onclick=()=>{state.page="home";render();};
}

function bindCommon(){
  document.querySelectorAll("[data-go]").forEach(el=>{
    el.onclick=(e)=>{e.preventDefault();state.page=el.dataset.go;render();};
  });
}

document.querySelectorAll(".nav-item").forEach(btn=>{
  btn.addEventListener("click",()=>{
    state.page=btn.dataset.page;
    render();
  });
});
document.getElementById("quickStart").addEventListener("click",startWorkout);

function showToast(msg){
  toast.textContent=msg;
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),1800);
}

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
}

render();
