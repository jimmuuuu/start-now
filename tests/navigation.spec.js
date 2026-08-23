const { test, expect } = require('@playwright/test');

async function openFresh(page) {
  await page.goto('/?e2e=1');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#app')).not.toBeEmpty();
  await expect(page.getByRole('button', { name: /Quick Workout/i })).toBeVisible();
}

async function assertRuntimeHealthy(page) {
  await expect(page.locator('.sn77-error-boundary')).toHaveCount(0);
  const audit = await page.evaluate(() => window.START_NOW_RUNTIME?.audit?.() || null);
  expect(audit, 'runtime audit is available').not.toBeNull();
  expect(audit.hasVisibleContent, 'main content is visible').toBe(true);
  expect(audit.errorBoundaryVisible, 'error boundary is not visible').toBe(false);
  expect(audit.duplicateIds, 'no duplicate element IDs').toEqual([]);
  expect(audit.lastError, 'runtime did not capture an error').toBeNull();
}

async function assertHome(page) {
  await expect(page.locator('.plan-card')).toBeVisible();
  await expect(page.getByRole('button', { name: /Quick Workout/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Exercise Library/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Workout Calendar/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /My Stats/i })).toBeVisible();
  await expect(page.getByText('Today', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Achievements', { exact: true })).toHaveCount(0);

  const audit = await page.evaluate(() => window.START_NOW_RUNTIME?.audit?.() || null);
  expect(audit?.quickActionCount).toBe(4);
  expect(audit?.oldQuickActionLabels).toEqual([]);
  await assertRuntimeHealthy(page);
}

test.describe('START/NOW navigation smoke', () => {
  let pageErrors;

  test.beforeEach(async ({ page }) => {
    pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await openFresh(page);
  });

  test.afterEach(async ({ page }) => {
    await assertRuntimeHealthy(page);
    expect(pageErrors, `Uncaught page errors: ${pageErrors.join(' | ')}`).toEqual([]);
  });

  test('Home renders the canonical Quick Actions', async ({ page }) => {
    await assertHome(page);
  });

  test('Quick Workout opens as a standalone screen and returns Home', async ({ page }) => {
    await page.getByRole('button', { name: /Quick Workout/i }).click();
    await expect(page.getByRole('heading', { name: 'Quick Workout' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Build workout/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Choose existing/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Surprise me/i })).toBeVisible();
    await expect(page.locator('.plan-card')).toHaveCount(0);
    await assertRuntimeHealthy(page);

    await page.locator('.sn66-back').click();
    await assertHome(page);
  });

  test('Exercise Library opens with search, filters and exercise list', async ({ page }) => {
    await page.getByRole('button', { name: /Exercise Library/i }).click();
    await expect(page.getByRole('heading', { name: /Find an exercise/i })).toBeVisible();
    await expect(page.locator('input[placeholder*="Search exercise"]')).toBeVisible();
    await expect(page.locator('.sn-library-list')).toBeVisible();
    await expect(page.locator('.plan-card')).toHaveCount(0);
    await assertRuntimeHealthy(page);

    const back = page.locator('#snBack');
    await expect(back).toBeVisible();
    await back.click();
    await assertHome(page);
  });

  test('Workout Calendar still opens and returns Home', async ({ page }) => {
    await page.getByRole('button', { name: /Workout Calendar/i }).click();
    await expect(page.getByRole('heading', { name: /Workout Calendar/i })).toBeVisible();
    await expect(page.locator('.sn63-month-grid')).toBeVisible();
    await expect(page.locator('.plan-card')).toHaveCount(0);
    await assertRuntimeHealthy(page);

    await page.locator('.sn63-back').click();
    await assertHome(page);
  });

  test('My Stats still opens and returns Home', async ({ page }) => {
    await page.getByRole('button', { name: /My Stats/i }).click();
    await expect(page.getByRole('heading', { name: /My Stats/i })).toBeVisible();
    await expect(page.getByText(/Workouts completed/i)).toBeVisible();
    await expect(page.locator('.plan-card')).toHaveCount(0);
    await assertRuntimeHealthy(page);

    await page.locator('#sn70Back').click();
    await assertHome(page);
  });

  test('Bottom navigation remains functional', async ({ page }) => {
    await page.getByRole('button', { name: 'Workouts', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Workouts', exact: true })).toBeVisible();
    await assertRuntimeHealthy(page);

    await page.getByRole('button', { name: 'Progress', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Progress', exact: true })).toBeVisible();
    await assertRuntimeHealthy(page);

    await page.getByRole('button', { name: 'Profile', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible();
    await assertRuntimeHealthy(page);

    await page.getByRole('button', { name: 'Home', exact: true }).click();
    await assertHome(page);
  });
});
