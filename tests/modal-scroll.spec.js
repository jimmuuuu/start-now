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
      overflowY: style.overflowY,
      pointerEvents: style.pointerEvents
    };
  });

  expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);
  expect(metrics.touchAction).toContain('pan-y');
  expect(metrics.backdropTouchAction).not.toBe('none');
  expect(['auto', 'pan-y', 'manipulation']).toContain(metrics.backdropTouchAction);
  expect(['auto', 'scroll']).toContain(metrics.overflowY);
  expect(metrics.pointerEvents).not.toBe('none');

  await modal.evaluate(node => { node.scrollTop = 0; });
  await modal.hover();
  await page.mouse.wheel(0, 420);
  await expect.poll(() => modal.evaluate(node => node.scrollTop)).toBeGreaterThan(0);

  await backdrop.locator('[data-close]').click();
  await expect(backdrop).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains('sn-background-locked'))).toBe(false);
});

test('add-exercise search and exercise choices remain tappable on a touch device', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true
  });
  const page = await context.newPage();

  await setupActiveWorkout(page);
  await page.locator('#snAddExerciseToWorkout').tap();

  const backdrop = page.locator('#snProductModal');
  const search = page.locator('#snActiveExerciseSearch');
  await expect(backdrop).toBeVisible();
  await search.tap();
  await expect(search).toBeFocused();

  await search.fill('biceps curl');
  const choice = backdrop.locator('[data-add-active]').filter({ hasText: 'Biceps Curl' }).first();
  await expect(choice).toBeVisible();

  const beforeCount = await page.evaluate(() => window.SN36?.active?.exercises?.length || 0);
  await choice.tap();

  await expect(backdrop).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.SN36?.active?.exercises?.length || 0)).toBe(beforeCount + 1);
  await expect.poll(() => page.evaluate(() => window.SN36?.active?.exercises?.some(ex => ex.name === 'Biceps Curl'))).toBe(true);

  await context.close();
});
