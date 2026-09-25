const { test, expect } = require("@playwright/test");
async function open(
  page,
  { signedIn = false, fail = false, remote = {} } = {},
) {
  await page.addInitScript(
    ({ signedIn, fail, remote }) => {
      window.cloudTest = { fail, remote, writes: [], signedOut: false };
      window.testUser = signedIn
        ? { id: "test-user", email: "athlete@example.test" }
        : null;
    },
    { signedIn, fail, remote },
  );
  await page.route("**/third-party/supabase.js*", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: [
        "window.supabase={createClient(){return {",
        "auth:{getSession:async()=>({data:{session:window.testUser?{user:window.testUser}:null}}),onAuthStateChange:callback=>{window.cloudTest.authEvent=callback},signOut:async()=>{window.cloudTest.signedOut=true;return {error:null}},signInWithPassword:async()=>({error:{message:'Invalid login credentials'}}),resetPasswordForEmail:async(email)=>{cloudTest.resetEmail=email;return {error:null}},updateUser:async()=>{cloudTest.passwordUpdated=true;return {error:null}},signUp:async()=>({data:{session:null},error:null})},",
        "from(table){let mutation=null; const q={select(){return q},eq(){return q},order(){return q},range(){return q},maybeSingle(){return q},upsert(value){mutation=value;return q},delete(){return q},in(){return q},then(resolve){if(mutation)window.cloudTest.writes.push({table,value:mutation});resolve({error:window.cloudTest.fail?{message:'Service unavailable'}:null,data:table==='profiles'?{app_settings:{start_now_backup:{storage:window.cloudTest.remote}}}:[]})}};return q}",
        "}}};",
      ].join("\n"),
    }),
  );
  await page.goto("/");
  await expect.poll(() => page.evaluate(() => !!window.SN_AUTH)).toBe(true);
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Profile", exact: true })
    .click();
}
test("auth errors, focus restoration, legal links and signup are usable", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.getByLabel("Email", { exact: true }).fill("athlete@example.test");
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.locator("#snAuthSubmit").click();
  await expect(page.locator("#snAuthError")).toContainText(
    "Invalid login credentials",
  );
  await page.keyboard.press("Escape");
  await expect(page.locator("#snAuthModal")).toBeHidden();
  await expect(page.locator("#snSignIn")).toBeFocused();
  await expect(
    page.getByRole("link", { name: "Privacy", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Support", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .first()
    .click();
  await page.getByLabel("Display name", { exact: true }).fill("Test athlete");
  await page.getByLabel("Email", { exact: true }).fill("athlete@example.test");
  await page.getByLabel("Password", { exact: true }).fill("valid-password");
  await page.locator("#snAuthSubmit").click();
  await expect(page.locator("#toast")).toContainText("Check your email");
});
test("failed backup prevents sign-out and preserves local workout data", async ({
  page,
}) => {
  await open(page, { signedIn: true, fail: true });
  await page.evaluate(() =>
    SN36.upsertWorkout({
      id: "unsynced",
      name: "Keep this",
      days: [],
      exercises: [],
    }),
  );
  expect(await page.evaluate(() => SN_AUTH.signOut())).toBe(false);
  expect(await page.evaluate(() => cloudTest.signedOut)).toBe(false);
  expect(
    await page.evaluate(() => localStorage.getItem("sn_custom_workouts")),
  ).toContain("Keep this");
  await page.evaluate(() => render());
  await expect(page.locator("#snCloudStatus")).toContainText(
    "Device copy is safe",
  );
});
test("cloud tombstones remove deleted records without resurrection", async ({
  page,
}) => {
  await open(page, { signedIn: true, fail: true });
  await page.evaluate(() => {
    SN36.upsertWorkout({
      id: "deleted-plan",
      name: "Old plan",
      days: [],
      exercises: [],
    });
    SN36.addSession({
      id: "deleted-session",
      timestamp: Date.now(),
      workoutName: "Old workout",
      completedSets: 1,
    });
    cloudTest.remote = {
      sn_deleted_workout_ids: '["deleted-plan"]',
      sn_deleted_session_ids: '["deleted-session"]',
    };
    cloudTest.fail = false;
  });
  expect(await page.evaluate(() => SN_AUTH.syncNow())).toBe(true);
  expect(
    await page.evaluate(() =>
      SN36.workouts().some((w) => w.id === "deleted-plan"),
    ),
  ).toBe(false);
  expect(await page.evaluate(() => SN36.sessions())).toEqual([]);
});
test("password reset and recovery use the auth client", async ({ page }) => {
  await open(page);
  await page.locator("#snSignIn").click();
  await page.getByRole("button", { name: "Forgot password?" }).click();
  await page.getByLabel("Email", { exact: true }).fill("athlete@example.test");
  await page.getByRole("button", { name: "Send reset link" }).click();
  expect(await page.evaluate(() => cloudTest.resetEmail)).toBe(
    "athlete@example.test",
  );
  await page.evaluate(() => cloudTest.authEvent("PASSWORD_RECOVERY", null));
  await expect(
    page.getByRole("heading", { name: "Choose a new password" }),
  ).toBeVisible();
  await page.getByLabel("Password", { exact: true }).fill("updated-password");
  await page
    .getByRole("button", { name: "Save password", exact: true })
    .click();
  expect(await page.evaluate(() => cloudTest.passwordUpdated)).toBe(true);
});
test("expired session isolates unsynced account data from guest mode", async ({
  page,
}) => {
  await open(page, { signedIn: true, fail: true });
  await page.evaluate(() =>
    SN36.upsertWorkout({
      id: "private-plan",
      name: "Private plan",
      days: [],
      exercises: [],
    }),
  );
  await page.addInitScript(() => {
    window.testUser = null;
  });
  await Promise.all([
    page.waitForEvent("domcontentloaded"),
    page.evaluate(() => cloudTest.authEvent("SIGNED_OUT", null)),
  ]);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("sn_cloud_owner")))
    .toBeNull();
  expect(
    await page.evaluate(() =>
      SN36.workouts().some((w) => w.id === "private-plan"),
    ),
  ).toBe(false);
  expect(
    await page.evaluate(() =>
      localStorage.getItem("sn_cloud_archive_test-user"),
    ),
  ).toContain("Private plan");
});
test("new profile edits win over stale cloud profile even without workout data", async ({
  page,
}) => {
  await open(page, { signedIn: true });
  await page.evaluate(() => {
    SN36.saveProfile({ displayName: "New name", profileUpdatedAt: 200 });
    cloudTest.remote = {
      sn_user_profile_v36: JSON.stringify({
        displayName: "Old name",
        profileUpdatedAt: 100,
      }),
    };
  });
  expect(await page.evaluate(() => SN_AUTH.syncNow())).toBe(true);
  expect(await page.evaluate(() => SN36.profile().displayName)).toBe(
    "New name",
  );
});
