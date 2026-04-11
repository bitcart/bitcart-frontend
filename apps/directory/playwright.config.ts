import { defineConfig, devices } from "@playwright/test"

const isCI = !!process.env.CI

//* https://playwright.dev/docs/test-configuration
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  outputDir: "./e2e/test-results",
  reporter: isCI
    ? [["html", { open: "never", outputFolder: "./e2e/playwright-report" }], ["github"]]
    : [["html", { open: "never", outputFolder: "./e2e/playwright-report" }]],

  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "just preview -p @bitcart/directory --outputStyle static",
    url: "http://localhost:3001",
    reuseExistingServer: false,
    cwd: "../..",
  },
})
