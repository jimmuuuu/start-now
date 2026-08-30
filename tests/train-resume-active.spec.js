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

test('Train resumes an active workout even when no workout is scheduled today', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.stack || error.message));
  await clearBrowserState(page);

  await page.evaluate(() => {
    state.customWorkouts = [];
    saveCustomWorkouts();
    startWorkout(defaultWorkout);
  });

  await expect.poll(() => page.evaluate(() => state.page)).toBe('activeWorkout');
  await expect(page.locator('.sn-workout-screen')).toBeVisible();

  // Leave the in-progress workout without finishing it, like returning to Home on a rest day.
  await page.locator('#snExitWorkout').click();
  await expect.poll(() => page.evaluate(() => state.page)).toBe('home');
  await expect(page.evaluate(() => Boolean(window.SN36?.activeWorkoutSession?.()))).resolves.toBe(true);

  // Train must resume the live session instead of opening the Quick Workout chooser.
  await page.locator('#quickStart').click();
  await expect.poll(() => page.evaluate(() => state.page)).toBe('activeWorkout');
  await expect(page.locator('.sn-workout-screen')).toBeVisible();
  await expect(page.locator('.sn66-page')).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});
