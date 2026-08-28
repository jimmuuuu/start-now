const { test, expect } = require('@playwright/test');

const TEST_PROFILE = {
  experience: 'Beginner',
  goal: 'Build muscle',
  days: ['Monday', 'Wednesday', 'Friday'],
  location: 'Gym',
  duration: 45,
  avoid: ''
};

async function fresh(page) {
  await page.goto('/?e2e=1', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async profile => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('sn_user_profile_v36', JSON.stringify(profile));
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
    }
  }, TEST_PROFILE);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#app')).not.toBeEmpty();
  await expect(page.locator('#snProductModal')).toHaveCount(0);
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => {
    const offenders = [...document.querySelectorAll('body *')]
      .map(node => {
        const rect = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        return {
          tag: node.tagName,
          id: node.id || '',
          className: typeof node.className === 'string' ? node.className : '',
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          display: style.display,
          position: style.position,
          overflowX: style.overflowX
        };
      })
      .filter(item => item.display !== 'none' && (item.left < -1 || item.right > innerWidth + 1 || item.width > innerWidth + 1))
      .slice(0, 20);
    return {
      innerWidth,
      htmlWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      offenders
    };
  });
  const detail = JSON.stringify(metrics.offenders);
  expect(metrics.htmlWidth, `html width at ${metrics.innerWidth}px; offenders=${detail}`).toBeLessThanOrEqual(metrics.innerWidth + 1);
  expect(metrics.bodyWidth, `body width at ${metrics.innerWidth}px; offenders=${detail}`).toBeLessThanOrEqual(metrics.innerWidth + 1);
}

test('refreshing mid-workout preserves and resumes the active session', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.stack || error.message));
  await fresh(page);

  await page.evaluate(() => startWorkout(defaultWorkout));
  await expect(page.locator('.sn-workout-screen')).toBeVisible();

  await page.locator('input[aria-label="Weight for set 1"]').fill('77');
  await page.locator('input[aria-label="Reps for set 1"]').fill('9');
  await page.locator('#snExerciseNote').fill('Refresh persistence check');
  await page.locator('[data-complete-set="0"]').click();
  await expect(page.locator('.sn-set-row').first()).toHaveClass(/completed/);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.sn-resume-card')).toBeVisible();
  await page.locator('.sn-resume-card').click();

  await expect(page.locator('.sn-workout-screen')).toBeVisible();
  await expect(page.locator('input[aria-label="Weight for set 1"]')).toHaveValue('77');
  await expect(page.locator('input[aria-label="Reps for set 1"]')).toHaveValue('9');
  await expect(page.locator('#snExerciseNote')).toHaveValue('Refresh persistence check');
  await expect(page.locator('.sn-set-row').first()).toHaveClass(/completed/);
  expect(pageErrors).toEqual([]);
});

