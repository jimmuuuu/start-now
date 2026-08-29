const { test, expect } = require('@playwright/test');

test('exercise notes save with a session and return next time', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.evaluate(() => startWorkout(defaultWorkout));
  await expect(page.getByRole('heading', { name: 'Chest Press', exact: true })).toBeVisible();

  const note = page.locator('#snExerciseNote');
  await expect(note).toBeVisible();
  await expect(page.getByText('No previous note for this exercise yet.')).toBeVisible();
  await note.fill('Seat 4, neutral grip, slow lowering.');
  await expect(page.locator('#snNoteStatus')).toHaveText('Saved');

  const activeNote = await page.evaluate(() => JSON.parse(localStorage.getItem('sn_active_workout_v36')).exercises[0].note);
  expect(activeNote).toBe('Seat 4, neutral grip, slow lowering.');

  await page.locator('input[aria-label="Weight for set 1"]').fill('40');
  await page.locator('input[aria-label="Reps for set 1"]').fill('10');
  await page.locator('[data-complete-set="0"]').click();

  const exerciseCount = await page.evaluate(() => window.SN36.active.exercises.length);
  for (let index = 0; index < exerciseCount; index += 1) {
    await page.locator('#snNextExercise').click();
  }

  await expect(page.getByText('WORKOUT COMPLETE', { exact: true })).toBeVisible();
  const completedNote = await page.evaluate(() => {
    const sessions = JSON.parse(localStorage.getItem('sn_progress_sessions'));
    return sessions.at(-1).exercises[0].note;
  });
  expect(completedNote).toBe('Seat 4, neutral grip, slow lowering.');

  await page.evaluate(() => startWorkout(defaultWorkout));
  await expect(page.locator('.sn-last-note')).toContainText('Seat 4, neutral grip, slow lowering.');
  await expect(page.locator('#snExerciseNote')).toHaveValue('');
});
