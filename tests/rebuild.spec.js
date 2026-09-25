const { test, expect } = require("@playwright/test");
const errorsFor = (page) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
};

test("home prioritizes resuming and preserves previous performance", async ({
  page,
}) => {
  await start(page, { sets: 1, exercises: 1 });
  await logSet(page);
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await page.getByRole("button", { name: "Save workout", exact: true }).click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Workout", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  await expect(
    page.getByLabel("Weight for set 1 of Chest Press", { exact: true }),
  ).toHaveValue("55");
  await expect(page.locator(".previous-set")).toContainText("55 × 10");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Workout", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Resume workout", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Start empty workout", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Resume workout", exact: true })
    .click();
  await expect(page.locator(".set-row")).not.toHaveClass(/completed/);
});

test("history editing, rename, repeat, and deletion update derived progress", async ({
  page,
}) => {
  await start(page, { sets: 1, exercises: 1 });
  await logSet(page);
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await page.getByRole("button", { name: "Save workout", exact: true }).click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "History", exact: true })
    .click();
  await page.locator(".history-row").click();
  await page
    .getByRole("button", { name: "Workout options", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Rename workout", exact: true })
    .click();
  await page
    .getByLabel("Workout name", { exact: true })
    .fill("Renamed session");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Save", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Renamed session", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Workout options", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Edit logged sets", exact: true })
    .click();
  await page.getByLabel("Weight · lb", { exact: true }).fill("75");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  expect(await page.evaluate(() => SN36.summary().volume)).toBe(750);
  await page
    .getByRole("button", { name: "Repeat workout", exact: true })
    .click();
  await expect(
    page.getByLabel("Weight for set 1 of Chest Press", { exact: true }),
  ).toHaveValue("75");
  await page
    .getByRole("button", { name: "Discard workout", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Discard workout", exact: true })
    .click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "History", exact: true })
    .click();
  await page.locator(".history-row").click();
  await page
    .getByRole("button", { name: "Workout options", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Delete workout", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete workout", exact: true })
    .click();
  expect(await page.evaluate(() => SN36.summary().volume)).toBe(0);
  await page.reload();
  expect(await page.evaluate(() => SN36.sessions().length)).toBe(0);
});

