import { LOCALE_SELECTOR_TRIGGER_TESTID } from "@bitcart/qa"
import { waitUntilHydrated } from "@bitcart/qa/e2e"
import { expect, test } from "@playwright/test"

import { DEFAULT_TEST_ROUTE } from "./constants"

test.describe("Checkout: Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DEFAULT_TEST_ROUTE)
    await waitUntilHydrated(page)
  })

  test("has a main landmark", async ({ page }) => {
    await expect(page.getByRole("main")).toHaveCount(1)
  })

  test("names the locale selector after its visible text", async ({ page }) => {
    await expect(page.getByTestId(LOCALE_SELECTOR_TRIGGER_TESTID)).toHaveAccessibleName(
      "Select language English",
    )
  })
})
