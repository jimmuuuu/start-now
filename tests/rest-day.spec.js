const { test, expect } = require('@playwright/test');

async function fresh(page) {
  await page.goto('/?e2e=1', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
    }
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
}

test('scheduled rest day shows recovery plan and next workout', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.stack || error.message));
  await fresh(page);

  const setup = await page.evaluate(() => {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const today = days[new Date().getDay()];
    const tomorrow = days[(new Date().getDay()+1)%7];
    state.customWorkouts = [{
      id: 'e2e-next-workout',
      name: 'Next Test Workout',
      builtIn: false,
      days: [tomorrow],
      exercises: [{id:'chest-press',name:'Chest Press',muscle:'Chest',sets:3,reps:10,weight:50,cue:'Control each rep.'}]
    }];
    saveCustomWorkouts();
    state.page = 'home';
    render();
    return { today, tomorrow };
  });

  await expect(page.getByRole('heading', { name: 'Rest Day', exact: true })).toBeVisible();
  await expect(page.getByText('No workout scheduled', { exact: true })).toBeVisible();
  await expect(page.getByText(`Next: Next Test Workout • ${setup.tomorrow}`, { exact: true })).toBeVisible();
  await expect(page.locator('#sn54ViewRecovery')).toBeVisible();

  await page.locator('#sn54ViewRecovery').click();
  await expect.poll(() => page.evaluate(() => state.page)).toBe('restDay');
  await expect(page.getByRole('heading', { name: 'Rest Day', exact: true })).toBeVisible();
  await expect(page.getByText(`Next workout: Next Test Workout • ${setup.tomorrow}`, { exact: true })).toBeVisible();
  await expect(page.getByText('Recovery focus', { exact: true })).toBeVisible();

  await page.locator('#sn54Back').click();
  await expect.poll(() => page.evaluate(() => state.page)).toBe('home');
  await expect(page.getByRole('heading', { name: 'Rest Day', exact: true })).toBeVisible();
  expect(pageErrors).toEqual([]);
});
