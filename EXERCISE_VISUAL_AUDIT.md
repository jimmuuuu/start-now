# START/NOW Exercise Visual Audit — v39

## What was wrong

The app did not have a real exercise-image library. The repository only had a muscle-anatomy asset plus a generic machine illustration originally intended for the Home plan card. Reusing that machine inside workouts made unrelated movements look wrong.

## v39 fix

`exercise-visual-system-v39.js` is now the active exercise-visual resolver.

The system is **ID-first** and keeps one stable reference per exercise:

- `imageRef: exercise:<exercise-id>`
- `image`: a real exercise-specific asset when one exists, otherwise `null`
- `visualKey`: the verified movement illustration key, or `null`
- `equipment`
- `primaryMuscle`

Legacy/custom exercises can use conservative name aliases, but uncertain exercises deliberately fall back instead of guessing.

## Visual priority

1. Correct exercise-specific image, when available.
2. Verified exercise-specific inline illustration.
3. Equipment-specific neutral fallback.
4. Neutral generic fallback if equipment cannot be determined.

A random machine image is never used as a fallback.

If a future image fails to load, the image error handler automatically replaces it with the neutral fallback. Images use lazy loading and `object-fit: contain` so they are not stretched or cropped.

## Movement-specific visuals currently verified

The resolver currently includes dedicated visuals for common movement families including:

- Barbell, dumbbell, Smith, and machine chest presses
- Pec deck and dumbbell fly
- Romanian Deadlift / Barbell RDL
- Dumbbell Romanian Deadlift
- Lat Pulldown
- Seated Cable Row
- Barbell Row
- Dumbbell Row
- Leg Press
- Leg Extension
- Leg Curl
- Calf Raise
- Machine, dumbbell, and barbell shoulder press
- Dumbbell, cable, and machine lateral raise
- Machine/cable reverse-fly family
- Face Pull
- Barbell Curl
- Dumbbell/Hammer Curl family
- Triceps Pushdown
- Push-Up family
- Plank
- Pull-Up / Chin-Up family
- Dips
- Bodyweight Squat
- Lunge family

Different equipment/setup variants use different visual keys where the setup matters. Bench press, for example, does not reuse the machine chest-press illustration.

## Romanian Deadlift verification

Romanian Deadlift no longer resolves to the seated machine artwork.

- Romanian Deadlift / Barbell Romanian Deadlift → `rdl-barbell`
- Dumbbell Romanian Deadlift → `rdl-dumbbell`

If an unknown RDL variation cannot be classified safely, START/NOW shows the neutral equipment fallback instead of a false demonstration.

## Complete exercise audit

Every exercise in the current `exerciseLibrary` is audited at startup. The full synchronized list is exposed as:

```js
window.START_NOW_EXERCISE_VISUAL_AUDIT
```

The list of exercises that still need a proper movement-specific visual is exposed as:

```js
window.START_NOW_EXERCISES_NEEDING_VISUALS
```

Each audit row includes:

- ID
- name
- muscle
- equipment
- real image path, if present
- visual key
- status

Status is either:

- `exercise-specific illustration`
- `safe equipment fallback — proper demo still needed`

This runtime audit is used instead of pretending all 250 exercises already have verified demonstrations. It stays synchronized as the exercise library changes.

## User-facing behavior for missing visuals

Exercises without a verified demonstration now show a polished card containing:

- a correct equipment icon
- the exercise name
- `No demonstration available yet`
- equipment and muscle information

No broken image icon is shown, no blank white box is shown, and no unrelated machine is substituted.

## Reliability improvement from v38 to v39

v39 removes the old workout-visual enhancer from the page and uses a single resolver/observer. It only redraws when the current exercise actually changes, avoiding competing visual patches and repeated DOM replacement.

The rule is now simple: **accuracy over decoration**.