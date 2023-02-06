import { exec, spawn } from "node:child_process";
import { expect, test } from "@playwright/test";

test.beforeAll(() => {
  spawn("next dev", [], { env: { CLIPFACE_USER_PASSWORD: "", CLIPFACE_PRIVATE_CLIPS_LIST: "true", CLIPFACE_CLIPS_PATH: "/clips_test", NODE_ENV: "development" }, shell: true });
});

test.afterAll(async ({ page }) => {
  exec("npx kill-port 3000");
  await page.waitForTimeout(5000);
});

const authToken = "%242b%2410%24jyrgqt%2FyLpr0wNsP9vd.S.Y1gvcWFga3UYIf3bVdXvQn3SQAkBjci";

test("Should be denied permission to view index page", async ({ page }) => {
  await page.goto("/");
  expect(await page.locator("div:text(\"You do not have permission\")").isVisible()).toBeTruthy();
});

test("Should be denied permission to view a private link", async ({ page }) => {
  await page.goto("/watch/30659904");
  expect(await page.locator("div:text(\"You do not have permission\")").isVisible()).toBeTruthy();
});

test("Should be able to view a public link", async ({ page }) => {
  await page.goto("/watch/56473756");
  await page.locator("h1:text(\"clip 1\")").waitFor({ state: "visible" });
  expect(await page.locator("p:text(\"public link\")").isVisible()).toBeTruthy();
});

test("Should not be able to select a clip as authorized user", async ({ page, context }) => {
  await context.addCookies([{ name: "authToken", value: authToken, url: "http://localhost:3000/" }]);
  await page.goto("/");
  expect(await page.locator("div:text(\"You do not have permission\")").isVisible()).toBeTruthy();
});

test("Should see public link message as authorized user", async ({ page, context }) => {
  await context.addCookies([{ name: "authToken", value: authToken, url: "http://localhost:3000/" }]);
  await page.goto("/watch/56473756");
  await page.locator("h1:text(\"clip 1\")").waitFor({ state: "visible" });
  expect(await page.locator("p:text(\"public link\")").isVisible()).toBeTruthy();
});