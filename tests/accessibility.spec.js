const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
test("primary screens and workout dialogs meet automated WCAG AA checks", async ({
  page,
}) => {
  await page.goto("./");
  const check = async () => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        description: v.description,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  };
  for (const name of [
    "Workout",
    "History",
    "Exercises",
    "Progress",
    "Profile",
  ]) {
    await page
      .getByRole("navigation")
      .getByRole("button", { name, exact: true })
      .click();
    await check();
  }
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await check();
  await page.keyboard.press("Escape");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Workout", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Start empty workout", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add exercises", exact: true })
    .click();
  await check();
  await page.locator('[data-act="pick"][data-value="chest-press"]').click();
  await page
    .getByRole("button", { name: "Add 1 exercise", exact: true })
    .click();
  await check();
  await page
    .getByLabel("Weight for set 1 of Chest Press", { exact: true })
    .fill("50");
  await page
    .getByLabel("Reps for set 1 of Chest Press", { exact: true })
    .fill("10");
  await page
    .getByRole("button", { name: "Complete set 1 of Chest Press", exact: true })
    .click();
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await check();
  await page.getByRole("button", { name: "Save workout", exact: true }).click();
  await check();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Progress", exact: true })
    .click();
  await check();
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  await check();
});
