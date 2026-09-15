const { test, expect } = require('@playwright/test');

test('does not show a partial legacy screen before the final bootstrap', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sn_user_profile_v36', JSON.stringify({
      experience: 'Beginner', days: ['Monday'], goal: 'Build muscle', location: 'Gym', duration: 45
    }));
  });

  let release;
  const gate = new Promise(resolve => { release = resolve; });
  let bootstrapReached;
  const reached = new Promise(resolve => { bootstrapReached = resolve; });
  await page.route('**/product-bootstrap-v36.js*', async route => {
    bootstrapReached();
    await gate;
    await route.continue();
  });

  const navigation = page.goto('/');
  await reached;
  try {
    await expect(page.locator('#app')).toBeEmpty();
  } finally {
    release();
  }
  await navigation;
  await expect(page.getByRole('heading', { name: 'No workout scheduled' })).toBeVisible();
});
