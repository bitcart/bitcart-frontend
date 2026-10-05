import { defineConfig, devices } from "@playwright/test"

const isCI = !!process.env.CI

//* Distinct from the dev server's port: E2E never reuses a running dev server.
const E2E_PORT = 4001
const E2E_BASE_URL = `http://localhost:${E2E_PORT}`

//! Some headless containers (no GPU, restricted process namespace) crash chromium's
//! zygote/GPU subprocess on launch. Set PLAYWRIGHT_CHROMIUM_NO_ZYGOTE=1 to bypass.
const chromiumArgs = process.env.PLAYWRIGHT_CHROMIUM_NO_ZYGOTE ? ["--no-zygote"] : []

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
    baseURL: E2E_BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",

      use: {
        ...devices["Desktop Chrome"],
        launchOptions: { args: chromiumArgs },
      },
    },
  ],

  webServer: {
    command: `pnpm preview --port ${E2E_PORT}`,
    url: E2E_BASE_URL,
    reuseExistingServer: true,
  },
})
