const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

test("native asset preparation keeps root app as source and copies web assets", async () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, "capacitor.config.json"), "utf8"));
  expect(config).toMatchObject({
    appId: "com.startnow.fitness",
    appName: "START/NOW Fitness",
    webDir: "www"
  });

  const preparedIndex = fs.readFileSync(path.join(root, "www", "index.html"), "utf8");
  expect(preparedIndex).toContain("native-bridge-v109.js");
  expect(fs.existsSync(path.join(root, "www", "node_modules"))).toBe(false);
  expect(fs.existsSync(path.join(root, "www", "android"))).toBe(false);
});

test("Android project targets the current Google Play API level", async () => {
  const variables = fs.readFileSync(path.join(root, "android", "variables.gradle"), "utf8");
  expect(variables).toContain("compileSdkVersion = 36");
  expect(variables).toContain("targetSdkVersion = 36");
});

test("native back bridge mirrors in-app navigation before exiting", async ({ page }) => {
  let backHandler;
  let exitCount = 0;

  await page.addInitScript(() => {
    localStorage.setItem("sn_user_profile_v36", JSON.stringify({
      experience: "Beginner",
      goal: "Build muscle",
      days: ["Monday", "Wednesday", "Friday"],
      location: "Gym",
      duration: 45,
      avoid: ""
    }));
    window.Capacitor = {
      getPlatform: () => "android",
      isNativePlatform: () => true,
      Plugins: {
        App: {
          addListener: (_event, handler) => { window.__nativeBackHandler = handler; },
          exitApp: () => { window.__nativeExitCount = (window.__nativeExitCount || 0) + 1; }
        }
      }
    };
  });

  await page.goto("/?e2e=1", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#quickStart")).toBeVisible();
  await expect(page.locator("html")).toHaveClass(/sn-native/);

  backHandler = await page.evaluateHandle(() => window.__nativeBackHandler);
  expect(await page.evaluate(() => typeof window.__nativeBackHandler)).toBe("function");

  await page.getByRole("button", { name: "Workouts", exact: true }).click();
  await expect.poll(() => page.evaluate(() => state.page)).toBe("workouts");
  await backHandler.evaluate(handler => handler());
  await expect.poll(() => page.evaluate(() => state.page)).toBe("home");

  await backHandler.evaluate(handler => handler());
  exitCount = await page.evaluate(() => window.__nativeExitCount || 0);
  expect(exitCount).toBe(1);
});
