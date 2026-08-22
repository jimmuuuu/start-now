// Adds 232 common exercises to the 18 built into app.js for a total of 250.
// Loaded after app.js so the existing workout logic and saved workouts stay unchanged.
(() => {
  const extraExercises = [
  {
    "id": "barbell-bench-press",
    "name": "Barbell Bench Press",
    "muscle": "Chest",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep the movement controlled and stop if your shoulders feel pinched."
  },
  {
    "id": "dumbbell-bench-press",
    "name": "Dumbbell Bench Press",
    "muscle": "Chest",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep the movement controlled and stop if your shoulders feel pinched."
  },
  {
    "id": "incline-barbell-bench-press",
    "name": "Incline Barbell Bench Press",
    "muscle": "Chest",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep the movement controlled and stop if your shoulders feel pinched."
  },
  {
    "id": "incline-dumbbell-bench-press",
    "name": "Incline Dumbbell Bench Press",
    "muscle": "Chest",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep the movement controlled and stop if your shoulders feel pinched."
  },
  {
    "id": "decline-barbell-bench-press",
    "name": "Decline Barbell Bench Press",
    "muscle": "Chest",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep the movement controlled and stop if your shoulders feel pinched."
  },
  {
    "id": "decline-dumbbell-bench-press",
    "name": "Decline Dumbbell Bench Press",
    "muscle": "Chest",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep the movement controlled and stop if your shoulders feel pinched."
  },
  {
    "id": "machine-chest-press",
    "name": "Machine Chest Press",
    "muscle": "Chest",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep the movement controlled and stop if your shoulders feel pinched."
  },
  {
    "id": "smith-machine-bench-press",
    "name": "Smith Machine Bench Press",
    "muscle": "Chest",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep the movement controlled and stop if your shoulders feel pinched."
  },
  {
    "id": "smith-machine-incline-press",
    "name": "Smith Machine Incline Press",
    "muscle": "Chest",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep the movement controlled and stop if your shoulders feel pinched."
  },
  {
    "id": "push-up",
    "name": "Push-Up",
    "muscle": "Chest",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep the movement controlled and stop if your shoulders feel pinched."
  },
  {
    "id": "wide-grip-push-up",
    "name": "Wide-Grip Push-Up",
    "muscle": "Chest",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep the movement controlled and stop if your shoulders feel pinched."
  },
  {
    "id": "close-grip-push-up",
    "name": "Close-Grip Push-Up",
    "muscle": "Chest",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep the movement controlled and stop if your shoulders feel pinched."
  },
  {
    "id": "decline-push-up",
    "name": "Decline Push-Up",
    "muscle": "Chest",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep the movement controlled and stop if your shoulders feel pinched."
  },
  {
    "id": "incline-push-up",
    "name": "Incline Push-Up",
    "muscle": "Chest",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep the movement controlled and stop if your shoulders feel pinched."
  },
  {
    "id": "chest-dip",
    "name": "Chest Dip",
    "muscle": "Chest",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep the movement controlled and stop if your shoulders feel pinched."
  },
  {
    "id": "pec-deck-fly",
    "name": "Pec Deck Fly",
    "muscle": "Chest",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep the movement controlled and stop if your shoulders feel pinched."
  },
  {
    "id": "dumbbell-fly",
    "name": "Dumbbell Fly",
    "muscle": "Chest",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep the movement controlled and stop if your shoulders feel pinched."
  },
  {
    "id": "incline-dumbbell-fly",
    "name": "Incline Dumbbell Fly",
    "muscle": "Chest",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep the movement controlled and stop if your shoulders feel pinched."
  },
  {
    "id": "low-to-high-cable-fly",
    "name": "Low-to-High Cable Fly",
    "muscle": "Chest",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep the movement controlled and stop if your shoulders feel pinched."
  },
  {
    "id": "high-to-low-cable-fly",
    "name": "High-to-Low Cable Fly",
    "muscle": "Chest",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep the movement controlled and stop if your shoulders feel pinched."
  },
  {
    "id": "single-arm-cable-fly",
    "name": "Single-Arm Cable Fly",
    "muscle": "Chest",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep the movement controlled and stop if your shoulders feel pinched."
  },
  {
    "id": "svend-press",
    "name": "Svend Press",
    "muscle": "Chest",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep the movement controlled and stop if your shoulders feel pinched."
  },
  {
    "id": "dumbbell-pullover",
    "name": "Dumbbell Pullover",
    "muscle": "Chest",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep the movement controlled and stop if your shoulders feel pinched."
  },
  {
    "id": "seated-dumbbell-shoulder-press",
    "name": "Seated Dumbbell Shoulder Press",
    "muscle": "Shoulders",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a controlled range and avoid shrugging or swinging."
  },
  {
    "id": "standing-dumbbell-shoulder-press",
    "name": "Standing Dumbbell Shoulder Press",
    "muscle": "Shoulders",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a controlled range and avoid shrugging or swinging."
  },
  {
    "id": "barbell-overhead-press",
    "name": "Barbell Overhead Press",
    "muscle": "Shoulders",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a controlled range and avoid shrugging or swinging."
  },
  {
    "id": "seated-barbell-press",
    "name": "Seated Barbell Press",
    "muscle": "Shoulders",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a controlled range and avoid shrugging or swinging."
  },
  {
    "id": "arnold-press",
    "name": "Arnold Press",
    "muscle": "Shoulders",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a controlled range and avoid shrugging or swinging."
  },
  {
    "id": "machine-shoulder-press",
    "name": "Machine Shoulder Press",
    "muscle": "Shoulders",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a controlled range and avoid shrugging or swinging."
  },
  {
    "id": "smith-machine-shoulder-press",
    "name": "Smith Machine Shoulder Press",
    "muscle": "Shoulders",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a controlled range and avoid shrugging or swinging."
  },
  {
    "id": "cable-lateral-raise",
    "name": "Cable Lateral Raise",
    "muscle": "Shoulders",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a controlled range and avoid shrugging or swinging."
  },
  {
    "id": "dumbbell-front-raise",
    "name": "Dumbbell Front Raise",
    "muscle": "Shoulders",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a controlled range and avoid shrugging or swinging."
  },
  {
    "id": "cable-front-raise",
    "name": "Cable Front Raise",
    "muscle": "Shoulders",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a controlled range and avoid shrugging or swinging."
  },
  {
    "id": "plate-front-raise",
    "name": "Plate Front Raise",
    "muscle": "Shoulders",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a controlled range and avoid shrugging or swinging."
  },
  {
    "id": "lean-away-lateral-raise",
    "name": "Lean-Away Lateral Raise",
    "muscle": "Shoulders",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a controlled range and avoid shrugging or swinging."
  },
  {
    "id": "machine-lateral-raise",
    "name": "Machine Lateral Raise",
    "muscle": "Shoulders",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a controlled range and avoid shrugging or swinging."
  },
  {
    "id": "upright-row",
    "name": "Upright Row",
    "muscle": "Shoulders",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a controlled range and avoid shrugging or swinging."
  },
  {
    "id": "landmine-press",
    "name": "Landmine Press",
    "muscle": "Shoulders",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a controlled range and avoid shrugging or swinging."
  },
  {
    "id": "single-arm-landmine-press",
    "name": "Single-Arm Landmine Press",
    "muscle": "Shoulders",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a controlled range and avoid shrugging or swinging."
  },
  {
    "id": "z-press",
    "name": "Z Press",
    "muscle": "Shoulders",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a controlled range and avoid shrugging or swinging."
  },
  {
    "id": "pike-push-up",
    "name": "Pike Push-Up",
    "muscle": "Shoulders",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a controlled range and avoid shrugging or swinging."
  },
  {
    "id": "hand-release-pike-push-up",
    "name": "Hand-Release Pike Push-Up",
    "muscle": "Shoulders",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a controlled range and avoid shrugging or swinging."
  },
  {
    "id": "face-pull",
    "name": "Face Pull",
    "muscle": "Rear Delts",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Move slowly and keep the work in your rear shoulders and upper back."
  },
  {
    "id": "rear-delt-cable-fly",
    "name": "Rear Delt Cable Fly",
    "muscle": "Rear Delts",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Move slowly and keep the work in your rear shoulders and upper back."
  },
  {
    "id": "bent-over-dumbbell-reverse-fly",
    "name": "Bent-Over Dumbbell Reverse Fly",
    "muscle": "Rear Delts",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Move slowly and keep the work in your rear shoulders and upper back."
  },
  {
    "id": "machine-reverse-fly",
    "name": "Machine Reverse Fly",
    "muscle": "Rear Delts",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Move slowly and keep the work in your rear shoulders and upper back."
  },
  {
    "id": "chest-supported-rear-delt-raise",
    "name": "Chest-Supported Rear Delt Raise",
    "muscle": "Rear Delts",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Move slowly and keep the work in your rear shoulders and upper back."
  },
  {
    "id": "cable-rear-delt-row",
    "name": "Cable Rear Delt Row",
    "muscle": "Rear Delts",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Move slowly and keep the work in your rear shoulders and upper back."
  },
  {
    "id": "band-pull-apart",
    "name": "Band Pull-Apart",
    "muscle": "Rear Delts",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Move slowly and keep the work in your rear shoulders and upper back."
  },
  {
    "id": "pull-up",
    "name": "Pull-Up",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "assisted-pull-up",
    "name": "Assisted Pull-Up",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "chin-up",
    "name": "Chin-Up",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "neutral-grip-pull-up",
    "name": "Neutral-Grip Pull-Up",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "wide-grip-lat-pulldown",
    "name": "Wide-Grip Lat Pulldown",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "close-grip-lat-pulldown",
    "name": "Close-Grip Lat Pulldown",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "neutral-grip-lat-pulldown",
    "name": "Neutral-Grip Lat Pulldown",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "single-arm-lat-pulldown",
    "name": "Single-Arm Lat Pulldown",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "straight-arm-pulldown",
    "name": "Straight-Arm Pulldown",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "barbell-row",
    "name": "Barbell Row",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "pendlay-row",
    "name": "Pendlay Row",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "underhand-barbell-row",
    "name": "Underhand Barbell Row",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "dumbbell-row",
    "name": "Dumbbell Row",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "one-arm-dumbbell-row",
    "name": "One-Arm Dumbbell Row",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "chest-supported-dumbbell-row",
    "name": "Chest-Supported Dumbbell Row",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "t-bar-row",
    "name": "T-Bar Row",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "chest-supported-t-bar-row",
    "name": "Chest-Supported T-Bar Row",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "machine-high-row",
    "name": "Machine High Row",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "machine-low-row",
    "name": "Machine Low Row",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "cable-row",
    "name": "Cable Row",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "wide-grip-cable-row",
    "name": "Wide-Grip Cable Row",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "single-arm-cable-row",
    "name": "Single-Arm Cable Row",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "meadows-row",
    "name": "Meadows Row",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "landmine-row",
    "name": "Landmine Row",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "seal-row",
    "name": "Seal Row",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "inverted-row",
    "name": "Inverted Row",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "trx-row",
    "name": "TRX Row",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "rack-pull",
    "name": "Rack Pull",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "conventional-deadlift",
    "name": "Conventional Deadlift",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "romanian-deadlift",
    "name": "Romanian Deadlift",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "sumo-deadlift",
    "name": "Sumo Deadlift",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "good-morning",
    "name": "Good Morning",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "back-extension",
    "name": "Back Extension",
    "muscle": "Back",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your torso controlled and pull with your back instead of jerking the weight."
  },
  {
    "id": "barbell-shrug",
    "name": "Barbell Shrug",
    "muscle": "Traps",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your neck relaxed and move the weight under control."
  },
  {
    "id": "dumbbell-shrug",
    "name": "Dumbbell Shrug",
    "muscle": "Traps",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your neck relaxed and move the weight under control."
  },
  {
    "id": "smith-machine-shrug",
    "name": "Smith Machine Shrug",
    "muscle": "Traps",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your neck relaxed and move the weight under control."
  },
  {
    "id": "cable-shrug",
    "name": "Cable Shrug",
    "muscle": "Traps",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your neck relaxed and move the weight under control."
  },
  {
    "id": "trap-bar-shrug",
    "name": "Trap Bar Shrug",
    "muscle": "Traps",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your neck relaxed and move the weight under control."
  },
  {
    "id": "farmer-carry",
    "name": "Farmer Carry",
    "muscle": "Traps",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your neck relaxed and move the weight under control."
  },
  {
    "id": "suitcase-carry",
    "name": "Suitcase Carry",
    "muscle": "Traps",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your neck relaxed and move the weight under control."
  },
  {
    "id": "barbell-curl",
    "name": "Barbell Curl",
    "muscle": "Biceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows steady and avoid using momentum."
  },
  {
    "id": "ez-bar-curl",
    "name": "EZ-Bar Curl",
    "muscle": "Biceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows steady and avoid using momentum."
  },
  {
    "id": "dumbbell-curl",
    "name": "Dumbbell Curl",
    "muscle": "Biceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows steady and avoid using momentum."
  },
  {
    "id": "alternating-dumbbell-curl",
    "name": "Alternating Dumbbell Curl",
    "muscle": "Biceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows steady and avoid using momentum."
  },
  {
    "id": "incline-dumbbell-curl",
    "name": "Incline Dumbbell Curl",
    "muscle": "Biceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows steady and avoid using momentum."
  },
  {
    "id": "preacher-curl",
    "name": "Preacher Curl",
    "muscle": "Biceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows steady and avoid using momentum."
  },
  {
    "id": "machine-preacher-curl",
    "name": "Machine Preacher Curl",
    "muscle": "Biceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows steady and avoid using momentum."
  },
  {
    "id": "cable-curl",
    "name": "Cable Curl",
    "muscle": "Biceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows steady and avoid using momentum."
  },
  {
    "id": "straight-bar-cable-curl",
    "name": "Straight-Bar Cable Curl",
    "muscle": "Biceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows steady and avoid using momentum."
  },
  {
    "id": "rope-hammer-curl",
    "name": "Rope Hammer Curl",
    "muscle": "Biceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows steady and avoid using momentum."
  },
  {
    "id": "cross-body-hammer-curl",
    "name": "Cross-Body Hammer Curl",
    "muscle": "Biceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows steady and avoid using momentum."
  },
  {
    "id": "concentration-curl",
    "name": "Concentration Curl",
    "muscle": "Biceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows steady and avoid using momentum."
  },
  {
    "id": "spider-curl",
    "name": "Spider Curl",
    "muscle": "Biceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows steady and avoid using momentum."
  },
  {
    "id": "bayesian-cable-curl",
    "name": "Bayesian Cable Curl",
    "muscle": "Biceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows steady and avoid using momentum."
  },
  {
    "id": "rope-triceps-pushdown",
    "name": "Rope Triceps Pushdown",
    "muscle": "Triceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows controlled and use a smooth range of motion."
  },
  {
    "id": "straight-bar-pushdown",
    "name": "Straight-Bar Pushdown",
    "muscle": "Triceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows controlled and use a smooth range of motion."
  },
  {
    "id": "v-bar-pushdown",
    "name": "V-Bar Pushdown",
    "muscle": "Triceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows controlled and use a smooth range of motion."
  },
  {
    "id": "single-arm-pushdown",
    "name": "Single-Arm Pushdown",
    "muscle": "Triceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows controlled and use a smooth range of motion."
  },
  {
    "id": "reverse-grip-pushdown",
    "name": "Reverse-Grip Pushdown",
    "muscle": "Triceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows controlled and use a smooth range of motion."
  },
  {
    "id": "overhead-cable-triceps-extension",
    "name": "Overhead Cable Triceps Extension",
    "muscle": "Triceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows controlled and use a smooth range of motion."
  },
  {
    "id": "rope-overhead-extension",
    "name": "Rope Overhead Extension",
    "muscle": "Triceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows controlled and use a smooth range of motion."
  },
  {
    "id": "dumbbell-overhead-triceps-extension",
    "name": "Dumbbell Overhead Triceps Extension",
    "muscle": "Triceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows controlled and use a smooth range of motion."
  },
  {
    "id": "single-arm-dumbbell-triceps-extension",
    "name": "Single-Arm Dumbbell Triceps Extension",
    "muscle": "Triceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows controlled and use a smooth range of motion."
  },
  {
    "id": "skull-crusher",
    "name": "Skull Crusher",
    "muscle": "Triceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows controlled and use a smooth range of motion."
  },
  {
    "id": "ez-bar-skull-crusher",
    "name": "EZ-Bar Skull Crusher",
    "muscle": "Triceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows controlled and use a smooth range of motion."
  },
  {
    "id": "dumbbell-skull-crusher",
    "name": "Dumbbell Skull Crusher",
    "muscle": "Triceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows controlled and use a smooth range of motion."
  },
  {
    "id": "close-grip-bench-press",
    "name": "Close-Grip Bench Press",
    "muscle": "Triceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows controlled and use a smooth range of motion."
  },
  {
    "id": "bench-dip",
    "name": "Bench Dip",
    "muscle": "Triceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows controlled and use a smooth range of motion."
  },
  {
    "id": "assisted-dip",
    "name": "Assisted Dip",
    "muscle": "Triceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows controlled and use a smooth range of motion."
  },
  {
    "id": "triceps-dip",
    "name": "Triceps Dip",
    "muscle": "Triceps",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Keep your elbows controlled and use a smooth range of motion."
  },
  {
    "id": "wrist-curl",
    "name": "Wrist Curl",
    "muscle": "Forearms",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Use light, controlled reps and keep your wrists comfortable."
  },
  {
    "id": "reverse-wrist-curl",
    "name": "Reverse Wrist Curl",
    "muscle": "Forearms",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Use light, controlled reps and keep your wrists comfortable."
  },
  {
    "id": "behind-the-back-wrist-curl",
    "name": "Behind-the-Back Wrist Curl",
    "muscle": "Forearms",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Use light, controlled reps and keep your wrists comfortable."
  },
  {
    "id": "cable-wrist-curl",
    "name": "Cable Wrist Curl",
    "muscle": "Forearms",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Use light, controlled reps and keep your wrists comfortable."
  },
  {
    "id": "dumbbell-wrist-curl",
    "name": "Dumbbell Wrist Curl",
    "muscle": "Forearms",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Use light, controlled reps and keep your wrists comfortable."
  },
  {
    "id": "plate-pinch",
    "name": "Plate Pinch",
    "muscle": "Forearms",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Use light, controlled reps and keep your wrists comfortable."
  },
  {
    "id": "dead-hang",
    "name": "Dead Hang",
    "muscle": "Forearms",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Use light, controlled reps and keep your wrists comfortable."
  },
  {
    "id": "towel-hang",
    "name": "Towel Hang",
    "muscle": "Forearms",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Use light, controlled reps and keep your wrists comfortable."
  },
  {
    "id": "back-squat",
    "name": "Back Squat",
    "muscle": "Quads",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your knees tracking naturally and use a depth you can control."
  },
  {
    "id": "front-squat",
    "name": "Front Squat",
    "muscle": "Quads",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your knees tracking naturally and use a depth you can control."
  },
  {
    "id": "goblet-squat",
    "name": "Goblet Squat",
    "muscle": "Quads",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your knees tracking naturally and use a depth you can control."
  },
  {
    "id": "smith-machine-squat",
    "name": "Smith Machine Squat",
    "muscle": "Quads",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your knees tracking naturally and use a depth you can control."
  },
  {
    "id": "hack-squat",
    "name": "Hack Squat",
    "muscle": "Quads",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your knees tracking naturally and use a depth you can control."
  },
  {
    "id": "pendulum-squat",
    "name": "Pendulum Squat",
    "muscle": "Quads",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your knees tracking naturally and use a depth you can control."
  },
  {
    "id": "bulgarian-split-squat",
    "name": "Bulgarian Split Squat",
    "muscle": "Quads",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your knees tracking naturally and use a depth you can control."
  },
  {
    "id": "dumbbell-split-squat",
    "name": "Dumbbell Split Squat",
    "muscle": "Quads",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your knees tracking naturally and use a depth you can control."
  },
  {
    "id": "reverse-lunge",
    "name": "Reverse Lunge",
    "muscle": "Quads",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your knees tracking naturally and use a depth you can control."
  },
  {
    "id": "forward-lunge",
    "name": "Forward Lunge",
    "muscle": "Quads",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your knees tracking naturally and use a depth you can control."
  },
  {
    "id": "walking-lunge",
    "name": "Walking Lunge",
    "muscle": "Quads",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your knees tracking naturally and use a depth you can control."
  },
  {
    "id": "step-up",
    "name": "Step-Up",
    "muscle": "Quads",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your knees tracking naturally and use a depth you can control."
  },
  {
    "id": "box-squat",
    "name": "Box Squat",
    "muscle": "Quads",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your knees tracking naturally and use a depth you can control."
  },
  {
    "id": "sissy-squat",
    "name": "Sissy Squat",
    "muscle": "Quads",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your knees tracking naturally and use a depth you can control."
  },
  {
    "id": "wall-sit",
    "name": "Wall Sit",
    "muscle": "Quads",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your knees tracking naturally and use a depth you can control."
  },
  {
    "id": "spanish-squat",
    "name": "Spanish Squat",
    "muscle": "Quads",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your knees tracking naturally and use a depth you can control."
  },
  {
    "id": "cyclist-squat",
    "name": "Cyclist Squat",
    "muscle": "Quads",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your knees tracking naturally and use a depth you can control."
  },
  {
    "id": "heel-elevated-goblet-squat",
    "name": "Heel-Elevated Goblet Squat",
    "muscle": "Quads",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your knees tracking naturally and use a depth you can control."
  },
  {
    "id": "seated-leg-curl",
    "name": "Seated Leg Curl",
    "muscle": "Hamstrings",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Move slowly, keep your back controlled, and avoid forcing the stretch."
  },
  {
    "id": "lying-leg-curl",
    "name": "Lying Leg Curl",
    "muscle": "Hamstrings",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Move slowly, keep your back controlled, and avoid forcing the stretch."
  },
  {
    "id": "standing-leg-curl",
    "name": "Standing Leg Curl",
    "muscle": "Hamstrings",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Move slowly, keep your back controlled, and avoid forcing the stretch."
  },
  {
    "id": "single-leg-leg-curl",
    "name": "Single-Leg Leg Curl",
    "muscle": "Hamstrings",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Move slowly, keep your back controlled, and avoid forcing the stretch."
  },
  {
    "id": "dumbbell-romanian-deadlift",
    "name": "Dumbbell Romanian Deadlift",
    "muscle": "Hamstrings",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Move slowly, keep your back controlled, and avoid forcing the stretch."
  },
  {
    "id": "barbell-romanian-deadlift",
    "name": "Barbell Romanian Deadlift",
    "muscle": "Hamstrings",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Move slowly, keep your back controlled, and avoid forcing the stretch."
  },
  {
    "id": "single-leg-romanian-deadlift",
    "name": "Single-Leg Romanian Deadlift",
    "muscle": "Hamstrings",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Move slowly, keep your back controlled, and avoid forcing the stretch."
  },
  {
    "id": "stiff-leg-deadlift",
    "name": "Stiff-Leg Deadlift",
    "muscle": "Hamstrings",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Move slowly, keep your back controlled, and avoid forcing the stretch."
  },
  {
    "id": "nordic-hamstring-curl",
    "name": "Nordic Hamstring Curl",
    "muscle": "Hamstrings",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Move slowly, keep your back controlled, and avoid forcing the stretch."
  },
  {
    "id": "glute-ham-raise",
    "name": "Glute-Ham Raise",
    "muscle": "Hamstrings",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Move slowly, keep your back controlled, and avoid forcing the stretch."
  },
  {
    "id": "cable-pull-through",
    "name": "Cable Pull-Through",
    "muscle": "Hamstrings",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Move slowly, keep your back controlled, and avoid forcing the stretch."
  },
  {
    "id": "kettlebell-swing",
    "name": "Kettlebell Swing",
    "muscle": "Hamstrings",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Move slowly, keep your back controlled, and avoid forcing the stretch."
  },
  {
    "id": "45-degree-back-extension",
    "name": "45-Degree Back Extension",
    "muscle": "Hamstrings",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Move slowly, keep your back controlled, and avoid forcing the stretch."
  },
  {
    "id": "barbell-hip-thrust",
    "name": "Barbell Hip Thrust",
    "muscle": "Glutes",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your pelvis controlled and squeeze your glutes without overextending."
  },
  {
    "id": "smith-machine-hip-thrust",
    "name": "Smith Machine Hip Thrust",
    "muscle": "Glutes",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your pelvis controlled and squeeze your glutes without overextending."
  },
  {
    "id": "dumbbell-hip-thrust",
    "name": "Dumbbell Hip Thrust",
    "muscle": "Glutes",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your pelvis controlled and squeeze your glutes without overextending."
  },
  {
    "id": "glute-bridge",
    "name": "Glute Bridge",
    "muscle": "Glutes",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your pelvis controlled and squeeze your glutes without overextending."
  },
  {
    "id": "single-leg-glute-bridge",
    "name": "Single-Leg Glute Bridge",
    "muscle": "Glutes",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your pelvis controlled and squeeze your glutes without overextending."
  },
  {
    "id": "machine-glute-drive",
    "name": "Machine Glute Drive",
    "muscle": "Glutes",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your pelvis controlled and squeeze your glutes without overextending."
  },
  {
    "id": "cable-glute-kickback",
    "name": "Cable Glute Kickback",
    "muscle": "Glutes",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your pelvis controlled and squeeze your glutes without overextending."
  },
  {
    "id": "machine-glute-kickback",
    "name": "Machine Glute Kickback",
    "muscle": "Glutes",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your pelvis controlled and squeeze your glutes without overextending."
  },
  {
    "id": "donkey-kick",
    "name": "Donkey Kick",
    "muscle": "Glutes",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your pelvis controlled and squeeze your glutes without overextending."
  },
  {
    "id": "fire-hydrant",
    "name": "Fire Hydrant",
    "muscle": "Glutes",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your pelvis controlled and squeeze your glutes without overextending."
  },
  {
    "id": "frog-pump",
    "name": "Frog Pump",
    "muscle": "Glutes",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your pelvis controlled and squeeze your glutes without overextending."
  },
  {
    "id": "step-down",
    "name": "Step-Down",
    "muscle": "Glutes",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your pelvis controlled and squeeze your glutes without overextending."
  },
  {
    "id": "curtsy-lunge",
    "name": "Curtsy Lunge",
    "muscle": "Glutes",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your pelvis controlled and squeeze your glutes without overextending."
  },
  {
    "id": "cable-hip-abduction",
    "name": "Cable Hip Abduction",
    "muscle": "Glutes",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your pelvis controlled and squeeze your glutes without overextending."
  },
  {
    "id": "band-hip-abduction",
    "name": "Band Hip Abduction",
    "muscle": "Glutes",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your pelvis controlled and squeeze your glutes without overextending."
  },
  {
    "id": "seated-hip-abduction",
    "name": "Seated Hip Abduction",
    "muscle": "Glutes",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your pelvis controlled and squeeze your glutes without overextending."
  },
  {
    "id": "standing-hip-abduction",
    "name": "Standing Hip Abduction",
    "muscle": "Glutes",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your pelvis controlled and squeeze your glutes without overextending."
  },
  {
    "id": "lateral-band-walk",
    "name": "Lateral Band Walk",
    "muscle": "Glutes",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Keep your pelvis controlled and squeeze your glutes without overextending."
  },
  {
    "id": "standing-calf-raise",
    "name": "Standing Calf Raise",
    "muscle": "Calves",
    "sets": 3,
    "reps": 15,
    "weight": 0,
    "cue": "Pause at the top and lower through a comfortable full range."
  },
  {
    "id": "seated-calf-raise",
    "name": "Seated Calf Raise",
    "muscle": "Calves",
    "sets": 3,
    "reps": 15,
    "weight": 0,
    "cue": "Pause at the top and lower through a comfortable full range."
  },
  {
    "id": "leg-press-calf-raise",
    "name": "Leg Press Calf Raise",
    "muscle": "Calves",
    "sets": 3,
    "reps": 15,
    "weight": 0,
    "cue": "Pause at the top and lower through a comfortable full range."
  },
  {
    "id": "single-leg-calf-raise",
    "name": "Single-Leg Calf Raise",
    "muscle": "Calves",
    "sets": 3,
    "reps": 15,
    "weight": 0,
    "cue": "Pause at the top and lower through a comfortable full range."
  },
  {
    "id": "donkey-calf-raise",
    "name": "Donkey Calf Raise",
    "muscle": "Calves",
    "sets": 3,
    "reps": 15,
    "weight": 0,
    "cue": "Pause at the top and lower through a comfortable full range."
  },
  {
    "id": "smith-machine-calf-raise",
    "name": "Smith Machine Calf Raise",
    "muscle": "Calves",
    "sets": 3,
    "reps": 15,
    "weight": 0,
    "cue": "Pause at the top and lower through a comfortable full range."
  },
  {
    "id": "machine-calf-raise",
    "name": "Machine Calf Raise",
    "muscle": "Calves",
    "sets": 3,
    "reps": 15,
    "weight": 0,
    "cue": "Pause at the top and lower through a comfortable full range."
  },
  {
    "id": "tibialis-raise",
    "name": "Tibialis Raise",
    "muscle": "Calves",
    "sets": 3,
    "reps": 15,
    "weight": 0,
    "cue": "Pause at the top and lower through a comfortable full range."
  },
  {
    "id": "crunch",
    "name": "Crunch",
    "muscle": "Core",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Brace your midsection and keep your lower back in a comfortable position."
  },
  {
    "id": "sit-up",
    "name": "Sit-Up",
    "muscle": "Core",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Brace your midsection and keep your lower back in a comfortable position."
  },
  {
    "id": "decline-sit-up",
    "name": "Decline Sit-Up",
    "muscle": "Core",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Brace your midsection and keep your lower back in a comfortable position."
  },
  {
    "id": "reverse-crunch",
    "name": "Reverse Crunch",
    "muscle": "Core",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Brace your midsection and keep your lower back in a comfortable position."
  },
  {
    "id": "bicycle-crunch",
    "name": "Bicycle Crunch",
    "muscle": "Core",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Brace your midsection and keep your lower back in a comfortable position."
  },
  {
    "id": "dead-bug",
    "name": "Dead Bug",
    "muscle": "Core",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Brace your midsection and keep your lower back in a comfortable position."
  },
  {
    "id": "bird-dog",
    "name": "Bird Dog",
    "muscle": "Core",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Brace your midsection and keep your lower back in a comfortable position."
  },
  {
    "id": "hollow-hold",
    "name": "Hollow Hold",
    "muscle": "Core",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Brace your midsection and keep your lower back in a comfortable position."
  },
  {
    "id": "hollow-rock",
    "name": "Hollow Rock",
    "muscle": "Core",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Brace your midsection and keep your lower back in a comfortable position."
  },
  {
    "id": "side-plank",
    "name": "Side Plank",
    "muscle": "Core",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Brace your midsection and keep your lower back in a comfortable position."
  },
  {
    "id": "plank-shoulder-tap",
    "name": "Plank Shoulder Tap",
    "muscle": "Core",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Brace your midsection and keep your lower back in a comfortable position."
  },
  {
    "id": "mountain-climber",
    "name": "Mountain Climber",
    "muscle": "Core",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Brace your midsection and keep your lower back in a comfortable position."
  },
  {
    "id": "hanging-knee-raise",
    "name": "Hanging Knee Raise",
    "muscle": "Core",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Brace your midsection and keep your lower back in a comfortable position."
  },
  {
    "id": "hanging-leg-raise",
    "name": "Hanging Leg Raise",
    "muscle": "Core",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Brace your midsection and keep your lower back in a comfortable position."
  },
  {
    "id": "captain-s-chair-knee-raise",
    "name": "Captain's Chair Knee Raise",
    "muscle": "Core",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Brace your midsection and keep your lower back in a comfortable position."
  },
  {
    "id": "ab-wheel-rollout",
    "name": "Ab Wheel Rollout",
    "muscle": "Core",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Brace your midsection and keep your lower back in a comfortable position."
  },
  {
    "id": "stability-ball-crunch",
    "name": "Stability Ball Crunch",
    "muscle": "Core",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Brace your midsection and keep your lower back in a comfortable position."
  },
  {
    "id": "swiss-ball-pike",
    "name": "Swiss Ball Pike",
    "muscle": "Core",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Brace your midsection and keep your lower back in a comfortable position."
  },
  {
    "id": "v-up",
    "name": "V-Up",
    "muscle": "Core",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Brace your midsection and keep your lower back in a comfortable position."
  },
  {
    "id": "toe-touch",
    "name": "Toe Touch",
    "muscle": "Core",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Brace your midsection and keep your lower back in a comfortable position."
  },
  {
    "id": "russian-twist",
    "name": "Russian Twist",
    "muscle": "Core",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Brace your midsection and keep your lower back in a comfortable position."
  },
  {
    "id": "pallof-press",
    "name": "Pallof Press",
    "muscle": "Core",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Brace your midsection and keep your lower back in a comfortable position."
  },
  {
    "id": "cable-wood-chop",
    "name": "Cable Wood Chop",
    "muscle": "Core",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Brace your midsection and keep your lower back in a comfortable position."
  },
  {
    "id": "landmine-rotation",
    "name": "Landmine Rotation",
    "muscle": "Core",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Brace your midsection and keep your lower back in a comfortable position."
  },
  {
    "id": "suitcase-march",
    "name": "Suitcase March",
    "muscle": "Core",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Brace your midsection and keep your lower back in a comfortable position."
  },
  {
    "id": "bear-crawl",
    "name": "Bear Crawl",
    "muscle": "Core",
    "sets": 3,
    "reps": 12,
    "weight": 0,
    "cue": "Brace your midsection and keep your lower back in a comfortable position."
  },
  {
    "id": "burpee",
    "name": "Burpee",
    "muscle": "Full Body",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a weight and pace you can control with solid form."
  },
  {
    "id": "dumbbell-thruster",
    "name": "Dumbbell Thruster",
    "muscle": "Full Body",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a weight and pace you can control with solid form."
  },
  {
    "id": "kettlebell-goblet-thruster",
    "name": "Kettlebell Goblet Thruster",
    "muscle": "Full Body",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a weight and pace you can control with solid form."
  },
  {
    "id": "dumbbell-clean-and-press",
    "name": "Dumbbell Clean and Press",
    "muscle": "Full Body",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a weight and pace you can control with solid form."
  },
  {
    "id": "kettlebell-clean-and-press",
    "name": "Kettlebell Clean and Press",
    "muscle": "Full Body",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a weight and pace you can control with solid form."
  },
  {
    "id": "push-press",
    "name": "Push Press",
    "muscle": "Full Body",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a weight and pace you can control with solid form."
  },
  {
    "id": "dumbbell-push-press",
    "name": "Dumbbell Push Press",
    "muscle": "Full Body",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a weight and pace you can control with solid form."
  },
  {
    "id": "kettlebell-deadlift",
    "name": "Kettlebell Deadlift",
    "muscle": "Full Body",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a weight and pace you can control with solid form."
  },
  {
    "id": "trap-bar-deadlift",
    "name": "Trap Bar Deadlift",
    "muscle": "Full Body",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a weight and pace you can control with solid form."
  },
  {
    "id": "sled-push",
    "name": "Sled Push",
    "muscle": "Full Body",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a weight and pace you can control with solid form."
  },
  {
    "id": "sled-pull",
    "name": "Sled Pull",
    "muscle": "Full Body",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a weight and pace you can control with solid form."
  },
  {
    "id": "battle-rope-waves",
    "name": "Battle Rope Waves",
    "muscle": "Full Body",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a weight and pace you can control with solid form."
  },
  {
    "id": "medicine-ball-slam",
    "name": "Medicine Ball Slam",
    "muscle": "Full Body",
    "sets": 3,
    "reps": 10,
    "weight": 0,
    "cue": "Use a weight and pace you can control with solid form."
  },
  {
    "id": "treadmill-walk",
    "name": "Treadmill Walk",
    "muscle": "Cardio",
    "sets": 1,
    "reps": 10,
    "weight": 0,
    "cue": "Use a comfortable pace and build intensity gradually."
  },
  {
    "id": "treadmill-run",
    "name": "Treadmill Run",
    "muscle": "Cardio",
    "sets": 1,
    "reps": 10,
    "weight": 0,
    "cue": "Use a comfortable pace and build intensity gradually."
  },
  {
    "id": "incline-treadmill-walk",
    "name": "Incline Treadmill Walk",
    "muscle": "Cardio",
    "sets": 1,
    "reps": 10,
    "weight": 0,
    "cue": "Use a comfortable pace and build intensity gradually."
  },
  {
    "id": "stationary-bike",
    "name": "Stationary Bike",
    "muscle": "Cardio",
    "sets": 1,
    "reps": 10,
    "weight": 0,
    "cue": "Use a comfortable pace and build intensity gradually."
  },
  {
    "id": "recumbent-bike",
    "name": "Recumbent Bike",
    "muscle": "Cardio",
    "sets": 1,
    "reps": 10,
    "weight": 0,
    "cue": "Use a comfortable pace and build intensity gradually."
  },
  {
    "id": "elliptical",
    "name": "Elliptical",
    "muscle": "Cardio",
    "sets": 1,
    "reps": 10,
    "weight": 0,
    "cue": "Use a comfortable pace and build intensity gradually."
  },
  {
    "id": "stair-climber",
    "name": "Stair Climber",
    "muscle": "Cardio",
    "sets": 1,
    "reps": 10,
    "weight": 0,
    "cue": "Use a comfortable pace and build intensity gradually."
  },
  {
    "id": "rowing-machine",
    "name": "Rowing Machine",
    "muscle": "Cardio",
    "sets": 1,
    "reps": 10,
    "weight": 0,
    "cue": "Use a comfortable pace and build intensity gradually."
  },
  {
    "id": "ski-erg",
    "name": "Ski Erg",
    "muscle": "Cardio",
    "sets": 1,
    "reps": 10,
    "weight": 0,
    "cue": "Use a comfortable pace and build intensity gradually."
  },
  {
    "id": "jump-rope",
    "name": "Jump Rope",
    "muscle": "Cardio",
    "sets": 1,
    "reps": 10,
    "weight": 0,
    "cue": "Use a comfortable pace and build intensity gradually."
  }
];

  const existingIds = new Set(exerciseLibrary.map(exercise => exercise.id));
  for (const exercise of extraExercises) {
    if (!existingIds.has(exercise.id)) {
      exerciseLibrary.push(exercise);
      existingIds.add(exercise.id);
    }
  }
})();
