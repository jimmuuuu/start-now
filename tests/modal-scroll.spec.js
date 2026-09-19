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

test('active workout add-exercise modal keeps native mobile scrolling without mutating the document body', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setupActiveWorkout(page);

  const before = await page.evaluate(() => ({
    htmlOverflow: document.documentElement.style.overflow,
    htmlHeight: document.documentElement.style.height,
    bodyOverflow: document.body.style.overflow,
    bodyHeight: document.body.style.height
  }));

  await page.locator('#snAddExerciseToWorkout').click();

  const backdrop = page.locator('#snProductModal');
  const modal = backdrop.locator('.sn-modal');
  await expect(modal).toBeVisible();

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
  expect(['auto', 'pan-y', 'manipulation', 'pan-y pinch-zoom']).toContain(metrics.backdropTouchAction);
  expect(['auto', 'scroll']).toContain(metrics.overflowY);
  expect(metrics.pointerEvents).not.toBe('none');

  const during = await page.evaluate(() => ({
    htmlOverflow: document.documentElement.style.overflow,
    htmlHeight: document.documentElement.style.height,
    bodyOverflow: document.body.style.overflow,
    bodyHeight: document.body.style.height,
    appPointerEvents: getComputedStyle(document.querySelector('.app-shell')).pointerEvents
  }));
  expect(during.htmlOverflow).toBe(before.htmlOverflow);
  expect(during.htmlHeight).toBe(before.htmlHeight);
  expect(during.bodyOverflow).toBe(before.bodyOverflow);
  expect(during.bodyHeight).toBe(before.bodyHeight);
  expect(during.appPointerEvents).not.toBe('none');

  await modal.evaluate(node => { node.scrollTop = 0; });
  await modal.hover();
  await page.mouse.wheel(0, 420);
  await expect.poll(() => modal.evaluate(node => node.scrollTop)).toBeGreaterThan(0);

  await backdrop.locator('[data-close]').click();
  await expect(backdrop).toHaveCount(0);
});

test('workout splits use a compact centered dialog and lock background scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/?e2e=splits-dialog', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    const spacer = document.createElement('div');
    spacer.id = 'snSplitScrollTestSpacer';
    spacer.style.height = '1200px';
    document.body.appendChild(spacer);
    window.scrollTo(0, 240);
  });

  await page.getByRole('button', { name: 'Workouts', exact: true }).click();
  await page.evaluate(() => window.scrollTo(0, 240));
  const beforeY = await page.evaluate(() => window.scrollY);
  await page.locator('#snTemplates').click();

  const backdrop = page.locator('#snProductModal.sn-splits-modal');
  const dialog = backdrop.locator('.sn-splits-dialog');
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Workout splits', exact: true })).toBeVisible();
  await expect(backdrop.locator('[data-split]')).toHaveCount(5);

  const metrics = await dialog.evaluate(node => ({
    height: node.getBoundingClientRect().height,
    viewportHeight: window.innerHeight,
    overflowY: getComputedStyle(node).overflowY,
    backdropAlign: getComputedStyle(node.parentElement).alignItems,
    columns: getComputedStyle(node.querySelector('.sn-splits-list')).gridTemplateColumns,
    bodyPosition: getComputedStyle(document.body).position,
    bodyOverflow: getComputedStyle(document.body).overflow
  }));

  expect(metrics.height).toBeLessThan(metrics.viewportHeight * 0.75);
  expect(metrics.overflowY).toBe('hidden');
  expect(metrics.backdropAlign).toBe('center');
  expect(metrics.columns.split(' ').length).toBe(2);
  expect(metrics.bodyPosition).not.toBe('fixed');
  expect(metrics.bodyOverflow).toBe('hidden');

  await page.mouse.wheel(0, 500);
  expect(await page.evaluate(() => window.scrollY)).toBe(beforeY);

  await backdrop.locator('[data-close]').click();
  await expect(backdrop).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(beforeY);
  expect(await page.evaluate(() => document.body.style.position)).toBe('');
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

  const searchFontSize = await search.evaluate(node => parseFloat(getComputedStyle(node).fontSize));
  expect(searchFontSize).toBeGreaterThanOrEqual(16);

  await search.fill('biceps curl');
  const choice = backdrop.locator('[data-add-active]').filter({ hasText: 'Biceps Curl' }).first();
  await expect(choice).toBeVisible();

  const hitTarget = await choice.evaluate(node => {
    const rect = node.getBoundingClientRect();
    return { height: rect.height, touchAction: getComputedStyle(node).touchAction };
  });
  expect(hitTarget.height).toBeGreaterThanOrEqual(60);
  expect(['auto', 'manipulation', 'pan-y', 'pan-y pinch-zoom']).toContain(hitTarget.touchAction);

  const beforeCount = await page.evaluate(() => window.SN36?.active?.exercises?.length || 0);
  await choice.tap();

  await expect(backdrop).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.SN36?.active?.exercises?.length || 0)).toBe(beforeCount + 1);
  await expect.poll(() => page.evaluate(() => window.SN36?.active?.exercises?.some(ex => ex.name === 'Biceps Curl'))).toBe(true);

  await context.close();
});

test('a light touch with small finger drift activates an exercise choice on pointerup', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true
  });
  const page = await context.newPage();

  await setupActiveWorkout(page);
  await page.locator('#snAddExerciseToWorkout').tap();

  const backdrop = page.locator('#snProductModal');
  const choice = backdrop.locator('[data-add-active]').filter({ hasText: 'Biceps Curl' }).first();
  await expect(choice).toBeVisible();

  const beforeCount = await page.evaluate(() => window.SN36?.active?.exercises?.length || 0);

  await choice.evaluate(node => {
    const rect = node.getBoundingClientRect();
    const x = rect.left + Math.min(36, rect.width / 2);
    const y = rect.top + rect.height / 2;
    const base = {
      bubbles: true,
      cancelable: true,
      pointerId: 17,
      pointerType: 'touch',
      isPrimary: true,
      button: 0,
      buttons: 1,
      clientX: x,
      clientY: y
    };
    node.dispatchEvent(new PointerEvent('pointerdown', base));
    node.dispatchEvent(new PointerEvent('pointerup', {
      ...base,
      buttons: 0,
      clientX: x + 6,
      clientY: y + 5
    }));
  });

  await expect(backdrop).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.SN36?.active?.exercises?.length || 0)).toBe(beforeCount + 1);
  await expect.poll(() => page.evaluate(() => window.SN36?.active?.exercises?.some(ex => ex.name === 'Biceps Curl'))).toBe(true);

  await context.close();
});
