import { defineConfig, devices } from "@playwright/test"

const isCI = !!process.env.CI

//! Some headless containers (no GPU, restricted process namespace) crash chromium's
//! zygote/GPU subprocess on launch. Set PLAYWRIGHT_CHROMIUM_NO_ZYGOTE=1 to bypass.
const chromiumArgs = process.env.PLAYWRIGHT_CHROMIUM_NO_ZYGOTE ? ["--no-zygote"] : []

//* https://playwright.dev/docs/test-configuration
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: 2,
  workers: isCI ? 1 : undefined,
  outputDir: "./e2e/test-results",

  reporter: isCI
    ? [["html", { open: "never", outputFolder: "./e2e/playwright-report" }], ["github"]]
    : [["html", { open: "never", outputFolder: "./e2e/playwright-report" }]],

  use: {
    baseURL: "http://localhost:3002",
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
    command: "pnpm preview",

    //* The readiness probe targets the preview: it renders without the API.
    url: "http://localhost:3002/preview/accordion",

    reuseExistingServer: true,
  },
})
