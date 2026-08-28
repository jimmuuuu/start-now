# START/NOW Cloud Launch Gate

## Status: BLOCKED ON PRODUCTION AUTH EMAIL DELIVERY

Core browser/release tests remain separate from this external integration gate.

### Verified

- Supabase project is healthy and reachable from the browser test environment.
- Email/password signup reaches Supabase Auth.
- Hosted-project email confirmation is enabled.
- `profiles`, `workout_sessions`, and `workout_sets` use RLS owner policies tied to the signed-in user.
- User-owned profile/session/set rows cascade when the auth user is deleted.
- The `delete-account` Edge Function is deployed with JWT verification and uses the authenticated user identity for deletion.
- START/NOW includes cloud backup/restore, sign-out local cleanup, and in-app account deletion paths.
- No disposable `startnow.launch.e2e.*` accounts remain after launch-gate testing.

### Blocker found during live testing

A valid disposable signup sent a real confirmation email through Supabase's built-in SMTP service. A subsequent signup was rejected with `429 email rate limit exceeded` (`over_email_send_rate_limit`). Supabase documents the built-in sender as development-only and recommends configuring custom SMTP for production.

### Required before cloud gate can pass

1. Configure a production SMTP provider in Supabase Auth.
2. Confirm START/NOW's Site URL / allowed redirect URLs point to the production app URL.
3. Run the opt-in live test with `RUN_LIVE_CLOUD=1`.
4. Confirm the disposable signup email.
5. Require the test to prove: signup -> authenticated session -> cloud backup -> sign out/local clear -> sign in -> cloud restore -> in-app delete account -> old credentials rejected.
6. Confirm the disposable test user and owned rows are gone.

`tests/cloud-live.spec.js` is intentionally opt-in so external email throttling cannot make the normal release CI flaky.
