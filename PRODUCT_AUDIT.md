# START/NOW Product Audit — v36

This audit was performed before the v36 product upgrade. The app was **extended in place**, not rebuilt.

## Existing architecture

START/NOW is currently a static HTML/CSS/JavaScript application. The existing project already had a strong feature-layer pattern: `app.js` supplies the base UI/state, then later scripts enhance workout plans, progress, grading, streaks, schedule editing, saved-workout reliability, and visuals.

Important existing persisted data:

- `sn_custom_workouts` — saved workouts and schedules
- `sn_progress_sessions` — completed workout history
- `sn_streak` / `sn_completed` — legacy summary values kept in sync with real history
- `sn_dark` — dark-mode preference

The current repository does **not** contain an authentication implementation or a connected database/backend. Existing user data is stored in browser `localStorage`. v36 therefore does not invent a fake backend or replace local data. It adds safer local persistence while keeping the existing storage keys compatible.

## Already working before v36

- Home page with today's scheduled workout and Start Workout
- Custom workout creation
- Exact weekly scheduling
- Beginner plan generator with goal, training days, location/equipment, and session length
- Editable beginner-plan preview before saving
- Multiple plan structures rather than forcing one split
- Weekly schedule editor
- 250-exercise library data set
- Basic in-workout weight/reps logging
- Completed-workout history
- Progress dashboard with weekly activity, training time, completed sets, volume, muscle groups, PR list, grade trend, workout history, and milestones
- +/- workout grading system
- Real streak calculation where planned rest days do not break the streak
- Saved-workout cross-tab protection
- Dynamic muscle-focus graphic
- Dark mode

## Incomplete areas found

The existing active-workout experience did not persist an in-progress session across a refresh/close, previous performance was not shown beside the current exercise, progressive-overload guidance was missing, rest timing was only text, set add/remove and exercise swap were missing, and workout completion did not produce a complete performance summary.

The existing PR system mainly surfaced heaviest logged weight. Exercise history did not have a dedicated drill-down page. The 250-exercise library was primarily data used by builders rather than a user-facing searchable reference with equipment/instruction/alternative information.

The profile grade and progress experience needed a clearer rolling training-grade explanation. Plan creation supported custom and beginner-generated plans but did not offer clearly named routine templates such as PPL, Upper/Lower, Full Body, and Arnold while keeping everything editable.

## v36 upgrades

### Workout logging

- Autosaved in-progress workout session
- Resume after closing/refreshing
- Previous performance beside each exercise
- Conservative, history-based progression suggestions with explanations
- Weight/reps per set
- Complete/uncomplete set
- Add/remove set
- Skip exercise
- Swap exercise without permanently modifying the saved plan
- Finish early
- Cancel with confirmation
- Beginner-friendly rep-range explanation

### Rest timer

- Configurable rest duration
- Auto-start after completing a set
- Manual start
- Pause/resume
- Skip
- +/- 15 seconds
- Saved preference
- Completion toast and supported-device vibration

### Workout feedback

- Workout summary with duration, sets, volume, PRs, volume comparison, streak, and grade
- Automatic PR checks for weight, estimated strength, exercise volume, and workout volume
- Workout grade remains separate from streak
- Grade weights quality of the individual workout: completion, rep targets, exercise completion, recent performance, and logging
- No bonus for unsafe load chasing or unnecessary extra sets

### Progress and history

- Rolling overall Training Grade with recent-workout weighting and schedule adherence
- One poor workout has limited effect on overall grade
- Total workouts, 30-day workouts, best streak, and total volume
- Workout-duration trend
- Dedicated exercise-history page with best, last workout, recent change, volume trend, and logged sessions

### Exercise library

- Searchable user-facing exercise library
- Muscle, equipment, and gym/home filters
- Exercise details
- Primary/secondary muscles
- Equipment inference
- Instructions/cues
- Common mistakes
- Similar-muscle alternatives
- Direct exercise-history access

### Plans and personalization

- Existing custom and beginner systems preserved
- Existing saved workouts can now be edited: name, days, sets, rep ranges, exercise order, add/remove exercises
- Editable templates for Push/Pull/Legs, Upper/Lower, Full Body, and Arnold Split
- Short training-preferences flow for experience, goal, preferred days, location, workout length, and exercises to avoid
- Existing users are not forced back through onboarding

## Reliability note

v36 preserves the existing local-first architecture. A future true cross-device account system should migrate these compatible local data structures to the chosen backend rather than replacing or faking them. Until then, the app is designed to survive normal refresh/close behavior in the same browser and avoid wiping an active workout.
