# START/NOW rebuild — September 25, 2026

This document supersedes the September 5 presentation audit. The app's display name is START/NOW; the connected Supabase project retains its existing Level Up Fitness name.

## Product changes

- Five consistent destinations with mobile bottom navigation, desktop side navigation, active-session resume, and predictable back behavior.
- Routine-first Workout page with weekly scheduling, six split templates, a reusable routine editor, and equipment/focus-aware generation.
- All exercises and sets on one workout screen: previous performance, editable notes, set completion, exercise ordering/replacement/removal, persistent rest timer, and save review.
- Chronological/calendar history with rename, set editing, repeat, delete, and save-as-routine actions.
- Meaningful consistency, volume, muscle-set, and exercise-performance views; clean profile, photo, grade, streak, preference, and account surfaces.
- One CSS/token system, one icon system, shared exercise rows and sheets, dark appearance, reduced motion, keyboard support, and labeled inputs.
- Replaced 58 loaded scripts and nine stylesheets with 19 ordered scripts and one stylesheet. Removed 101 superseded source/test files and the redundant auto-committing smoke workflow; all are recoverable in Git history. The new behavioral suite replaces tests tied to removed markup.

## Bugs fixed

- Replacing an exercise no longer discards already completed sets.
- Storage failures keep the active session available instead of claiming a successful save.
- Current profile edits win over older cloud names; metadata no longer overrides the edited display name.
- Browser-back cancellation preserves unsaved drafts and their URL.
- Auth focus restoration and Escape work after failed sign-in in WebKit.
- Responsive metrics, touch targets, button contrast, sheet scrolling, safe areas, and screen-reader labels were checked and corrected.
- Build output cannot retain removed modules, and deployment publishes the tested artifact rather than raw repository files.

## Verification

- Four unit suites: canonical data/migrations, exercise notes, swap relevance, PWA readiness.
- 32 browser scenarios per engine: complete logging lifecycle, routine/template/generator flows, history edits/deletion, profiles/photos/preferences, persistence, quota failures, account error/recovery paths, focus/back behavior, offline restart, and 320/360/375/390/430/768/1280px layouts.
- Automated WCAG A/AA checks on all primary destinations, authentication, picker, active workout, finish sheet, summary, populated progress, and dark mode.
- Rendered screenshots reviewed for mobile/desktop and light/dark layouts. No runtime errors in successful covered flows.
- All 251 exercises remain; all 388 distinct image URLs returned valid image responses during the rebuild. Exact demonstrations and related photographic guides are distinguished; remote images remain network-dependent.
- Supabase restored from paused state. Real disposable-account sign-in, backup, fresh-device restoration, and sign-out were verified against the service. Owner-scoped profile/session RLS queries exposed zero other-user rows. Test data is isolated from existing users.
- Local Windows could run Chromium and WebKit. Firefox executable launch was unavailable on that host; the Linux production gate includes Firefox.

## Boundaries

This release does not claim native App Store submission, physical-device certification, or real inbox delivery testing for confirmation/reset emails. Those email UI paths are covered with a controlled auth client. Supabase's existing leaked-password-protection setting remains disabled; no auth-policy or database-schema changes were needed for the UI rebuild. Cloud backups preserve the existing whole-profile last-write model, not collaborative transactional editing. A 251-exercise anatomical/media certification is not claimed.

The production workflow is the release gate; its recorded result identifies the deployed artifact. Live URLs, final commits, final cloud-deletion verification, and screenshot evidence are recorded in the task's release handoff after deployment.
