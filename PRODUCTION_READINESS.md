# START/NOW — Production Readiness Gate

Target: first production-ready beta after stabilization.

**Rule:** Do not check an item because the code looks correct. Check it only after the behavior has been exercised in the test/live build.

## Current launch assessment — August 26, 2026

The web build is suitable for continued beta testing, but it is not yet ready for a large public launch or App Store submission.

### P0 launch blockers

- [ ] Move the commercial production build away from GitHub Pages to supported application hosting.
- [ ] Connect the active app to production authentication and Supabase sync; the current build stores user data only in browser localStorage.
- [ ] Decide whether accounts are required. If they are, implement sign-in, sign-out, account deletion, session recovery, and cross-device conflict handling.
- [ ] Create the iOS application target/wrapper, app icon set, launch assets, signing configuration, and TestFlight release flow.
- [ ] Publish an in-app privacy policy and support page, then provide matching App Store metadata URLs.
- [ ] Add production error reporting, availability monitoring, backup/restore validation, and a rollback procedure.
- [ ] Complete device testing and pass the full automated critical-workout and rest-day flows.
- [ ] Confirm distribution rights and attribution requirements for every exercise media asset.

### Current strengths

- Workout logging, active-session recovery, exercise history, rest timing, scheduling, and local progress storage are implemented.
- Exercise notes are auto-saved with the active session, saved into completed history, and shown the next time the same exercise appears.
- The connected Supabase schema already has row-level security and fields that can store per-exercise notes once cloud sync is wired into this client.

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
- [ ] Exercise note auto-saves during an active workout
- [ ] Completed exercise note appears the next time that exercise is performed

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
- [ ] Exercise notes sync across signed-in devices without overwriting newer data

## Automated regression tests

- [ ] Navigation smoke workflow passes
- [ ] Quick Workout smoke test passes
- [ ] Exercise Library smoke test passes
- [ ] Workout Calendar smoke test passes
- [ ] My Stats smoke test passes
- [ ] Bottom navigation smoke test passes
- [ ] Critical workout flow test added
- [ ] Rest-day flow test added
- [x] Exercise-note unit persistence test added
- [x] Exercise-note browser flow test added

## Release gate

Release only when every P0 item is checked and there are no known data-loss, blank-screen, or critical navigation bugs.
