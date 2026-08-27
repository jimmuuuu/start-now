const { test, expect } = require('@playwright/test');

const TEST_PROFILE = {
  experience: 'Beginner',
  goal: 'Build muscle',
  days: ['Monday', 'Wednesday', 'Friday'],
  location: 'Gym',
  duration: 45,
  avoid: '',
  displayName: 'STARTNOW Launch Test'
};

async function fresh(page) {
  await page.goto('/?e2e=1', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async profile => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('sn_user_profile_v36', JSON.stringify(profile));
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
    }
  }, TEST_PROFILE);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect.poll(() => page.evaluate(() => Boolean(window.SN_SUPABASE))).toBe(true);
}

test('live account signup, cloud backup, restore, signout, and deletion', async ({ page }) => {
  test.setTimeout(90000);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.stack || error.message));

  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  // Supabase Auth rejects reserved test domains such as example.com.
  // Use an extremely unlikely randomized address on a normal domain; this project's
  // email auth is configured for immediate confirmation, so no message is delivered.
  const email = `startnow.launch.e2e.${unique}@gmail.com`;
  const password = `SN-${unique}-Aa1!`;
  const workoutId = `cloud-e2e-${unique}`;
  const sessionId = `cloud-session-${unique}`;
  const timestamp = Date.now() - 60000;

  await fresh(page);

  await page.evaluate(({ profile, workoutId, sessionId, timestamp }) => {
    const workout = {
      id: workoutId,
      name: 'Cloud Launch Test Workout',
      builtIn: false,
      days: ['Monday'],
      exercises: [{ id: 'chest-press', name: 'Chest Press', muscle: 'Chest', sets: 1, reps: 8, weight: 88 }]
    };
    const session = {
      id: sessionId,
      workoutId,
      workoutName: workout.name,
      timestamp,
      startedAt: timestamp - 30 * 60000,
      durationMinutes: 30,
      completedSets: 1,
      volume: 704,
      grade: 94,
      exercises: [{
        id: 'chest-press',
        name: 'Chest Press',
        muscle: 'Chest',
        note: 'Live cloud restore check',
        sets: [{ weight: 88, reps: 8, done: true }]
      }]
    };
    localStorage.setItem('sn_user_profile_v36', JSON.stringify(profile));
    localStorage.setItem('sn_custom_workouts', JSON.stringify([workout]));
    localStorage.setItem('sn_progress_sessions', JSON.stringify([session]));
    state.customWorkouts = [workout];
    window.SN36?.syncStats?.();
    render();
  }, { profile: TEST_PROFILE, workoutId, sessionId, timestamp });

  await page.evaluate(() => window.START_NOW_CLOUD.openSignUp());
  await page.locator('#snAuthName').fill('STARTNOW Launch Test');
  await page.locator('#snAuthEmail').fill(email);
  await page.locator('#snAuthPassword').fill(password);
  await page.locator('#snAuthSubmit').click();

  await expect.poll(() => page.evaluate(() => window.SN_CLOUD_USER?.email || null), { timeout: 20000 }).toBe(email);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('sn_cloud_sync_meta_v88') !== null), { timeout: 20000 }).toBe(true);
  await expect.poll(async () => page.evaluate(async ({ sessionId }) => {
    const user = window.SN_CLOUD_USER;
    if (!user) return false;
    const [profileResult, sessionsResult] = await Promise.all([
      window.SN_SUPABASE.from('profiles').select('id, app_settings').eq('id', user.id).maybeSingle(),
      window.SN_SUPABASE.from('workout_sessions').select('id, user_id, draft_payload').eq('user_id', user.id).eq('id', sessionId).maybeSingle()
    ]);
    if (profileResult.error || sessionsResult.error) return false;
    const backup = profileResult.data?.app_settings?.start_now_backup?.storage || {};
    return Boolean(profileResult.data?.id)
      && Boolean(backup.sn_progress_sessions)
      && sessionsResult.data?.id === sessionId
      && sessionsResult.data?.draft_payload?.exercises?.[0]?.note === 'Live cloud restore check';
  }, { sessionId }), { timeout: 25000 }).toBe(true);

  await page.evaluate(() => window.SN_AUTH.signOut());
  await page.waitForLoadState('domcontentloaded');
  await expect.poll(() => page.evaluate(() => window.SN_CLOUD_USER?.email || null), { timeout: 15000 }).toBe(null);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('sn_progress_sessions'))).toBe(null);

  await expect.poll(() => page.evaluate(() => Boolean(window.SN_SUPABASE))).toBe(true);
  await page.evaluate(() => window.START_NOW_CLOUD.openSignIn());
  await page.locator('#snAuthEmail').fill(email);
  await page.locator('#snAuthPassword').fill(password);
  await page.locator('#snAuthSubmit').click();

  await expect.poll(() => page.evaluate(() => window.SN_CLOUD_USER?.email || null), { timeout: 20000 }).toBe(email);
  await expect.poll(() => page.evaluate(({ sessionId }) => {
    const sessions = JSON.parse(localStorage.getItem('sn_progress_sessions') || '[]');
    return sessions.some(session => session.id === sessionId && session.exercises?.[0]?.note === 'Live cloud restore check');
  }, { sessionId }), { timeout: 25000 }).toBe(true);
  await expect.poll(() => page.evaluate(({ workoutId }) => {
    const workouts = JSON.parse(localStorage.getItem('sn_custom_workouts') || '[]');
    return workouts.some(workout => workout.id === workoutId && workout.name === 'Cloud Launch Test Workout');
  }, { workoutId }), { timeout: 25000 }).toBe(true);

  await page.evaluate(() => {
    state.page = 'profile';
    render();
  });
  await expect(page.locator('#snDeleteAccount')).toBeVisible();
  page.on('dialog', dialog => dialog.accept());
  await page.locator('#snDeleteAccount').click();

  await expect.poll(() => page.evaluate(() => window.SN_CLOUD_USER?.email || null), { timeout: 25000 }).toBe(null);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('sn_progress_sessions'))).toBe(null);

  const signInAfterDelete = await page.evaluate(async ({ email, password }) => {
    const { data, error } = await window.SN_SUPABASE.auth.signInWithPassword({ email, password });
    return { hasSession: Boolean(data?.session), error: error?.message || null };
  }, { email, password });
  expect(signInAfterDelete.hasSession).toBe(false);
  expect(signInAfterDelete.error).toBeTruthy();

  expect(pageErrors).toEqual([]);
});
