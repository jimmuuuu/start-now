# START/NOW visual polish — September 20, 2026

Source inspected: GitHub main at `ef60267`. This change preserves the current brand, routes, data formats, workout algorithms and authentication providers. No new product features were intentionally added.

## Implemented

- Reusable color, type, spacing, radius, control-height, motion and shadow tokens in `app.css`, including dark-theme contrast.
- Replaced `declutter-v147.css` with `ui-polish.css`; removed the old blanket spacing overrides and consolidated shared presentation without new `!important` declarations.
- Larger secondary labels and form text in the existing workout, exercise, history, progress, profile and authentication components.
- Consistent card/field/button geometry, focus rings, disabled treatment, stable press feedback, lighter shadows and reduced-motion sheet transitions.
- Room for long workout/exercise names: saved-workout actions have their own row and narrow home hero layouts stack the existing artwork.
- Mobile navigation safe-area clearance, clearer active navigation and correct parent-section indicators for library/history/stat routes.
- Native scrollable sheets with bounded dynamic viewport heights, labelled close buttons, keyboard focus containment/restoration and backdrop-only gesture suppression. No body-position changes for ordinary sheets; the existing splits-specific lock remains intact.
- Rest timer stays in normal flow when idle or while editing an input. Running timers retain their sticky behavior.
- Exercise-library search retains focus/caret while filtering. Filters and workout controls have accessible names.
- Authentication fields focus immediately on opening; errors, account controls and sign-out copy match the current app. Empty saved workouts now explain where to start.
- Existing exercise photo/video containers use consistent aspect ratios and `object-fit: contain`; loading and fallback text is readable. Media provenance/fallback logic was preserved.

## Coverage

Reviewed screenshots and browser states for Home (empty and scheduled), Workouts (empty and populated), Progress, Profile, exercise library/details, Train, active workout, swaps/add-exercise sheets, calendar, stats, workout splits, and email/password authentication. Checked long names at 320px and the splits sheet at 320 × 400px. Reviewed light and dark screenshots.

Automated regression coverage includes workout completion, notes, swaps, active-session resume, plan/history/data persistence, profile photos/preferences, empty/error states, mobile input and sheet scrolling, touch selection, password reset, offline reload, plus new viewport/focus/account-round-trip checks.

## Limits and known issues

- External exercise photos from `raw.githubusercontent.com` fail to load in this execution environment (`ERR_EMPTY_RESPONSE`). The unmodified baseline already fails the calendar-photo assertion and the unified-data test's console-clean assertion for that reason. Existing fallback guides remain visible. CSS cannot make those source assets higher quality or available offline.
- New layout tests use an explicitly isolated tiny image fixture to remove network availability from geometry assertions. That fixture is test-only and is not shipped as exercise media.
- Account round-trip coverage uses a mocked Supabase adapter. Real production credentials, cloud authorization rules, real OAuth redirects and cross-device sync were not validated by this pass.
- Chromium viewport/touch simulation does not replace testing the keyboard and safe areas on physical iOS hardware.
- Older inactive JS/CSS files and historical render wrappers were not deleted wholesale: that would be a broader refactor with unnecessary functional risk.
- The current code exposes email/password authentication, not Google/Apple buttons. No providers were added.

## Validation result

- Production build and syntax validation for all 58 active scripts passed.
- Data, notes, swap relevance and PWA unit checks passed.
- All eight new visual/accessibility/account-adapter tests passed; the four existing modal/touch regression tests also passed after updating the splits assertion to require scrollability.
- Major existing flows were regression-tested. Two baseline external-image failures remain as described above; a complete clean network-dependent suite result is not claimed.
- Publishing to GitHub was blocked by automatic approval review, which requires explicit authorization for that destination. Changes are committed locally on `polish/mobile-consistency`; no PR or deployment is claimed.
