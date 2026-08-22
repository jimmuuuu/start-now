// START/NOW personal Arnold split setup.
// Only applies when the user opens the app with ?personal=arnold-v19.
(() => {
  const params = new URLSearchParams(location.search);
  if (params.get("personal") !== "arnold-v19") return;

  const migrationKey = "sn_personal_arnold_v19";
  if (localStorage.getItem(migrationKey) === "applied") return;

  function slug(value = "") {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function findExercise(names, muscle, sets, reps, cue) {
    const candidates = Array.isArray(names) ? names : [names];
    let found = null;

    for (const name of candidates) {
      found = exerciseLibrary.find(ex => String(ex.name).toLowerCase() === String(name).toLowerCase());
      if (found) break;
    }

    if (!found) {
      for (const name of candidates) {
        found = exerciseLibrary.find(ex => String(ex.name).toLowerCase().includes(String(name).toLowerCase()));
        if (found) break;
      }
    }

    const name = found?.name || candidates[0];
    return {
      ...(found || {
        id: `arnold-${slug(name)}`,
        name,
        muscle,
        weight: 0,
        cue: cue || "Use a controlled range of motion and a manageable weight."
      }),
      name,
      muscle: found?.muscle || muscle,
      sets,
      reps,
      weight: 0,
      cue: found?.cue || cue || "Use a controlled range of motion and a manageable weight."
    };
  }

  const ex = {
    bench: () => findExercise(["Barbell Bench Press", "Dumbbell Bench Press", "Chest Press"], "Chest", 3, 8),
    inclineBar: () => findExercise(["Incline Barbell Bench Press", "Incline Dumbbell Bench Press", "Incline Press"], "Chest", 3, 8),
    inclineDb: () => findExercise(["Incline Dumbbell Bench Press", "Incline Press"], "Chest", 3, 10),
    dbBench: () => findExercise(["Dumbbell Bench Press", "Chest Press"], "Chest", 3, 10),
    fly: () => findExercise(["Dumbbell Fly", "Pec Deck Fly", "Cable Fly"], "Chest", 2, 12),
    pullover: () => findExercise(["Dumbbell Pullover", "Straight-Arm Pulldown", "Lat Pulldown"], "Back", 2, 12),
    pullup: () => findExercise(["Pull-Up", "Weighted Chin-Up", "Lat Pulldown"], "Back", 3, 10),
    row: () => findExercise(["Bent-Over Barbell Row", "Barbell Row", "Seated Row"], "Back", 3, 10),
    tbar: () => findExercise(["T-Bar Row", "Seated Row"], "Back", 3, 10),

    arnoldPress: () => findExercise(["Arnold Press", "Seated Dumbbell Shoulder Press", "Shoulder Press"], "Shoulders", 3, 10),
    overhead: () => findExercise(["Barbell Overhead Press", "Seated Barbell Press", "Shoulder Press"], "Shoulders", 3, 8),
    lateral: () => findExercise(["Dumbbell Lateral Raise", "Lateral Raise", "Cable Lateral Raise"], "Shoulders", 3, 12),
    cableLateral: () => findExercise(["Cable Lateral Raise", "Lateral Raise"], "Shoulders", 3, 12),
    frontRaise: () => findExercise(["Dumbbell Front Raise", "Cable Front Raise", "Lateral Raise"], "Shoulders", 2, 12),
    rearDelt: () => findExercise(["Bent-Over Dumbbell Reverse Fly", "Machine Reverse Fly", "Reverse Fly", "Face Pull"], "Rear Delts", 2, 12),
    barCurl: () => findExercise(["Barbell Curl", "Biceps Curl"], "Biceps", 3, 10),
    inclineCurl: () => findExercise(["Incline Dumbbell Curl", "Biceps Curl"], "Biceps", 2, 12),
    preacher: () => findExercise(["Preacher Curl", "Biceps Curl"], "Biceps", 3, 10),
    hammer: () => findExercise(["Hammer Curl", "Biceps Curl"], "Biceps", 2, 12),
    overheadTri: () => findExercise(["Overhead Triceps Extension", "Cable Overhead Triceps Extension", "Triceps Pushdown"], "Triceps", 3, 10),
    skull: () => findExercise(["Skull Crusher", "Lying Triceps Extension", "Overhead Triceps Extension", "Triceps Pushdown"], "Triceps", 3, 10),
    pushdown: () => findExercise(["Triceps Pushdown", "Rope Triceps Pushdown"], "Triceps", 2, 12),

    squat: () => findExercise(["Barbell Back Squat", "Back Squat", "Goblet Squat", "Leg Press"], "Quads", 3, 8),
    frontSquat: () => findExercise(["Front Squat", "Goblet Squat", "Leg Press"], "Quads", 3, 8),
    hack: () => findExercise(["Hack Squat", "Leg Press"], "Quads", 3, 10),
    legPress: () => findExercise(["Leg Press"], "Legs", 3, 10),
    rdl: () => findExercise(["Romanian Deadlift", "Dumbbell Romanian Deadlift", "Straight-Leg Deadlift", "Leg Curl"], "Hamstrings", 3, 10),
    legCurl: () => findExercise(["Leg Curl", "Lying Leg Curl"], "Hamstrings", 3, 12),
    legExt: () => findExercise(["Leg Extension"], "Quads", 2, 12),
    lunge: () => findExercise(["Walking Lunge", "Reverse Lunge", "Leg Press"], "Quads", 2, 10),
    calf: () => findExercise(["Standing Calf Raise", "Calf Raise"], "Calves", 3, 15),
    seatedCalf: () => findExercise(["Seated Calf Raise", "Calf Raise"], "Calves", 3, 15)
  };

  const workouts = [
    {
      name: "Chest & Back A",
      day: "Monday",
      exercises: [ex.bench(), ex.inclineBar(), ex.pullup(), ex.row(), ex.fly(), ex.pullover()]
    },
    {
      name: "Shoulders & Arms A",
      day: "Tuesday",
      exercises: [ex.arnoldPress(), ex.lateral(), ex.rearDelt(), ex.barCurl(), ex.inclineCurl(), ex.overheadTri(), ex.pushdown()]
    },
    {
      name: "Legs A",
      day: "Wednesday",
      exercises: [ex.squat(), ex.legPress(), ex.rdl(), ex.legCurl(), ex.legExt(), ex.calf()]
    },
    {
      name: "Chest & Back B",
      day: "Thursday",
      exercises: [ex.inclineDb(), ex.dbBench(), ex.pullup(), ex.tbar(), ex.fly(), ex.pullover()]
    },
    {
      name: "Shoulders & Arms B",
      day: "Friday",
      exercises: [ex.overhead(), ex.frontRaise(), ex.cableLateral(), ex.rearDelt(), ex.preacher(), ex.hammer(), ex.skull(), ex.pushdown()]
    },
    {
      name: "Legs B",
      day: "Saturday",
      exercises: [ex.frontSquat(), ex.hack(), ex.rdl(), ex.legCurl(), ex.lunge(), ex.seatedCalf()]
    }
  ];

  // Keep existing workouts in the library, but unschedule them so this is the active week.
  state.customWorkouts = state.customWorkouts.map(workout => ({ ...workout, days: [] }));

  const stamp = Date.now();
  const newWorkouts = workouts.map((workout, index) => ({
    id: `starter-plan-${stamp}-${index}`,
    name: workout.name,
    builtIn: false,
    beginnerGenerated: true,
    personalArnold: true,
    days: [workout.day],
    exercises: workout.exercises.map(item => ({ ...item }))
  }));

  state.customWorkouts.push(...newWorkouts);
  saveCustomWorkouts();
  localStorage.setItem(migrationKey, "applied");

  // Make the new split visible immediately if the user opened the setup link from the app.
  state.page = "workouts";
  render();
  if (typeof showToast === "function") showToast("Arnold split added to your schedule");
})();
