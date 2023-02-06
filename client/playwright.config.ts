import { PlaywrightTestConfig, devices } from "@playwright/test";

import path from "path";

const PORT = process.env.PORT || 3000;

const baseURL = `http://localhost:${PORT}`;

const config: PlaywrightTestConfig = {
  timeout: 15 * 1000,
  testDir: path.join(__dirname, "src/e2e"),
  workers: 1,
  retries: 0,
  outputDir: "src/e2e/results",
  use: {
    baseURL,
    trace: "retry-with-trace",
  },
  projects: [
    {
      name: "Desktop Chrome",
      use: {
        ...devices["Desktop Chrome"],
        headless: false,
      },
    },
  ],
};
export default config;
