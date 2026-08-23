# START/NOW — Production Readiness Gate

Target: first production-ready beta after stabilization.

**Rule:** Do not check an item because the code looks correct. Check it only after the behavior has been exercised in the test/live build.

## Core navigation

- [ ] Home works
- [ ] Workouts works
- [ ] Progress works
- [ ] Profile works
- [ ] Quick Workout works
- [ ] Exercise Library works
- [ ] Workout Calendar works
- [ ] My Stats works
- [ ] Bottom navigation works
- [ ] Back buttons work
- [ ] No blank screens
- [ ] No duplicate full-page content after navigation

## Workout flow

- [ ] Workout can start
- [ ] Existing saved workout can start
- [ ] Quick Workout can start
- [ ] Sets can be logged
- [ ] Weight/reps changes persist during active session
- [ ] Exercise can advance / skip
- [ ] Workout can complete
- [ ] Workout summary renders
- [ ] Workout history saves
- [ ] Active workout can resume after refresh

## Schedule / recovery

- [ ] Weekly schedule works
- [ ] Rest days work
- [ ] Rest Day Home state is correct
- [ ] Recovery Plan opens
- [ ] Next workout is correct
- [ ] Schedule changes persist

## Streak / progress

- [ ] Streak works
- [ ] Planned rest days do not break streak
- [ ] Workout Calendar reflects completed sessions
- [ ] Workout Calendar reflects rest days correctly
- [ ] Workout grade saves
- [ ] Progress data updates after completion
- [ ] My Stats only shows real stored metrics

## Exercise system

- [ ] Exercise Library search works
- [ ] Muscle filter works
- [ ] Equipment filter works
- [ ] Exercise detail opens
- [ ] Exercise instructions visible
- [ ] Primary muscles visible
- [ ] Secondary muscles visible
- [ ] Exercise GIF/demo loads where approved media exists
- [ ] Exercise media fallback works where media is unavailable
- [ ] Exercise media does not eagerly load the entire library on startup

## Data safety

- [ ] Saved workouts persist
- [ ] Workout schedule persists
- [ ] Workout history persists
- [ ] Profile/training preferences persist
- [ ] Dark mode persists
- [ ] Existing localStorage data survives app updates
- [ ] No stabilization fix clears user localStorage

## Error / reliability

- [ ] Uncaught JavaScript errors: 0 in critical flows
- [ ] Unhandled promise rejections: 0 in critical flows
- [ ] No broken buttons in critical flows
- [ ] Render failure shows an error boundary instead of a blank screen
- [ ] Duplicate IDs audit passes on critical screens

## Mobile

- [ ] 320px layout tested
- [ ] 375px layout tested
- [ ] 390px layout tested
- [ ] 430px layout tested
- [ ] No horizontal scrolling
- [ ] No content hidden behind bottom navigation
- [ ] Quick Actions are fully tappable
- [ ] Workout controls usable one-handed on mobile
- [ ] Modals / sheets fit small screens

## PWA / caching

- [ ] Service worker strategy decided
- [ ] Service worker file exists if registration remains enabled
- [ ] Cache version/update strategy tested
- [ ] New builds do not remain stuck on stale JS/CSS
- [ ] Manifest install behavior tested

## Backend / authentication

Current active repository is local-first and does not contain a backend/auth implementation.

- [ ] Production requirement for accounts/cross-device sync decided
- [ ] Authentication implemented and tested if required for this release
- [ ] Backend persistence implemented and tested if required for this release

## Automated regression tests

- [ ] Navigation smoke workflow passes
- [ ] Quick Workout smoke test passes
- [ ] Exercise Library smoke test passes
- [ ] Workout Calendar smoke test passes
- [ ] My Stats smoke test passes
- [ ] Bottom navigation smoke test passes
- [ ] Critical workout flow test added
- [ ] Rest-day flow test added

## Release gate

Release only when every P0 item is checked and there are no known data-loss, blank-screen, or critical navigation bugs.
