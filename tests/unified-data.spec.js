const { test, expect } = require('@playwright/test');

async function reset(page) {
  await page.goto('/?e2e=unified-data', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem('sn_onboarding_seen_v36', '1');
    if ('caches' in window) await Promise.all((await caches.keys()).map(key => caches.delete(key)));
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#app')).not.toBeEmpty();
}

test('one completed workout updates history, totals, muscles, refresh, edit, and delete', async ({ page }) => {
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await reset(page);

  const seeded = await page.evaluate(() => {
    const today = SN36.todayName();
    const first = exerciseLibrary.find(exercise => exercise.id === 'chest-press') || exerciseLibrary[0];
    const second = exerciseLibrary.find(exercise => exercise.id !== first.id && exercise.muscle !== first.muscle) || exerciseLibrary[1];
    SN36.upsertWorkout({
      id: 'integration-workout',
      name: 'Integration Workout',
      days: [today],
      exercises: [{ ...first, sets: 1, reps: 10 }]
    });
    state.page = 'home';
    render();
    return { firstId: first.id, secondId: second.id, secondName: second.name };
  });

  await page.locator('#startWorkout').click();
  await expect(page.locator('.sn-workout-screen')).toBeVisible();
  await expect(page.locator('input[aria-label="Weight for set 1"]')).toHaveValue('');
  await expect(page.locator('input[aria-label="Reps for set 1"]')).toHaveValue('');

  await page.locator('input[aria-label="Weight for set 1"]').fill('50');
  await page.locator('input[aria-label="Reps for set 1"]').fill('10');
  await page.locator('[data-complete-set="0"]').click();

  await page.locator('#snAddExerciseToWorkout').click();
  await page.locator(`[data-add-active="${seeded.secondId}"]`).click();
  await expect.poll(() => page.evaluate(() => SN36.active.exercises.length)).toBe(2);
  await page.locator('#snNextExercise').click();
  await expect(page.getByRole('heading', { name: seeded.secondName })).toBeVisible();
  await expect(page.locator('input[aria-label="Weight for set 1"]')).toHaveValue('');
  await page.locator('input[aria-label="Weight for set 1"]').fill('30');
  await page.locator('input[aria-label="Reps for set 1"]').fill('12');
  await page.locator('[data-complete-set="0"]').click();
  await page.locator('#snNextExercise').click();

  await expect.poll(() => page.evaluate(() => state.page)).toBe('summary');
  const completed = await page.evaluate(() => {
    const rows = SN36.sessions();
    const summary = SN36.summary();
    const latest = rows.at(-1);
    return {
      count: rows.length,
      workoutId: latest.workoutId,
      completedSets: latest.completedSets,
      exerciseIds: latest.exercises.map(exercise => exercise.exerciseId),
      instanceIds: latest.exercises.map(exercise => exercise.workoutExerciseId),
      muscleCount: summary.muscles.length,
      volume: summary.volume,
      legacyCount: state.completedWorkouts
    };
  });
  expect(completed).toMatchObject({ count: 1, workoutId: 'integration-workout', completedSets: 2, legacyCount: 1 });
  expect(completed.exerciseIds).toEqual([seeded.firstId, seeded.secondId]);
  expect(new Set(completed.instanceIds).size).toBe(2);
  expect(completed.muscleCount).toBeGreaterThan(1);
  expect(completed.volume).toBeGreaterThan(0);

  await page.reload({ waitUntil: 'domcontentloaded' });
  const afterReload = await page.evaluate(() => ({
    sessions: SN36.sessions().length,
    completed: state.completedWorkouts,
    workout: SN36.workouts().find(item => item.id === 'integration-workout')?.name,
    active: localStorage.getItem(SN36.keys.active)
  }));
  expect(afterReload).toEqual({ sessions: 1, completed: 1, workout: 'Integration Workout', active: null });

  await page.evaluate(() => {
    const workout = SN36.workouts().find(item => item.id === 'integration-workout');
    SN36.upsertWorkout({ ...workout, name: 'Renamed Integration Workout', days: ['Tuesday'] });
  });
  const edited = await page.evaluate(() => ({
    scheduledTuesday: SN36.scheduleMap().get('Tuesday')?.id,
    previousSession: SN36.previousWorkout(SN36.workouts()[0])?.id,
    historyName: SN36.sessions()[0].workoutName
  }));
  expect(edited.scheduledTuesday).toBe('integration-workout');
  expect(edited.previousSession).toBeTruthy();
  expect(edited.historyName).toBe('Integration Workout');

  await page.evaluate(() => SN36.deleteWorkout('integration-workout'));
  const deleted = await page.evaluate(() => ({
    workouts: SN36.workouts().length,
    schedule: SN36.scheduleMap().size,
    history: SN36.sessions().length,
    stats: SN36.summary().workouts
  }));
  expect(deleted).toEqual({ workouts: 0, schedule: 0, history: 1, stats: 1 });

  await page.evaluate(() => {
    state.page = 'progress';
    render();
  });
  await expect(page.getByText('1 sessions', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Muscle focus' })).toBeVisible();
  expect(pageErrors).toEqual([]);
  expect(consoleErrors.filter(message => !/favicon|supabase/i.test(message))).toEqual([]);
});

test('prefilled history values select as a unit and zero-set finishes stay incomplete', async ({ page }) => {
  await reset(page);
  await page.evaluate(() => {
    const today = SN36.todayName();
    const exercise = exerciseLibrary.find(item => item.id === 'chest-press') || exerciseLibrary[0];
    SN36.upsertWorkout({ id: 'repeat-workout', name: 'Repeat Workout', days: [today], exercises: [{ ...exercise, sets: 1, reps: 10 }] });
    SN36.addSession({
      id: 'previous-session', timestamp: Date.now() - 86400000, workoutId: 'repeat-workout', workoutName: 'Repeat Workout',
      exercises: [{ ...exercise, sets: [{ weight: 75, reps: 9, done: true }] }]
    });
    state.page = 'home';
    render();
  });

  await page.locator('#startWorkout').click();
  const weight = page.locator('input[aria-label="Weight for set 1"]');
  await expect(weight).toHaveValue('75');
  await weight.focus();
  await page.keyboard.type('80');
  await expect(weight).toHaveValue('80');

  page.once('dialog', dialog => dialog.accept());
  await page.locator('#snFinishEarly').click();
  await expect.poll(() => page.evaluate(() => state.page)).toBe('activeWorkout');
  await expect(page.getByText('Complete at least one set before finishing')).toBeVisible();
  expect(await page.evaluate(() => SN36.sessions().length)).toBe(1);
});
