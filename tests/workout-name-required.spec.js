const { test, expect } = require('@playwright/test');

async function clearBrowserState(page) {
  await page.goto('/?e2e=1', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
    }
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#app')).not.toBeEmpty();
}

test('new quick workouts cannot start until the user names them', async ({ page }) => {
  await clearBrowserState(page);

  await page.evaluate(() => {
    const base = exerciseLibrary.find(ex => ex.id === 'chest-press') || exerciseLibrary[0];
    startWorkout({
      id: 'quick-manual-e2e',
      name: 'Quick Workout',
      builtIn: false,
      days: [],
      exercises: [{ ...base, sets: 1, reps: 10, weight: 50 }]
    });
  });

  const modal = page.locator('#sn134WorkoutNameModal');
  await expect(modal).toBeVisible();
  await expect(page.locator('#sn134WorkoutName')).toHaveValue('');
  await expect.poll(() => page.evaluate(() => window.SN36?.active || null)).toBeNull();

  await page.locator('#sn134StartNamed').click();
  await expect(page.locator('#sn134WorkoutNameError')).toHaveText('Enter a workout name to continue.');
  await expect(modal).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.SN36?.active || null)).toBeNull();

  await page.locator('#sn134WorkoutName').fill('Saturday Push');
  await page.locator('#sn134StartNamed').click();

  await expect(modal).toBeHidden();
  await expect.poll(() => page.evaluate(() => state.page)).toBe('activeWorkout');
  await expect.poll(() => page.evaluate(() => window.SN36?.active?.workoutName || '')).toBe('Saturday Push');
  await expect(page.locator('.sn-workout-top').getByText('Saturday Push', { exact: true })).toBeVisible();
});

test('already named workouts still start normally without the naming modal', async ({ page }) => {
  await clearBrowserState(page);

  await page.evaluate(() => {
    const base = exerciseLibrary.find(ex => ex.id === 'chest-press') || exerciseLibrary[0];
    startWorkout({
      id: 'custom-user-named-e2e',
      name: 'Back + Biceps',
      builtIn: false,
      days: [],
      exercises: [{ ...base, sets: 1, reps: 10, weight: 50 }]
    });
  });

  await expect(page.locator('#sn134WorkoutNameModal')).toBeHidden();
  await expect.poll(() => page.evaluate(() => state.page)).toBe('activeWorkout');
  await expect.poll(() => page.evaluate(() => window.SN36?.active?.workoutName || '')).toBe('Back + Biceps');
});