test("browser back cancellation keeps the routine draft and matching URL", async ({
  page,
}) => {
  await boot(page);
  await page.getByRole("button", { name: "New", exact: true }).click();
  await page.getByLabel("Routine name", { exact: true }).fill("Unsaved draft");
  await page.goBack();
  await expect(page.getByRole("dialog")).toContainText("Leave routine editor");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page).toHaveURL(/#\/builder$/);
  await expect(page.getByLabel("Routine name", { exact: true })).toHaveValue(
    "Unsaved draft",
  );
  await page.goBack();
  await page.getByRole("button", { name: "Leave", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Workout", exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(/#\/home$/);
});
async function boot(page) {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Workout", exact: true }),
  ).toBeVisible();
}
async function seed(page, { sets = 2, exercises = 2 } = {}) {
  await page.evaluate(
    ({ sets, exercises }) => {
      const routine = {
        id: "test-routine",
        name: "Upper strength",
        days: [SN36.todayName()],
        exercises: [
          exerciseLibrary.find((e) => e.id === "chest-press"),
          exerciseLibrary.find((e) => e.id === "lat-pulldown"),
        ]
          .slice(0, exercises)
          .map((e) => ({ ...e, sets, repMin: 8, repMax: 10 })),
      };
      SN36.upsertWorkout(routine);
      render();
    },
    { sets, exercises },
  );
}
async function start(page, options) {
  await boot(page);
  await seed(page, options);
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Upper strength" }),
  ).toBeVisible();
}
async function logSet(page, name = "Chest Press", weight = "55", reps = "10") {
  await page
    .getByLabel("Weight for set 1 of " + name, { exact: true })
    .fill(weight);
  await page
    .getByLabel("Reps for set 1 of " + name, { exact: true })
    .fill(reps);
  await page
    .getByRole("button", { name: "Complete set 1 of " + name, exact: true })
    .click();
}
test("new user can start an empty workout and choose multiple exercises", async ({
  page,
}) => {
  const errors = errorsFor(page);
  await boot(page);
  await page
    .getByRole("button", { name: "Start empty workout", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add exercises", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("Search exercises", { exact: true })
    .fill("Chest Press");
  await page
    .getByRole("dialog")
    .locator('[data-act="pick"][data-value="chest-press"]')
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("Search exercises", { exact: true })
    .fill("Lat Pulldown");
  await page
    .getByRole("dialog")
    .locator('[data-act="pick"][data-value="lat-pulldown"]')
    .click();
  await page
    .getByRole("button", { name: "Add 2 exercises", exact: true })
    .click();
  await expect(page.locator(".workout-exercise")).toHaveCount(2);
  await expect(
    page.getByLabel("Weight for set 1 of Chest Press", { exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("full workout saves every completed set, note, grade and history across reload", async ({
  page,
}) => {
  const errors = errorsFor(page);
  await start(page);
  await page
    .getByLabel("Note for Chest Press", { exact: true })
    .fill("Seat 3; controlled lowering.");
  await logSet(page);
  await expect(page.locator('[data-row="0:0"]')).toHaveClass(/completed/);
  await page.getByRole("button", { name: "Pause rest timer" }).click();
  const remaining = await page.evaluate(
    () => SN36.active.rest.remainingSeconds,
  );
  await page.reload();
  await expect(
    page.getByLabel("Note for Chest Press", { exact: true }),
  ).toHaveValue("Seat 3; controlled lowering.");
  expect(await page.evaluate(() => SN36.active.rest.remainingSeconds)).toBe(
    remaining,
  );
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "History", exact: true })
    .click();
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await logSet(page, "Lat Pulldown", "80", "8");
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await page.getByRole("button", { name: "Save workout", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Workout saved" }),
  ).toBeVisible();
  const saved = await page.evaluate(() => ({
    active: localStorage.getItem("sn_active_workout_v36"),
    s: SN36.sessions()[0],
  }));
  expect(saved.active).toBeNull();
  expect(saved.s.completedSets).toBe(2);
  expect(saved.s.volume).toBe(1190);
  expect(saved.s.exercises[0].note).toBe("Seat 3; controlled lowering.");
  expect(saved.s.grade).toBeGreaterThan(0);
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "History", exact: true })
    .click();
  await page.locator(".history-row").click();
  await expect(page.getByText("Seat 3; controlled lowering.")).toBeVisible();
  await page.reload();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Progress", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Workout consistency" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("adding and deleting individual sets preserves the remaining log", async ({
  page,
}) => {
  await start(page, { sets: 1, exercises: 1 });
  await logSet(page);
  await page.getByRole("button", { name: "Add set", exact: true }).click();
  await expect(page.locator(".set-row")).toHaveCount(2);
  await page
    .getByRole("button", { name: "Options for set 2 of Chest Press" })
    .click();
  await page.getByRole("button", { name: /Delete set/ }).click();
  await expect(page.locator(".set-row")).toHaveCount(1);
  await expect(page.locator(".set-row")).toHaveClass(/completed/);
});
test("invalid logging and unfinished workout cannot be saved", async ({
  page,
}) => {
  await start(page, { sets: 1, exercises: 1 });
  await page
    .getByRole("button", { name: "Complete set 1 of Chest Press" })
    .click();
  expect(await page.evaluate(() => Workout.totals().done)).toBe(0);
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator("#toast")).toContainText(
    "Complete at least one set",
  );
});
test("swap lists correlated exercises and keeps completed work", async ({
  page,
}) => {
  await start(page);
  await logSet(page);
  await page
    .getByRole("button", { name: "Options for Chest Press", exact: true })
    .click();
  await page.getByRole("button", { name: /Replace exercise/ }).click();
  const ids = await page
    .locator('[data-act="pick"]')
    .evaluateAll((nodes) => nodes.map((n) => n.dataset.value));
  expect(ids.length).toBeGreaterThan(0);
  expect(ids).not.toContain("lat-pulldown");
  await page.locator('[data-act="pick"]').first().click();
  expect(await page.evaluate(() => SN36.active.exercises[0].sets[0].done)).toBe(
    true,
  );
  expect(await page.evaluate(() => SN36.active.exercises.length)).toBe(3);
  expect(await page.evaluate(() => SN36.active.exercises[1].swappedFrom)).toBe(
    "Chest Press",
  );
});
test("timer controls persist pause, adjustment and auto preference", async ({
  page,
}) => {
  await start(page, { sets: 1, exercises: 1 });
  await logSet(page);
  await page.getByRole("button", { name: "Pause rest timer" }).click();
  const before = await page.evaluate(() => SN36.active.rest.remainingSeconds);
  await page.getByRole("button", { name: "Add 15 seconds" }).click();
  expect(await page.evaluate(() => SN36.active.rest.remainingSeconds)).toBe(
    before + 15,
  );
  await page.locator('[data-act="restSettings"]').click();
  await page.getByLabel("Duration", { exact: true }).selectOption("120");
  await page.getByLabel("Start after completing a set").uncheck();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Save", exact: true })
    .click();
  await page.getByRole("button", { name: "Skip", exact: true }).click();
  expect(await page.evaluate(() => SN36.restPrefs())).toEqual({
    seconds: 120,
    autoStart: false,
  });
});
test("routine creation, reordering, prescriptions, scheduling and editing persist", async ({
  page,
}) => {
  await boot(page);
  await page.getByRole("button", { name: "New", exact: true }).click();
  await page.getByLabel("Routine name", { exact: true }).fill("My routine");
  await page.getByRole("button", { name: "Monday", exact: true }).click();
  await page
    .getByRole("button", { name: "Add exercises", exact: true })
    .click();
  await page.locator('[data-act="pick"][data-value="chest-press"]').click();
  await page.locator('[data-act="pick"][data-value="lat-pulldown"]').click();
  await page.getByRole("button", { name: "Add 2 exercises" }).click();
  await page.getByLabel("Sets for Chest Press", { exact: true }).fill("4");
  await page.getByRole("button", { name: "Move Lat Pulldown up" }).click();
  await page.getByRole("button", { name: "Save routine", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "My routine", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Options for My routine" }).click();
  await page.getByRole("button", { name: "Edit routine", exact: true }).click();
  await page
    .getByLabel("Routine name", { exact: true })
    .fill("My edited routine");
  await page.getByRole("button", { name: "Save routine", exact: true }).click();
  await page.reload();
  expect(await page.evaluate(() => SN36.workouts()[0].exercises[0].id)).toBe(
    "lat-pulldown",
  );
  expect(await page.evaluate(() => SN36.workouts()[0].exercises[1].sets)).toBe(
    4,
  );
  await page
    .getByRole("button", { name: "Weekly schedule", exact: true })
    .click();
  await page.getByLabel("Monday", { exact: true }).selectOption("");
  const id = await page.evaluate(() => SN36.workouts()[0].id);
  await page.getByLabel("Tuesday", { exact: true }).selectOption(id);
  await page
    .getByRole("button", { name: "Save schedule", exact: true })
    .click();
  expect(await page.evaluate(() => SN36.workouts()[0].days)).toEqual([
    "Tuesday",
  ]);
});
test("template library applies a split and confirms schedule replacement", async ({
  page,
}) => {
  await boot(page);
  await seed(page);
  await page.getByRole("button", { name: /Routine library/ }).click();
  await page.getByRole("button", { name: /Upper \/ Lower/ }).click();
  await page.getByRole("button", { name: "Add 4 routines" }).click();
  if (
    await page
      .getByRole("button", { name: "Use split", exact: true })
      .isVisible()
  )
    await page.getByRole("button", { name: "Use split", exact: true }).click();
  expect(await page.evaluate(() => SN36.workouts().length)).toBe(5);
  expect(
    await page.evaluate(
      () => SN36.workouts().find((w) => w.id === "test-routine").days,
    ),
  ).toEqual([]);
});
test("generator respects equipment and starts its preview", async ({
  page,
}) => {
  await boot(page);
  await page.getByRole("button", { name: /Generate a workout Choose/ }).click();
  await page.getByLabel("Equipment", { exact: true }).selectOption("Dumbbells");
  await page.getByLabel("Focus", { exact: true }).selectOption("Upper body");
  await page
    .getByRole("button", { name: "Generate workout", exact: true })
    .click();
  await page.getByRole("button", { name: "Use this workout" }).click();
  expect(
    await page.evaluate(() =>
      SN36.active.exercises.every((e) => SN36.equipment(e) === "Dumbbell"),
    ),
  ).toBe(true);
  await expect(
    page.getByRole("heading", { name: "Upper body workout" }),
  ).toBeVisible();
});
test("library search and filters can reach the entire 251-exercise catalog", async ({
  page,
}) => {
  await boot(page);
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Exercises", exact: true })
    .click();
  await expect(page.locator('#libraryResults [data-act="detail"]')).toHaveCount(
    251,
  );
  await page.getByLabel("Search exercises", { exact: true }).fill("pec deck");
  await page.locator("#libraryResults .exercise-row").click();
  await expect(page.getByRole("dialog")).toContainText("Pec Deck");
  await expect(page.locator(".detail-media img")).toHaveCount(2);
  await page.keyboard.press("Escape");
  await page.getByLabel("Search exercises", { exact: true }).fill("zzzzzz");
  await expect(
    page.getByRole("heading", { name: "No matching exercises" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator('#libraryResults [data-act="detail"]')).toHaveCount(
    251,
  );
});
test("profile edits, photo, preferences, dark mode and rest defaults survive reload", async ({
  page,
}) => {
  await boot(page);
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Profile", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Edit profile", exact: true })
    .last()
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("Display name", { exact: true })
    .fill("Jordan");
  await page
    .getByLabel("Profile photo", { exact: true })
    .setInputFiles("assets/pwa/icon-192.png");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByRole("heading", { name: "Jordan" })).toBeVisible();
  await expect(page.locator(".profile-picture img")).toBeVisible();
  await page.getByRole("button", { name: /Training preferences/ }).click();
  await page
    .getByLabel("Training level", { exact: true })
    .selectOption("Advanced");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByLabel("Dark appearance", { exact: false }).check();
  await page.getByLabel("Default rest", { exact: false }).selectOption("120");
  await page.reload();
  expect(await page.locator("html").getAttribute("class")).toContain("dark");
  expect(await page.evaluate(() => SN36.profile().experience)).toBe("Advanced");
  expect(await page.evaluate(() => SN36.restPrefs().seconds)).toBe(120);
});
test("storage exhaustion never clears an active workout", async ({ page }) => {
  await start(page, { sets: 1, exercises: 1 });
  await logSet(page);
  await page.evaluate(() => {
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (k === "sn_progress_sessions")
        throw new DOMException("Full", "QuotaExceededError");
      return orig.call(this, k, v);
    };
  });
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await page.getByRole("button", { name: "Save workout", exact: true }).click();
  await expect(page.locator("#finishError")).toContainText(
    "could not be saved",
  );
  expect(await page.evaluate(() => !!SN36.active)).toBe(true);
  expect(
    await page.evaluate(() => !!localStorage.getItem(SN36.keys.active)),
  ).toBe(true);
});
test("sheets trap focus, restore scroll and close with Escape", async ({
  page,
}) => {
  await boot(page);
  await seed(page);
  await page.getByRole("button", { name: /Routine library/ }).click();
  const y = await page.evaluate(() => -parseInt(document.body.style.top));
  await page.keyboard.press("Shift+Tab");
  expect(
    await page.evaluate(
      () => !!document.activeElement.closest('[role="dialog"]'),
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await page.evaluate(() => scrollY)).toBe(y);
  expect(await page.evaluate(() => document.body.style.position)).toBe("");
});
for (const width of [320, 360, 375, 390, 430, 768, 1280]) {
  test(
    "all destinations and active workout fit " + width + "px",
    async ({ page }) => {
      const errors = errorsFor(page);
      await page.setViewportSize({ width, height: 844 });
      await boot(page);
      await seed(page);
      for (const name of [
        "History",
        "Exercises",
        "Progress",
        "Profile",
        "Workout",
      ]) {
        await page
          .getByRole("navigation")
          .getByRole("button", { name, exact: true })
          .click();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
      }
      await page
        .getByRole("button", { name: "Start workout", exact: true })
        .click();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      await page
        .getByRole("button", { name: "Options for Chest Press", exact: true })
        .click();
      expect(
        await page.evaluate(
          () =>
            document.querySelector(".sheet").getBoundingClientRect().width <=
            innerWidth,
        ),
      ).toBe(true);
      expect(errors).toEqual([]);
    },
  );
}
test("discard confirmation is reversible and protects existing history", async ({
  page,
}) => {
  await start(page);
  await page
    .getByRole("button", { name: "Discard workout", exact: true })
    .click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(await page.evaluate(() => !!SN36.active)).toBe(true);
  await page
    .getByRole("button", { name: "Discard workout", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Discard workout", exact: true })
    .click();
  expect(
    await page.evaluate(() => localStorage.getItem(SN36.keys.active)),
  ).toBeNull();
});
test("offline reload retains the installed app and active session", async ({
  browser,
}) => {
  // Simulate a real unavailable origin. Playwright WebKit's setOffline emulation
  // rejects even service-worker responses: microsoft/playwright#42775.
  const server = require("../scripts/serve.cjs")("dist");
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const context = await browser.newContext({ serviceWorkers: "allow" }),
    page = await context.newPage();
  await page.goto("http://127.0.0.1:" + server.address().port + "/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await seed(page, { sets: 1, exercises: 1 });
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  await logSet(page);
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Upper strength" }),
  ).toBeVisible();
  expect(await page.evaluate(() => Workout.totals().done)).toBe(1);
  await context.close();
});
