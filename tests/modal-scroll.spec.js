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

test('active workout add-exercise modal keeps native mobile scrolling while the background stays locked', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setupActiveWorkout(page);

  await page.locator('#snAddExerciseToWorkout').click();

  const backdrop = page.locator('#snProductModal');
  const modal = backdrop.locator('.sn-modal');
  await expect(modal).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains('sn-background-locked'))).toBe(true);

  const metrics = await modal.evaluate(node => {
    const style = getComputedStyle(node);
    const backdropStyle = getComputedStyle(node.parentElement);
    return {
      clientHeight: node.clientHeight,
      scrollHeight: node.scrollHeight,
      touchAction: style.touchAction,
      backdropTouchAction: backdropStyle.touchAction,
      overflowY: style.overflowY
    };
  });

  expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);
  expect(metrics.touchAction).toContain('pan-y');
  expect(metrics.backdropTouchAction).not.toBe('none');
  expect(metrics.backdropTouchAction).toContain('pan-y');
  expect(['auto', 'scroll']).toContain(metrics.overflowY);

  // Exercise the browser's real scrolling path instead of only assigning
  // scrollTop in JavaScript. The old regression test could pass even while an
  // ancestor touch-action:none made the sheet feel frozen on iOS.
  await modal.evaluate(node => { node.scrollTop = 0; });
  await modal.hover();
  await page.mouse.wheel(0, 420);
  await expect.poll(() => modal.evaluate(node => node.scrollTop)).toBeGreaterThan(0);

  await backdrop.locator('[data-close]').click();
  await expect(backdrop).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains('sn-background-locked'))).toBe(false);
});
