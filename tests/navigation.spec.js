const { test, expect } = require('@playwright/test');

const BUILD = 'dashboard-v77';

async function clearBrowserState(page) {
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
}

async function openFresh(page) {
  await page.goto('/?e2e=1', { waitUntil: 'domcontentloaded' });
  await clearBrowserState(page);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('meta[name="startnow-build"]')).toHaveAttribute('content', BUILD);
  await expect(page.locator('#app')).not.toBeEmpty();
  await expect(page.locator('[data-sn70-action="quickWorkout"]')).toBeVisible();
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

async function assertRouteState(page, expected) {
  const route = await page.evaluate(() => typeof state === 'undefined' ? null : state.page);
  expect(route, `active state.page should be ${expected}`).toBe(expected);
}

async function assertHome(page) {
  await assertRouteState(page, 'home');
  await expect(page.locator('.plan-card')).toBeVisible();
  await expect(page.locator('[data-sn70-action="quickWorkout"]')).toBeVisible();
  await expect(page.locator('[data-sn70-action="exerciseLibrary"]')).toBeVisible();
  await expect(page.locator('[data-sn70-action="calendar"]')).toBeVisible();
  await expect(page.locator('[data-sn70-action="myStats"]')).toBeVisible();
  await expect(page.getByText('Today', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Achievements', { exact: true })).toHaveCount(0);

  const audit = await page.evaluate(() => window.START_NOW_RUNTIME?.audit?.() || null);
  expect(audit?.quickActionCount).toBe(4);
  expect(audit?.oldQuickActionLabels).toEqual([]);
  await assertRuntimeHealthy(page);
}

async function diagnostics(page, pageErrors, consoleErrors) {
  const snapshot = await page.evaluate(() => ({
    url: location.href,
    build: document.querySelector('meta[name="startnow-build"]')?.content || null,
    statePage: typeof state === 'undefined' ? null : state.page,
    activePage: document.getElementById('app')?.dataset.activePage || null,
    appChildCount: document.getElementById('app')?.children.length || 0,
    appChildClasses: [...(document.getElementById('app')?.children || [])].map(node => ({
      tag: node.tagName,
      id: node.id || null,
      className: node.className || null
    })),
    quickActions: [...document.querySelectorAll('[data-sn70-action]')].map(node => node.dataset.sn70Action),
    headings: [...document.querySelectorAll('#app h1, #app h2')].slice(0, 12).map(node => node.textContent.trim()),
    runtimeAudit: window.START_NOW_RUNTIME?.audit?.() || null
  }));
  return { ...snapshot, pageErrors, consoleErrors };
}

test.describe('START/NOW navigation smoke', () => {
  let pageErrors;
  let consoleErrors;

  test.beforeEach(async ({ page }) => {
    pageErrors = [];
    consoleErrors = [];
    page.on('pageerror', error => pageErrors.push(error.stack || error.message));
    page.on('console', message => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    await openFresh(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    const snapshot = await diagnostics(page, pageErrors, consoleErrors);
    await testInfo.attach('navigation-runtime.json', {
      body: Buffer.from(JSON.stringify(snapshot, null, 2)),
      contentType: 'application/json'
    });
    await assertRuntimeHealthy(page);
    expect(pageErrors, `Uncaught page errors:\n${pageErrors.join('\n\n')}`).toEqual([]);
  });

  test('Home', async ({ page }) => {
    await assertHome(page);
  });

  test('Workouts', async ({ page }) => {
    await page.getByRole('button', { name: 'Workouts', exact: true }).click();
    await assertRouteState(page, 'workouts');
    await expect(page.getByRole('heading', { name: 'Workouts', exact: true })).toBeVisible();
    await expect(page.locator('.plan-card')).toHaveCount(0);
    await assertRuntimeHealthy(page);
  });

  test('Progress', async ({ page }) => {
    await page.getByRole('button', { name: 'Progress', exact: true }).click();
    await assertRouteState(page, 'progress');
    await expect(page.getByRole('heading', { name: 'Progress', exact: true })).toBeVisible();
    await expect(page.locator('.plan-card')).toHaveCount(0);
    await assertRuntimeHealthy(page);
  });

  test('Profile', async ({ page }) => {
    await page.getByRole('button', { name: 'Profile', exact: true }).click();
    await assertRouteState(page, 'profile');
    await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible();
    await expect(page.locator('.plan-card')).toHaveCount(0);
    await assertRuntimeHealthy(page);
  });

  test('Quick Workout', async ({ page }) => {
    await page.locator('[data-sn70-action="quickWorkout"]').click();
    await assertRouteState(page, 'quickWorkout');
    await expect(page.getByRole('heading', { name: 'Quick Workout' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Build workout/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Choose existing/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Surprise me/i })).toBeVisible();
    await expect(page.locator('.plan-card')).toHaveCount(0);
    await assertRuntimeHealthy(page);

    await page.locator('.sn66-back').click();
    await assertHome(page);
  });

  test('Exercise Library', async ({ page }) => {
    await page.locator('[data-sn70-action="exerciseLibrary"]').click();
    await assertRouteState(page, 'exerciseLibrary');
    await expect(page.getByRole('heading', { name: /Find an exercise/i })).toBeVisible();
    await expect(page.locator('input[placeholder*="Search exercise"]')).toBeVisible();
    await expect(page.locator('.sn-library-list')).toBeVisible();
    await expect(page.locator('.plan-card')).toHaveCount(0);
    await assertRuntimeHealthy(page);

    await page.locator('#snBack').click();
    await assertHome(page);
  });

  test('Workout Calendar', async ({ page }) => {
    await page.locator('[data-sn70-action="calendar"]').click();
    await assertRouteState(page, 'calendar');
    await expect(page.getByRole('heading', { name: /Workout Calendar/i })).toBeVisible();
    await expect(page.locator('.sn63-month-grid')).toBeVisible();
    await expect(page.locator('.plan-card')).toHaveCount(0);
    await assertRuntimeHealthy(page);

    await page.locator('.sn63-back').click();
    await assertHome(page);
  });

  test('My Stats', async ({ page }) => {
    await page.locator('[data-sn70-action="myStats"]').click();
    await assertRouteState(page, 'myStats');
    await expect(page.getByRole('heading', { name: /My Stats/i })).toBeVisible();
    await expect(page.getByText(/Workouts completed/i)).toBeVisible();
    await expect(page.locator('.plan-card')).toHaveCount(0);
    await assertRuntimeHealthy(page);

    await page.locator('#sn70Back').click();
    await assertHome(page);
  });
});
