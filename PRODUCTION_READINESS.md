# START/NOW — Production Readiness Gate

Target: first production-ready beta after stabilization.

**Rule:** Do not check an item because the code looks correct. Check it only after the behavior has been exercised in the test/live build.

## Current launch assessment — August 26, 2026

The web build is suitable for continued beta testing, but it is not yet ready for a large public launch or App Store submission.

### v88 production-hardening progress

The active client now contains an **optional account + cloud-backup implementation** backed by the existing Supabase project. Guest/local-first use remains supported. Signed-in users can authenticate, back up the START/NOW local data model, restore/merge workout history on another device, manually sync, sign out, and request account deletion. Completed workout payloads are also persisted into `workout_sessions`.

The Supabase database has RLS-protected `profiles`, `workout_sessions`, and `workout_sets` tables. v88 also adds an RLS-protected `app_errors` table plus client-side runtime/unhandled-promise diagnostics. A JWT-protected `delete-account` Edge Function deletes the authenticated account server-side; existing user-owned rows cascade through the database relationships.

`privacy.html` and `support.html` now exist and are linked from the Profile account area. These changes are **implemented but not considered release-gate passes until exercised in the deployed build**.

The navigation test suite was also corrected so it reads the active build version from `index.html` instead of failing whenever the build metadata changes. The workflow syntax step now ignores externally hosted script URLs while continuing to syntax-check every local active JavaScript file.

### P0 launch blockers

- [ ] Move the commercial production build away from GitHub Pages to supported application hosting.
- [ ] Validate v88 production authentication and Supabase cloud sync in the deployed build, including first-device upload and second-device restore.
- [ ] Validate the optional-account decision and all account flows: sign-up, sign-in, sign-out, account deletion, session recovery, and cross-device merge/conflict behavior.
- [ ] Create the iOS application target/wrapper, app icon set, launch assets, signing configuration, and TestFlight release flow.
- [ ] Exercise the published privacy policy and support pages, then provide matching App Store metadata URLs.
- [ ] Validate production error reporting, cloud backup/restore, availability monitoring, and a rollback procedure.
- [ ] Complete device testing and pass the full automated critical-workout and rest-day flows.
- [ ] Confirm distribution rights and attribution requirements for every exercise media asset.
- [ ] Enable/decide on Supabase leaked-password protection before a public account launch.

### Current strengths

- Workout logging, active-session recovery, exercise history, rest timing, scheduling, and local progress storage are implemented.
- Exercise notes are auto-saved with the active session, saved into completed history, and shown the next time the same exercise appears.
- Optional Supabase authentication and cloud backup/restore are now wired into the active client while preserving local-first use.
- Account deletion has a server-side authenticated path and the existing user-data foreign keys use cascade deletion.
- Runtime diagnostics are captured locally and, for signed-in users, can be written to an RLS-protected error table.

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
- [ ] No stabilization fix clears user localStorage unexpectedly
- [ ] Guest-to-account migration preserves existing device data
- [ ] Signed-in cloud restore preserves newer local/remote workout history
- [ ] Sign-out clears the prior account's local training data on shared devices without deleting its cloud copy

## Error / reliability

- [ ] Uncaught JavaScript errors: 0 in critical flows
- [ ] Unhandled promise rejections: 0 in critical flows
- [ ] No broken buttons in critical flows
- [ ] Render failure shows an error boundary instead of a blank screen
- [ ] Duplicate IDs audit passes on critical screens
- [ ] Signed-in runtime errors reach `app_errors` without exposing another user's diagnostics
- [ ] Offline mode keeps saving locally and sync resumes when connectivity returns

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
- [ ] Account/auth modal fits small screens and mobile keyboard states

## PWA / caching

- [ ] Service worker strategy decided
- [ ] Service worker file exists if registration remains enabled
- [ ] Cache version/update strategy tested
- [ ] New builds do not remain stuck on stale JS/CSS
- [ ] Manifest install behavior tested
- [ ] External Supabase library failure degrades safely to device-only mode

## Backend / authentication

The active repository is now **local-first with optional Supabase authentication and cloud backup**. The implementation is present in v88 but remains behind the release gate until real deployed-account tests pass.

- [x] Production requirement for accounts/cross-device sync decided: accounts are optional; guest mode remains local-first and signed-in mode enables cloud backup/restore.
- [ ] Authentication implementation passes deployed sign-up/sign-in/sign-out/session recovery tests.
- [ ] Backend persistence passes deployed upload/restore/merge tests.
- [ ] Account deletion is verified end-to-end, including cascade deletion of user-owned workout rows.
- [ ] Exercise notes sync across signed-in devices without overwriting newer data.
- [ ] Supabase Auth production settings reviewed, including leaked-password protection.

## Privacy / support

- [ ] `privacy.html` loads from the deployed production URL and accurately matches final production behavior.
- [ ] `support.html` loads from the deployed production URL and contains a final public support contact/channel.
- [ ] Privacy and Support links are reachable from Profile in guest and signed-in states.
- [ ] App Store privacy disclosures match the data actually processed by the release build.

## Automated regression tests

- [ ] Navigation smoke workflow passes on the current v88 build.
- [ ] Quick Workout smoke test passes
- [ ] Exercise Library smoke test passes
- [ ] Workout Calendar smoke test passes
- [ ] My Stats smoke test passes
- [ ] Bottom navigation smoke test passes
- [ ] Guest Profile/account-card test added
- [ ] Signed-in auth/cloud-sync integration test added with safe test credentials
- [ ] Critical workout flow test added
- [ ] Rest-day flow test added
- [x] Exercise-note unit persistence test added
- [x] Exercise-note browser flow test added

## Release gate

Release only when every P0 item is checked and there are no known data-loss, blank-screen, authentication, account-deletion, or critical navigation bugs.
