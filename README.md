# START/NOW

Local-first workout logger with optional Supabase backup. Mobile-first UI with Workout, History, Exercises, Progress, and Profile destinations; installable as a PWA. Existing sn_* data remains compatible.

## Development

Node.js 22 or newer:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173. The source server supports the same complete offline shell as the release. Rebuild after editing source when testing production output.

## Verification

```sh
npm test
npm run build
npx playwright install chromium webkit firefox
npm run test:e2e
npm run preview
```

The browser suite targets dist and runs 32 scenarios per engine, including WCAG AA automated checks. Use --project=chromium or --project=webkit to select an engine if a local executable is unavailable. CI runs all three on Linux. The offline test shuts down its own isolated origin rather than relying on WebKit's broken offline emulation.

## Structure

- ui.js owns navigation, icons, reusable rows, pickers, dialogs, focus, and scroll locking.
- workout.js owns active-session state, set entry, timers, recovery, and completion.
- pages.js, routines.js, and profile.js own the five destinations and their editing flows.
- app.css is the single tokenized presentation system, including dark mode and legal pages.
- product-core-v36.js and data-store-v117.js retain the canonical models, migrations, calculations, and storage keys.
- exercise-data.js, exercise-library-extra.js, and routine-data.js retain exercise/template content. Media attribution stays in the detail sheet; related guides are labeled explicitly.
- cloud-account-v89.js retains account isolation, deletion markers, backups, and authentication. Public connection settings are intentional; secret keys never belong in browser code.
- bootstrap.js initializes recovery and routing. pwa-install-v112.js and sw.js provide installation and offline support.

## Release

The Production gate workflow runs unit, browser, accessibility, and build checks before deploying dist to GitHub Pages from main. Failed checks prevent publication. Builds validate the pinned Supabase dependency, include only active application files, fingerprint assets, and generate a complete offline precache. The previous artifact and Git history support rollback; never clear user storage as a deployment fix.

See RELEASE_AUDIT.md for this rebuild's scope and verification boundaries. Older version-numbered audit documents describe historical releases, not the current architecture. This is a web/PWA product, not a signed App Store binary.
