# START/NOW — Production Stabilization Architecture Audit

Audit date: 2026-08-23

This audit is based on the active `main` load order in `index.html` plus the major route/data modules currently used by the app. The goal is to stop feature patches from fighting each other and establish a release-safe repair order.

## 1. Current architecture

START/NOW is a static, mobile-first HTML/CSS/JavaScript app. It renders screens dynamically into one root element:

```text
<body>
  <main id="app"></main>
  <nav class="bottom-nav">...</nav>
</body>
```

The app does **not** currently have Supabase, authentication, or a connected backend in the active repository. User data is browser-local.

Primary persisted data includes:

- `sn_custom_workouts` — saved workouts and weekly schedule
- `sn_progress_sessions` — completed workout history
- `sn_active_workout_v36` — in-progress workout resume state
- `sn_user_profile_v36` — training preferences/profile data used by v36 systems
- `sn_streak` / `sn_completed` — legacy summary values kept in sync
- `sn_best_streak_v36` — best streak
- `sn_dark` — dark mode

## 2. Active page map

```text
START/NOW
│
├── Home
│   ├── Today's Plan / Rest Day
│   ├── Quick Actions
│   ├── Streak
│   ├── Muscle / Recovery Focus
│   └── Daily Tip
│
├── Workouts
│   ├── Builder
│   ├── Beginner plan wizard
│   ├── Plan editor
│   └── Schedule tools
│
├── Progress
│   └── Exercise History
│
├── Profile
│
├── Quick Workout
├── Exercise Library
├── Workout Calendar
├── My Stats
└── Rest Day / Recovery Plan
```

## 3. Screen ownership

| Screen | Route key | Main renderer / owner | Important data |
|---|---|---|---|
| Home | `home` | base `renderHome`, then enhanced by `active-plan.js`, `product-pages-v36.js`, `rest-day-v54.js`, Quick Actions | schedule, streak, active workout, current plan |
| Workouts | `workouts` | base `renderWorkouts`, enhanced by beginner plan / active plan / product plans | `sn_custom_workouts` |
| Builder | `builder` | base `renderBuilder` | `state.builder`, exercise library |
| Progress | `progress` | base/progress system, enhanced by grading + product pages | `sn_progress_sessions`, grade/streak helpers |
| Profile | `profile` | base `renderProfile`, enhanced by product pages | profile prefs, streak, saved workouts |
| Active workout | `activeWorkout` | `product-workout-v36.js` replaces base `renderWorkout` | `sn_active_workout_v36`, set logs |
| Summary | `summary` | `product-workout-v36.js` replaces base `renderSummary` | just-completed session, PRs, grade |
| Quick Workout | `quickWorkout` | `quick-workout-v66.js` / `START_NOW_QUICK_WORKOUT.render()` | exercise library, saved workouts, profile prefs |
| Exercise Library | `exerciseLibrary` | `product-pages-v36.js` `renderLibrary()` | existing `exerciseLibrary`, `SN36.meta`, exercise media/detail system |
| Exercise History | `exerciseHistory` | `product-pages-v36.js` | completed sessions for one exercise |
| Workout Calendar | `calendar` | `workout-calendar-v63.js` / `START_NOW_WORKOUT_CALENDAR.render()` | `sn_progress_sessions`, current weekly schedule |
| My Stats | `myStats` | `quick-actions-v70.js` `renderStats()` | sessions, streaks, grades, PRs, volume |
| Rest Day | `restDay` | `rest-day-v54.js` | current weekly schedule |
| Plan edit | `planEdit` | `product-plans-v36.js` | saved custom workout draft |

## 4. Navigation architecture found during audit

The original source of truth is:

```text
state.page
   ↓
render()
   ↓
renderer for that page
   ↓
#app.innerHTML
```

Bottom navigation in `app.js` changes `state.page` and calls `render()`.

The instability came from later files repeatedly wrapping or replacing the global `render()` function for extra routes. Active examples include:

- `product-pages-v36.js` — `exerciseLibrary`, `exerciseHistory`
- `product-plans-v36.js` — `planEdit`
- `rest-day-v54.js` — `restDay`
- `workout-calendar-v63.js` — `calendar`
- `quick-workout-v66.js` — `quickWorkout`
- `quick-actions-v70.js` — `myStats` plus previous Quick Action special cases