test('exercise swap uses same-muscle unused replacement and persists it', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.stack || error.message));
  await fresh(page);
  await page.evaluate(() => startWorkout(defaultWorkout));

  const before = await page.evaluate(() => {
    const exercise = window.SN36.active.exercises[window.SN36.active.index];
    return { name: exercise.name, muscle: exercise.muscle };
  });

  await page.locator('#snSwapExercise').click();
  await expect(page.locator('#snSwapSearch')).toBeVisible();
  const choices = page.locator('[data-swap]');
  await expect(choices.first()).toBeVisible();
  const choiceCount = await choices.count();
  expect(choiceCount).toBeGreaterThan(0);
  await choices.first().click();

  await expect(page.locator('#snProductModal')).toHaveCount(0);
  const after = await page.evaluate(() => {
    const exercise = window.SN36.active.exercises[window.SN36.active.index];
    const saved = JSON.parse(localStorage.getItem('sn_active_workout_v36') || 'null');
    const savedExercise = saved?.exercises?.[saved.index || 0];
    return {
      name: exercise.name,
      muscle: exercise.muscle,
      swappedFrom: exercise.swappedFrom,
      savedName: savedExercise?.name,
      savedMuscle: savedExercise?.muscle
    };
  });

  expect(after.name).not.toBe(before.name);
  expect(after.muscle).toBe(before.muscle);
  expect(after.swappedFrom).toBe(before.name);
  expect(after.savedName).toBe(after.name);
  expect(after.savedMuscle).toBe(before.muscle);
  await expect(page.getByRole('heading', { name: after.name, exact: true })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test('scheduled rest days do not break streak and completed days appear on calendar', async ({ page }) => {
  await fresh(page);

  const setup = await page.evaluate(() => {
    const names = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const scheduledNames = new Set(['Monday', 'Wednesday', 'Friday']);
    const completedDates = [];
    const cursor = new Date();
    cursor.setHours(12, 0, 0, 0);
    for (let scanned = 0; scanned < 21 && completedDates.length < 3; scanned += 1) {
      if (scheduledNames.has(names[cursor.getDay()])) completedDates.push(new Date(cursor));
      cursor.setDate(cursor.getDate() - 1);
    }

    state.customWorkouts = [{
      id: 'e2e-streak-workout',
      name: 'E2E Streak Workout',
      builtIn: false,
      days: [...scheduledNames],
      exercises: [{id:'chest-press', name:'Chest Press', muscle:'Chest', sets:2, reps:10, weight:50}]
    }];
    saveCustomWorkouts();

    const sessions = completedDates.map((date, index) => ({
      id: `e2e-session-${index}`,
      workoutId: 'e2e-streak-workout',
      workoutName: 'E2E Streak Workout',
      timestamp: date.getTime(),
      durationMinutes: 30,
      completedSets: 2,
      volume: 1000,
      grade: 90,
      exercises: [{id:'chest-press', name:'Chest Press', muscle:'Chest', sets:[{weight:50,reps:10,done:true}]}]
    }));
    localStorage.setItem('sn_progress_sessions', JSON.stringify(sessions));
    const stats = window.SN36.syncStats();
    state.page = 'home';
    render();
    return { streak: stats.streak, count: sessions.length };
  });

  expect(setup.count).toBe(3);
  expect(setup.streak).toBe(3);

  await page.locator('[data-sn70-action="calendar"]').click();
  await expect(page.getByRole('heading', { name: /Workout Calendar/i })).toBeVisible();
  const completedRows = page.locator('.sn63-activity-row').filter({ has: page.locator('.sn63-activity-icon.completed') }).filter({ hasText: 'E2E Streak Workout' });
  await expect(completedRows).toHaveCount(3);
  await expect(page.getByText('Completed', { exact: true }).first()).toBeVisible();
});

test('core v1 screens fit common phone widths without horizontal overflow', async ({ page }) => {
  for (const width of [320, 375, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await fresh(page);
    await expectNoHorizontalOverflow(page);

    const navBox = await page.locator('.bottom-nav').boundingBox();
    expect(navBox).not.toBeNull();
    expect(navBox.x).toBeGreaterThanOrEqual(-1);
    expect(navBox.x + navBox.width).toBeLessThanOrEqual(width + 1);

    await page.locator('#quickStart').click();
    await expect(page.getByRole('heading', { name: 'Start Workout' })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.evaluate(() => startWorkout(defaultWorkout));
    await expect(page.locator('.sn-workout-screen')).toBeVisible();
    await expect(page.locator('#snExerciseNote')).toBeVisible();
    await expectNoHorizontalOverflow(page);

    const workoutBox = await page.locator('.sn-workout-screen').boundingBox();
    expect(workoutBox).not.toBeNull();
    expect(workoutBox.x).toBeGreaterThanOrEqual(-1);
    expect(workoutBox.x + workoutBox.width).toBeLessThanOrEqual(width + 1);

    await page.evaluate(() => window.START_NOW_CLOUD?.openSignIn?.());
    const auth = page.locator('.sn-auth-modal.open');
    await expect(auth).toBeVisible();
    const sheetBox = await page.locator('.sn-auth-sheet').boundingBox();
    expect(sheetBox).not.toBeNull();
    expect(sheetBox.x).toBeGreaterThanOrEqual(-1);
    expect(sheetBox.x + sheetBox.width).toBeLessThanOrEqual(width + 1);
    expect(sheetBox.y).toBeGreaterThanOrEqual(-1);
    expect(sheetBox.y + sheetBox.height).toBeLessThanOrEqual(845);
    await page.locator('.sn-auth-close').click();
  }
});
