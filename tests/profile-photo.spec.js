const { test, expect } = require('@playwright/test');
const path = require('path');

const fixture = path.join(__dirname, '..', 'assets', 'pwa', 'icon-192.png');

async function openProfile(page) {
  await page.goto('/?e2e=1', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('sn_user_profile_v36', JSON.stringify({
      experience: 'Beginner',
      goal: 'Build muscle',
      days: ['Monday', 'Wednesday', 'Friday'],
      location: 'Gym',
      duration: 45,
      avoid: ''
    }));
    sessionStorage.setItem('sn_onboarding_seen_v36', '1');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Profile', exact: true }).click();
}

test('profile photo can be changed from the avatar and survives reload', async ({ page }) => {
  await openProfile(page);

  const avatar = page.locator('.profile-avatar');
  await expect(avatar).toHaveAttribute('role', 'button');
  await expect(avatar).toHaveAttribute('aria-label', 'Add profile photo');
  await expect(page.getByRole('button', { name: 'Add photo', exact: true })).toBeVisible();

  const chooserPromise = page.waitForEvent('filechooser');
  await avatar.click();
  const chooser = await chooserPromise;
  expect(chooser.isMultiple()).toBe(false);
  await chooser.setFiles(fixture);

  await expect(avatar).toHaveClass(/sn-has-photo/);
  await expect(avatar).toHaveAttribute('aria-label', 'Change profile photo');
  await expect(page.getByRole('button', { name: 'Change photo', exact: true })).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('sn_user_profile_v36')));
  expect(saved.photo).toMatch(/^data:image\/jpeg;base64,/);
  expect(saved.photoUpdatedAt).toEqual(expect.any(Number));

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Profile', exact: true }).click();
  await expect(page.locator('.profile-avatar')).toHaveClass(/sn-has-photo/);
  await expect(page.locator('.profile-avatar')).toHaveCSS('background-image', /data:image\/jpeg;base64/);
});