This is a fragile call chain: every later wrapper depends on the wrappers before it being present and returning correctly.

## 5. Root causes of the Quick Action regressions

### Root cause A — multiple files owned the same Home cards

The base Home renderer and the active-plan Home renderer still created the legacy cards:

- Today
- Workouts
- Progress
- Achievements

At the same time, both `ui-icons-v60.js` and `quick-actions-v70.js` were rebuilding the same `.tiles` area. Whichever layer ran last could change what the user saw.

This explains why the new Quick Actions could appear, disappear, then revert after an unrelated render.

**v77 action:** `ui-icons-v60.js` is now decoration-only. It no longer owns or rebuilds Home navigation cards. `quick-actions-v70.js` is the single active owner of the Quick Actions section.

### Root cause B — Exercise Library had two UI implementations

The app already had a real Exercise Library in `product-pages-v36.js`. A later Quick Actions patch created a second library renderer in `quick-actions-v70.js`.

That duplicated screen behavior and created another routing path to maintain.

**v77 action:** the duplicate Quick Actions Exercise Library renderer was removed. Quick Actions now routes to the existing `exerciseLibrary` screen.

### Root cause C — Quick Actions used different navigation paths

Historically the four cards used a mixture of:

- direct renderer calls
- `state.page + render()`
- route wrappers
- compatibility bridges

That made two cards behave differently from the other two.

**v77 action:** all four Quick Action cards now set the existing route key and go through `render()`. My Stats remains the only page whose renderer is implemented by the Quick Actions module itself.

### Root cause D — Home has multiple render owners

`active-plan.js`, `rest-day-v54.js`, `product-pages-v36.js`, and other feature layers enhance or replace Home rendering. That means changing Home in one file does not guarantee it is the final Home HTML.

**v77 action:** Quick Actions wraps the final Home renderer once, after active-plan/rest-day enhancements are installed, so the Quick Action section is applied consistently regardless of which Home variant rendered.

## 6. Error handling

Previous route failures could leave `#app` empty.

**v77 action:** `runtime-guard-v77.js` adds a final render error boundary. A render failure now shows:

```text
Something went wrong
Return Home
```

It logs the real error and does not clear localStorage.

## 7. Caching / service worker finding

`app.js` still tries to register `sw.js`, but the current repository root does not contain a `sw.js` file. The current `index.html` also uses build-version query strings and unregisters service workers / clears Cache Storage when the runtime version changes.

This is inconsistent PWA behavior and should be resolved before release:

- either restore a versioned service worker with a tested update strategy
- or remove service-worker registration until offline support is intentionally restored

Do **not** use localStorage clearing as a cache fix.

## 8. Authentication / backend finding

There is no active authentication or backend implementation in the current project. Production claims should therefore treat START/NOW as local-first/single-browser unless a backend is added and tested later.

## 9. Remaining architectural risk

The biggest remaining technical risk is the stacked global `render()` wrappers. They are not all broken, but they make regressions easy because route order depends on script load order.

Recommended next stabilization step:

1. keep `state.page` as the single route state
2. introduce one route registry/dispatcher around the existing `render()` architecture
3. register `exerciseLibrary`, `exerciseHistory`, `planEdit`, `restDay`, `calendar`, `quickWorkout`, and `myStats`
4. remove route-specific `window.render = ...` wrappers one subsystem at a time
5. keep visual decorators as post-render hooks instead of route owners
6. run navigation smoke tests after every migration

Do not perform that migration in one giant rewrite.

## 10. Release repair order

### P0

1. Navigation + no blank screens
2. Start/log/complete workout
3. Workout history persistence
4. Weekly schedule + rest days
5. Exercise Library / exercise detail rendering
6. Data persistence safety

### P1

1. Streak correctness
2. Workout Calendar
3. Quick Workout
4. Progress / grades
5. Profile
6. Exercise media completeness and fallback behavior

### P2

1. Animation polish
2. Extra stats
3. Extra achievements
4. Advanced customization

## 11. Testing strategy added during this sprint

The repository now includes Playwright navigation smoke tests covering:

- canonical Home Quick Actions
- Quick Workout
- Exercise Library
- Workout Calendar
- My Stats
- Home / Workouts / Progress / Profile bottom navigation
- uncaught browser JavaScript errors during those tests

The test suite is intentionally small first. It should expand only after the current navigation baseline is green.
