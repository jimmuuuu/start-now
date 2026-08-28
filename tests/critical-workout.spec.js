const { test, expect } = require('@playwright/test');

const TEST_PROFILE = {
  experience: 'Beginner',
  goal: 'Build muscle',
  days: ['Monday', 'Wednesday', 'Friday'],
  location: 'Gym',
  duration: 45,
  avoid: ''
};

async function clearBrowserState(page) {
  await page.goto('/?e2e=1', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async profile => {
    localStorage.clear();
    sessionStorage.clear();
    // This test verifies the workout lifecycle, not first-run onboarding.
    // Seed the same valid profile used by the release-candidate tests so the
    // intentional preferences modal does not cover the Start Workout control.
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
  await expect(page.locator('#app')).not.toBeEmpty();
  await expect(page.locator('#snProductModal')).toHaveCount(0);
}

test('critical workout flow saves a real completed session', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.stack || error.message));
  await clearBrowserState(page);

  await expect(page.locator('#startWorkout')).toBeVisible();
  await page.locator('#startWorkout').click();

  await expect.poll(() => page.evaluate(() => state.page)).toBe('activeWorkout');
  await expect(page.locator('.sn-workout-screen')).toBeVisible();
  await expect(page.locator('#snExerciseNote')).toBeVisible();

  const weight = page.locator('input[aria-label="Weight for set 1"]');
  const reps = page.locator('input[aria-label="Reps for set 1"]');
  await weight.fill('55');
  await reps.fill('10');
  await page.locator('#snExerciseNote').fill('Critical flow persistence check');
  await page.locator('[data-complete-set="0"]').click();

  await expect(page.locator('.sn-set-row').first()).toHaveClass(/completed/);

  page.once('dialog', dialog => dialog.accept());
  await page.locator('#snFinishEarly').click();

  await expect.poll(() => page.evaluate(() => state.page)).toBe('summary');
  await expect(page.getByText('WORKOUT COMPLETE', { exact: true })).toBeVisible();
  await expect(page.locator('.sn-grade-lockup')).toBeVisible();

  const saved = await page.evaluate(() => {
    const sessions = JSON.parse(localStorage.getItem('sn_progress_sessions') || '[]');
    const active = localStorage.getItem('sn_active_workout_v36');
    const latest = sessions.at(-1) || null;
    const firstExercise = latest?.exercises?.[0] || null;
    const firstSet = firstExercise?.sets?.[0] || null;
    return {
      count: sessions.length,
      active,
      completedSets: latest?.completedSets,
      weight: firstSet?.weight,
      reps: firstSet?.reps,
      done: firstSet?.done,
      note: firstExercise?.note
    };
  });

  expect(saved.count).toBe(1);
  expect(saved.active).toBeNull();
  expect(saved.completedSets).toBeGreaterThanOrEqual(1);
  expect(saved.weight).toBe(55);
  expect(saved.reps).toBe(10);
  expect(saved.done).toBe(true);
  expect(saved.note).toBe('Critical flow persistence check');
  expect(pageErrors).toEqual([]);

  await page.locator('#snSummaryHome').click();
  await expect.poll(() => page.evaluate(() => state.page)).toBe('home');
  await expect(page.locator('[data-sn70-action="myStats"]')).toBeVisible();
});
