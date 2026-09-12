const { test, expect } = require('@playwright/test');

test('every exercise library row has a media visual and no entry is missing media', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sn_user_profile_v36', JSON.stringify({
      experience: 'Beginner',
      days: ['Monday'],
      goal: 'Build muscle',
      location: 'Gym',
      duration: 45
    }));
  });
  await page.goto('/');
  await page.evaluate(() => { state.page = 'exerciseLibrary'; render(); });

  await expect(page.locator('.sn-library-list [data-library-ex]')).toHaveCount(251);
  await expect(page.locator('.sn-library-list .sn-library-icon.sn101-has-image')).toHaveCount(251);
  await expect.poll(() => page.evaluate(() => ({
    total: window.START_NOW_EXERCISE_MEDIA_AUDIT?.total,
    missing: window.START_NOW_EXERCISE_MEDIA_AUDIT?.missing,
    broken: window.START_NOW_EXERCISE_MEDIA_AUDIT?.broken
  }))).toEqual({ total: 251, missing: 0, broken: 0 });

  const mediaState = await page.locator('.sn-library-list .sn-library-icon img').evaluateAll(images => ({
    total: images.length,
    invalid: images.filter(image => !new RegExp('^https://raw\\.githubusercontent\\.com/yuhonas/free-exercise-db/main/exercises/.+/(0|1)\\.jpg$').test(image.currentSrc || image.src)).length
  }));
  expect(mediaState).toEqual({ total: 251, invalid: 0 });
});

test('a previously uncovered exercise opens with real-person demonstration photos', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sn_user_profile_v36', JSON.stringify({
      experience: 'Beginner',
      days: ['Monday'],
      goal: 'Build muscle',
      location: 'Gym',
      duration: 45
    }));
  });
  await page.goto('/');
  await page.evaluate(() => { state.page = 'exerciseLibrary'; render(); });
  await page.getByRole('button', { name: /Svend Press/ }).click();
  await expect(page.locator('#snProductModal .sn-v42-card')).toBeVisible();
  await expect(page.locator('#snProductModal .sn-v42-card .sn-v42-demo-pair')).toHaveCount(1);
  await expect(page.locator('#snProductModal .sn-v42-card .sn-v42-frame')).toHaveCount(2);
  await expect(page.locator('#snProductModal .sn-v42-card .sn-v42-frame').first()).toHaveAttribute('src', /^https:\/\/raw\.githubusercontent\.com\/yuhonas\/free-exercise-db\/main\/exercises\/.+\/0\.jpg$/);
  await expect(page.locator('#snProductModal .sn-v42-source')).toContainText('Real-person exercise photos');
});
