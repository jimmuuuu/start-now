# START/NOW Exercise Visual System — v40

## Goal

Exercise visuals now prioritize **instructional accuracy over realistic AI-generated equipment**.

The workout screen no longer depends on a generic photorealistic or AI-generated machine image. The v40 system uses a reusable vector illustration library with consistent start/finish diagrams.

## Visual priority

1. Approved exercise-specific static asset, if one is explicitly mapped.
2. Approved START/NOW start/finish instructional vector diagram.
3. Dynamic muscle-focus diagram for that exercise.
4. Neutral equipment icon only if the muscle diagram cannot render.

An unrelated machine image is never used as a fallback.

## Diagram design

Approved v40 diagrams use the same design language:

- light neutral background
- dark simplified body outline
- blue active/moving limbs
- simplified equipment
- separate START and FINISH panels
- movement arrow between positions
- exercise name/instructions rendered by the app, not baked into the illustration

The diagrams are intentionally instructional rather than photorealistic. They show the movement and setup without attempting to reproduce a specific commercial gym machine.

## Exercise page layout

The exercise details modal is upgraded to show:

1. Exercise name
2. Large exercise visual
3. Primary and secondary muscles
4. How to perform it — short ordered steps
5. Form tips
6. Existing alternatives and history controls

## Reusable library

The illustration code is separated from the renderer:

- `exercise-illustration-library-v40.js`
- `exercise-illustration-library-v40-extra.js`
- `exercise-visual-system-v40.js`

The visual system maps stable exercise IDs to approved movement keys. Close variants only share a diagram when the movement/setup is genuinely equivalent. Equipment-changing variants receive different keys where needed.

Examples:

- Romanian Deadlift → `rdl-barbell`
- Dumbbell Romanian Deadlift → `rdl-dumbbell`
- Lat Pulldown → `lat-pulldown`
- Leg Press → `leg-press`
- Machine Chest Press → `chest-press-machine`
- Dumbbell Bench Press → `bench-dumbbell`
- Barbell Bench Press → `bench-barbell`
- Machine Shoulder Press → `shoulder-press-machine`
- Cable Lateral Raise → `lateral-raise-cable`
- Dumbbell Lateral Raise → `lateral-raise-dumbbell`

## Full-library audit

At startup the current exercise database is audited automatically and exposed as:

```js
START_NOW_EXERCISE_VISUAL_AUDIT
```

Exercises still waiting for an approved movement diagram are available as:

```js
START_NOW_EXERCISES_NEEDING_VISUALS
```

Those exercises intentionally display the correct muscle map rather than an inaccurate exercise drawing.

This lets START/NOW expand the illustration library over time without ever using a misleading placeholder.