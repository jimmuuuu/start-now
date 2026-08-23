# START/NOW Exercise Visual Audit — v38

## What was wrong

The repository did **not** contain a library of exercise-specific photos. The only asset in `assets/` was the muscle-anatomy base image. The base app also had a generic `machineSvg()` and `visual-assets.js` replaced it with one chest-press-machine illustration. That global visual was useful on the Home plan card, but it was not a valid demonstration for every exercise.

The v37 workout patch stopped using that generic machine inside workouts, but it still showed a muscle/equipment focus card rather than an actual movement demonstration.

## v38 architecture

`exercise-visual-system-v38.js` is now the single exercise-visual resolver.

Every exercise in `exerciseLibrary` is given:

- a stable `imageRef` based on its exercise ID (`exercise:<id>`)
- an `image` field (null until a real exercise-specific asset exists)
- a `visualKey`
- inferred/verified equipment
- `primaryMuscle`

The resolver is **ID-first**. Conservative alias matching is only used for older/custom exercises that lack a matching stable ID.

## Visual priority

1. Real exercise-specific image, when one is added to the map.
2. Verified movement-specific inline illustration.
3. Equipment-specific neutral fallback.
4. Neutral generic exercise fallback if equipment cannot be determined.

A random or unrelated gym-machine image is never used as a fallback.

External images use `loading="lazy"`, `decoding="async"`, `object-fit: contain`, and automatically fall back to the neutral card if loading fails. Broken-image icons should never be shown.

## Verified movement-specific illustrations currently included

The v38 resolver includes specific illustrations for these movement families/variations:

- Barbell Bench Press (including incline/decline barbell variants)
- Dumbbell Bench Press (including incline/decline dumbbell variants)
- Smith Machine Bench Press / Smith incline press
- Machine Chest Press / Chest Press
- Romanian Deadlift / Barbell Romanian Deadlift
- Dumbbell Romanian Deadlift
- Lat Pulldown
- Triceps Pushdown
- Leg Press
- Seated Cable Row / Cable Row
- Barbell Row
- One-Arm / Single-Arm Dumbbell Row
- Dumbbell Curl
- Push-Up variants
- Plank
- Pull-Up / Chin-Up family
- Dips
- Bodyweight Squat
- Lunge family

These are deliberately separate where equipment changes the movement/setup. For example, barbell bench, dumbbell bench, Smith bench, and machine chest press do not share the same visual.

## Romanian Deadlift check

Romanian Deadlift no longer resolves to a seated/chest-press machine. The resolver chooses:

- `rdl-barbell` for Romanian Deadlift / Barbell Romanian Deadlift
- `rdl-dumbbell` for Dumbbell Romanian Deadlift

If an unrecognized RDL variation cannot be classified safely, it falls back to a neutral equipment card rather than an unrelated machine.

## Full exercise audit

The app audits the complete current exercise library at startup. The exact list is exposed as:

```js
window.START_NOW_EXERCISE_VISUAL_AUDIT
```

Each row contains:

- exercise ID
- exercise name
- muscle
- equipment
- image path (if a real asset exists)
- visual key
- status

Status is either:

- `exercise-specific illustration`
- `safe equipment fallback — proper demo still needed`

This runtime list is intentional: it always stays synchronized with the current 250-exercise database as exercises are added, removed, or renamed.

To view only exercises that still need a proper movement visual:

```js
START_NOW_EXERCISE_VISUAL_AUDIT.filter(item => item.status.includes("still needed"))
```

Until a movement has been verified and given a proper illustration/photo, START/NOW displays a polished equipment fallback with the exercise name and **Exercise demonstration coming soon**. It does not pretend that fallback is the movement itself.

## Remaining work

The exercises reported by the runtime audit as `safe equipment fallback — proper demo still needed` still need individually reviewed visual assets. They are intentionally shown without misleading demonstrations in the meantime.

This means v38 prioritizes **accuracy over decoration**: a missing demonstration is allowed; a wrong demonstration is not.