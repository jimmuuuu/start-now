# Level Up Fitness

Local-first fitness web app with optional Supabase accounts. Existing sn_* storage keys remain compatible with START/NOW data.

Requires Node.js 22 or newer.

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run preview
```

Open http://127.0.0.1:4173. Browser tests exercise the generated dist build. Run npm run build after source changes. npm run dev serves the source for development.

Deploy only dist to HTTPS hosting after the backend release gates pass. The build validates active JavaScript, fingerprints scripts/styles, verifies the locked Supabase bundle, and precaches the complete application shell. Public Supabase connection settings are in cloud-account-v89.js; never place private keys in browser code.

See RELEASE_AUDIT.md for verified behavior and remaining blockers. This is a web/PWA build, not a signed iOS or Android release.
