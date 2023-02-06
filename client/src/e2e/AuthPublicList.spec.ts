import { exec, spawn } from "node:child_process";
import { expect, test } from "@playwright/test";

test.beforeAll(() => {
  spawn("next dev", [], { env: { CLIPFACE_USER_PASSWORD: "test", CLIPFACE_PRIVATE_CLIPS_LIST: "false", CLIPFACE_CLIPS_PATH: "/clips_test", NODE_ENV: "development" }, shell: true });
});

test.afterAll(async ({ page }) => {
  exec("npx kill-port 3000");
  await page.waitForTimeout(5000);
});

const authToken = "%242b%2410%24jyrgqt%2FyLpr0wNsP9vd.S.Y1gvcWFga3UYIf3bVdXvQn3SQAkBjci";

test("Should be able to view index as public user", async ({ page }) => {
  await page.goto("/");
  await page.locator("td:text(\"clip 1\")").waitFor({ state: "visible" });
  expect(page.url().includes("login")).toBeFalsy();
  expect(await page.locator("td:text(\"clip 3\")").isVisible()).toBeFalsy();
});

test("Should redirect to login from private link as a public user", async ({ page }) => {
  await page.goto("/watch/30659904");
  expect(page.url().includes("login")).toBeTruthy();
});

test("Should be able to view a public link as a public user", async ({ page }) => {
  await page.goto("/watch/56473756");
  await page.locator("h1:text(\"clip 1\")").waitFor({ state: "visible" });
  expect(await page.locator("p:text(\"public link\")").isVisible()).toBeTruthy();
});

test("Should be able to view a private link as authorized user", async ({ page, context }) => {
  await context.addCookies([{ name: "authToken", value: authToken, url: "http://localhost:3000/" }]);
  await page.goto("/watch/30659904");
  await page.locator("h1:text(\"clip 3\")").waitFor({ state: "visible" });
  expect(await page.locator("p:text(\"public link\")").isVisible()).toBeFalsy();
});

test("Should be able to select a clip", async ({ page, context }) => {
  await context.addCookies([{ name: "authToken", value: authToken, url: "http://localhost:3000/" }]);
  await page.goto("/");
  await page.click("td:text(\"clip 1\")");
  await page.locator("h1:text(\"clip 1\")").waitFor({ state: "visible" });
});

test("Should not see public link message as authorized user", async ({ page, context }) => {
  await context.addCookies([{ name: "authToken", value: authToken, url: "http://localhost:3000/" }]);
  await page.goto("/watch/56473756");
  await page.locator("h1:text(\"clip 1\")").waitFor({ state: "visible" });
  expect(await page.locator("p:text(\"public link\")").isVisible()).toBeFalsy();
});