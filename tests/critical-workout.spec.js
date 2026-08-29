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

async function seedTodayWorkout(page) {
  await page.evaluate(() => {
    const today = typeof dayName === 'function'
      ? dayName()
      : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
    const base = exerciseLibrary.find(ex => ex.id === 'chest-press') || exerciseLibrary[0];
    state.customWorkouts = [{
      id: 'e2e-critical-workout',
      name: 'Critical Test Workout',
      builtIn: false,
      days: [today],
      exercises: [{ ...base, sets: 1, reps: 10, weight: 50 }]
    }];
    saveCustomWorkouts();
    state.page = 'home';
    render();
  });
}

test('critical workout flow saves a real completed session', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.stack || error.message));
  await clearBrowserState(page);
  await seedTodayWorkout(page);

  await expect(page.locator('#startWorkout')).toBeVisible();
  await page.locator('#startWorkout').click();

  await expect.poll(() => page.evaluate(() => state.page)).toBe('activeWorkout');
  await expect(page.locator('.sn-workout-screen')).toBeVisible();
  await expect(page.locator('#snExerciseNote')).toBeVisible();

  const weight = page.locator('input[aria-label="Weight for set 1"]');
  const reps = page.locator('input[aria-label="Reps for set 1"]');
  await weight.fill('55');
  await reps.fill('10');
  await page.locator('#snExerciseNote').fill('Critical flow persistence check');
  await page.locator('[data-complete-set="0"]').click();

  await expect(page.locator('.sn-set-row').first()).toHaveClass(/completed/);

  page.once('dialog', dialog => dialog.accept());
  await page.locator('#snFinishEarly').click();

  await expect.poll(() => page.evaluate(() => state.page)).toBe('summary');
  await expect(page.getByText('WORKOUT COMPLETE', { exact: true })).toBeVisible();
  await expect(page.locator('.sn-grade-lockup')).toBeVisible();

  const saved = await page.evaluate(() => {
    const sessions = JSON.parse(localStorage.getItem('sn_progress_sessions') || '[]');
    const active = localStorage.getItem('sn_active_workout_v36');
    const latest = sessions.at(-1) || null;
    const firstExercise = latest?.exercises?.[0] || null;
    const firstSet = firstExercise?.sets?.[0] || null;
    return {
      count: sessions.length,
      active,
      completedSets: latest?.completedSets,
      weight: firstSet?.weight,
      reps: firstSet?.reps,
      done: firstSet?.done,
      note: firstExercise?.note
    };
  });

  expect(saved.count).toBe(1);
  expect(saved.active).toBeNull();
  expect(saved.completedSets).toBeGreaterThanOrEqual(1);
  expect(saved.weight).toBe(55);
  expect(saved.reps).toBe(10);
  expect(saved.done).toBe(true);
  expect(saved.note).toBe('Critical flow persistence check');
  expect(pageErrors).toEqual([]);

  await page.locator('#snSummaryHome').click();
  await expect.poll(() => page.evaluate(() => state.page)).toBe('home');
  await expect(page.locator('#quickStart')).toBeVisible();
  await expect(page.locator('[data-sn70-action="myStats"]')).toBeVisible();
});

test('Last Time expands inline and keeps the user inside the workout', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.stack || error.message));
  await clearBrowserState(page);

  await page.evaluate(() => {
    const base = exerciseLibrary.find(ex => ex.id === 'chest-press') || exerciseLibrary[0];
    const exercise = { ...base, id: base.id || 'chest-press', name: base.name || 'Chest Press', muscle: base.muscle || 'Chest' };
    const prior = {
      id: 'e2e-prior-session',
      workoutId: 'e2e-inline-history',
      workoutName: 'Inline History Test',
      timestamp: Date.now() - 86400000,
      exercises: [{
        ...exercise,
        note: 'Keep the seat one notch lower next time.',
        sets: [
          { weight: 115, reps: 8, done: true },
          { weight: 125, reps: 8, done: true },
          { weight: 135, reps: 8, done: true }
        ]
      }]
    };
    localStorage.setItem('sn_progress_sessions', JSON.stringify([prior]));
    startWorkout({
      id: 'e2e-inline-history',
      name: 'Inline History Test',
      days: [],
      exercises: [{ ...exercise, sets: 3, reps: 10, weight: 115 }]
    });
  });

  await expect.poll(() => page.evaluate(() => state.page)).toBe('activeWorkout');
  const lastTime = page.locator('[data-sn131-toggle]');
  await expect(lastTime).toBeVisible();
  await expect(page.getByText('3 completed sets', { exact: true })).toBeVisible();

  await lastTime.click();

  await expect(lastTime).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText('115 lb × 8 reps', { exact: true })).toBeVisible();
  await expect(page.getByText('125 lb × 8 reps', { exact: true })).toBeVisible();
  await expect(page.getByText('135 lb × 8 reps', { exact: true })).toBeVisible();
  await expect(page.locator('[data-sn131-details]').getByText('Keep the seat one notch lower next time.', { exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => state.page)).toBe('activeWorkout');

  await lastTime.click();
  await expect(lastTime).toHaveAttribute('aria-expanded', 'false');
  expect(pageErrors).toEqual([]);
});

test('home does not show a duplicate resume card when no workout is scheduled', async ({ page }) => {
  await clearBrowserState(page);
  await page.evaluate(() => {
    startWorkout(defaultWorkout);
    state.customWorkouts = [];
    saveCustomWorkouts();
    state.page = 'home';
    render();
  });

  await expect(page.locator('.sn-resume-card')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'No workout scheduled' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Set up my schedule →' })).toBeVisible();
});
