const { test, expect } = require('@playwright/test');

async function resetApp(page) {
  await page.goto('/?e2e=1', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    state.customWorkouts = [];
    state.page = 'home';
    render();
  });
}

async function dismissStartupModal(page) {
  await page.evaluate(() => {
    document.getElementById('snProductModal')?.remove();
  });
  await expect(page.locator('#snProductModal')).toHaveCount(0);
}

async function seedWorkout(page) {
  await page.evaluate(() => {
    const today = typeof dayName === 'function'
      ? dayName()
      : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
    const base = exerciseLibrary.find(ex => ex.id === 'chest-press') || exerciseLibrary[0];
    state.customWorkouts = [{
      id: 'e2e-mobile-input',
      name: 'Mobile Input Test',
      builtIn: false,
      days: [today],
      exercises: [{ ...base, sets: 1, reps: 10, weight: 50 }]
    }];
    saveCustomWorkouts();
    state.page = 'home';
    render();
  });
}

test('swap search stays focused while typing and uses an iOS-safe font size', async ({ page }) => {
  await resetApp(page);
  await seedWorkout(page);
  await dismissStartupModal(page);

  await page.locator('#startWorkout').click();
  await expect(page.locator('.sn-workout-screen')).toBeVisible();
  await page.locator('#snSwapExercise').click();

  const search = page.locator('#snSwapSearch');
  await expect(search).toBeVisible();
  await expect(search).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains('sn-background-locked'))).toBe(true);

  const fontSize = await search.evaluate(node => parseFloat(getComputedStyle(node).fontSize));
  expect(fontSize).toBeGreaterThanOrEqual(16);

  for (const character of 'bench') {
    await page.keyboard.type(character);
    await expect(search).toBeFocused();
  }

  await expect(search).toHaveValue('bench');
});

test('workout builder inputs remain focused and mobile-sized while typing', async ({ page }) => {
  await resetApp(page);

  await page.evaluate(() => {
    state.page = 'workouts';
    render();
  });
  await dismissStartupModal(page);
  await page.locator('#createWorkout').click();
  await dismissStartupModal(page);

  const name = page.locator('#workoutName');
  const exerciseSearch = page.locator('#exerciseSearch');
  await expect(name).toBeVisible();

  await name.click();
  const nameFontSize = await name.evaluate(node => parseFloat(getComputedStyle(node).fontSize));
  expect(nameFontSize).toBeGreaterThanOrEqual(16);

  for (const character of 'Arms') {
    await page.keyboard.type(character);
    await expect(name).toBeFocused();
  }
  await expect(name).toHaveValue('Arms');

  await exerciseSearch.click();
  const searchFontSize = await exerciseSearch.evaluate(node => parseFloat(getComputedStyle(node).fontSize));
  expect(searchFontSize).toBeGreaterThanOrEqual(16);

  for (const character of 'curl') {
    await page.keyboard.type(character);
    await expect(exerciseSearch).toBeFocused();
  }
  await expect(exerciseSearch).toHaveValue('curl');
});
