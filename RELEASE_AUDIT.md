# Level Up Fitness production audit — September 5, 2026

Assessment: improved web release candidate, **not approved for public production or app-store submission**.

## Fixed

- Restored hidden sign-in, account, cloud backup, privacy, and support controls.
- Failed backup/sign-out no longer erases local training data. Expired/changed accounts archive unsynced device data under the original owner before clearing the view. These are local browser archives, not encrypted backups.
- Failed history saves preserve the active workout instead of showing a false completion and deleting recovery data.
- Cloud merge respects remote deletion markers, including deletion of the final session. Removed silent 365-session retention limits and deletion-marker truncation.
- Paginated cloud reads, batched changed-session uploads, removed a redundant profile query, and prevented failed local restores from being reported as successful backup.
- Added password-reset/recovery UI, service-unavailable feedback, persistent backup-error status, keyboard focus containment/return, and mobile auth scrolling.
- Escaped training-level text, removed query/hash data from diagnostic URLs, and added a Content Security Policy restricting executable scripts to the app origin.
- Fixed narrow-screen streak/workout-header overflow, added visible keyboard focus/current navigation state and reduced-motion support.
- Applied Level Up Fitness branding while preserving existing storage keys/data.
- Removed an unsafe media fallback marking unrelated movements as verified (burpee → quad stretch; dumbbell thruster → dumbbell flyes; dead hang → clean). Unmatched exercises now show an explicit unavailable state; curated media remains.
- Added locked dependencies, locally bundled Supabase/Inter with licenses, build/syntax commands, content-versioned assets, a full offline shell, Node preview server, and CI production gate.

## Verified

- Production build succeeds; 53 active JavaScript files pass syntax checks.
- Three unit suites pass, including added retention checks for 400 sessions.
- **37 Chromium browser tests pass against the production build**: 24 existing tests plus 13 new checks.
- Covered main navigation, builder, naming/start/log/finish, sets, notes, swap search, history edit/delete, rest days, schedule consistency, active-session recovery, photo upload/refresh, training-level persistence, modal scrolling, and mobile inputs.
- New coverage includes quota failure, failed backup/sign-out, remote deletion propagation, session isolation, password recovery, hostile profile text, unsafe media substitutes, first-install offline reload, and 320/375/430/1280px layouts.
- Account tests use a controlled client double: they verify client behavior, **not actual email delivery, server authorization/persistence, cloud deletion, or live cross-device sync**.
- No uncaught errors in covered successful flows. Expected failures are tested separately. The repository has no TypeScript project or separate linter; syntax and behavioral tests are its code gates.
- npm audit reported zero vulnerabilities during this pass.

## Remaining release blockers

1. Supabase project `wxeptxfijwrwmdzxvsuh` (Level Up Fitness) reports **INACTIVE**. A read-only schema query timed out. An empty advisor response does not verify inaccessible tables. Resume it and verify owner-scoped RLS, signup/confirmation/login/recovery/sign-out/deletion using dedicated test accounts.
2. Validate live upload, restore, simultaneous edits, interrupted sync, and account switching. The whole-profile backup is not a transactional merge: simultaneous writes can still lose non-history profile/settings changes. Server-side optimistic concurrency remains necessary for a public multi-device launch.
3. Database migrations and delete-account Edge Function source are absent. Recover actual deployed definitions, validate cascade deletion and token handling. No database mutations were performed.
4. No native iOS/Android targets or signed store builds exist. Create the intended native wrapper/project, confirm bundle/package IDs, deep-link recovery, lifecycle, safe areas, and hardware-back behavior. iOS needs macOS/Xcode; Android needs SDK/JDK tooling. A PWA is not a signed native release.
5. Final hosting/domain, private support channel, privacy disclosures, screenshots/icons, developer accounts, signing certificates/profiles/keystore, data-safety declarations, age ratings, TestFlight/internal testing, and physical-device accessibility/performance checks remain required. Existing icons need final brand/store review.
6. Confirm media licensing, exact movement accuracy, availability, and distribution rights. External media is still network-dependent. A full visual review of every exercise asset was not completed; missing media falls back safely.
7. The stacked global renderer/decorator architecture remains fragile. This pass fixed existing owners and removed harmful overrides, but did not replace all routing layers. LocalStorage remains bounded and needs a future IndexedDB/storage migration for large histories/media.

## Build, deployment, and rollback

Use Node 22+: `npm ci`, `npm test`, `npm run build`, `npx playwright install chromium`, `npm run test:e2e`, `npm run preview`. Open http://127.0.0.1:4173. Tests exercise `dist`; rebuild after source edits. Publish only `dist` over HTTPS after backend gates pass.

The browser uses the public Supabase URL/key in cloud-account-v89.js; no secret keys belong in the bundle. Configure the matching live project and its allowed auth redirect URLs. Set no-cache for index.html/sw.js, nosniff, Referrer-Policy and a response CSP frame-ancestors policy on the host. Keep the previous complete artifact for rollback; test returning-device service-worker updates. Never clear user storage as a deployment fix.

Supabase sign-out behavior was checked against [official documentation](https://supabase.com/docs/reference/javascript/auth-signout). No store acceptance or backend certification is claimed.
