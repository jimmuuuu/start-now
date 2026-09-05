const { test, expect } = require('@playwright/test');

async function setupActiveWorkout(page) {
  await page.goto('/?e2e=1', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem('sn_onboarding_seen_v36', '1');

    const today = typeof dayName === 'function'
      ? dayName()
      : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
    const base = exerciseLibrary.find(ex => ex.id === 'chest-press') || exerciseLibrary[0];

    state.customWorkouts = [{
      id: 'e2e-modal-scroll',
      name: 'Modal Scroll Test',
      builtIn: false,
      days: [today],
      exercises: [{ ...base, sets: 1, reps: 10, weight: 50 }]
    }];
    saveCustomWorkouts();
    state.page = 'home';
    render();
    document.getElementById('snProductModal')?.remove();
  });

  await page.locator('#startWorkout').click();
  await expect(page.locator('.sn-workout-screen')).toBeVisible();
}

test('active workout add-exercise modal remains scrollable while the background is locked', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setupActiveWorkout(page);

  await page.locator('#snAddExerciseToWorkout').click();

  const backdrop = page.locator('#snProductModal');
  const modal = backdrop.locator('.sn-modal');
  await expect(modal).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains('sn-background-locked'))).toBe(true);

  const metrics = await modal.evaluate(node => {
    const style = getComputedStyle(node);
    const maxScroll = Math.max(0, node.scrollHeight - node.clientHeight);
    node.scrollTop = Math.min(180, maxScroll);
    return {
      clientHeight: node.clientHeight,
      scrollHeight: node.scrollHeight,
      scrollTop: node.scrollTop,
      touchAction: style.touchAction,
      overflowY: style.overflowY
    };
  });

  expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);
  expect(metrics.scrollTop).toBeGreaterThan(0);
  expect(metrics.touchAction).toContain('pan-y');
  expect(['auto', 'scroll']).toContain(metrics.overflowY);

  await backdrop.locator('[data-close]').click();
  await expect(backdrop).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains('sn-background-locked'))).toBe(false);
});
