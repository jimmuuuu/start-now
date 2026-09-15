const { test, expect } = require('@playwright/test');

test('workouts does not show the removed beginner-plan builder', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sn_user_profile_v36', JSON.stringify({
      experience: 'Beginner', days: ['Monday'], goal: 'Build muscle', location: 'Gym', duration: 45
    }));
  });
  await page.goto('/');
  await page.locator('[data-page="workouts"]').click();
  await expect(page.getByText('Build it for me', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Make my beginner plan/i })).toHaveCount(0);
  await expect(page.locator('#openBeginnerSetup')).toHaveCount(0);
});
