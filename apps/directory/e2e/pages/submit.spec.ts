import { waitUntilHydrated } from "@bitcart/qa/e2e"
import { expect, test, type Page } from "@playwright/test"

const expectLocalizedValidationMessage = async (page: Page) => {
  await page.getByRole("button", { name: "Submit via GitHub" }).click()
  await expect(page.getByText("Required", { exact: true }).first()).toBeVisible()
}

test.describe("Directory: Submit page", () => {
  test("form renders", async ({ page }) => {
    await page.goto("/submit")
    await expect(page.getByText("Submit New Entry", { exact: false }).first()).toBeVisible()
  })

  test("back link is present", async ({ page }) => {
    await page.goto("/submit")

    const backLink = page
      .getByRole("link")
      .filter({ hasText: /back|directory/i })
      .first()

    await expect(backLink).toBeVisible()
  })

  test("validates with localized messages when opened directly", async ({ page }) => {
    await page.goto("/submit")
    await waitUntilHydrated(page)

    await expectLocalizedValidationMessage(page)
  })

  test("validates with localized messages when navigated to", async ({ page }) => {
    await page.goto("/")
    await waitUntilHydrated(page)

    await page.getByRole("link", { name: "Submit Entry" }).first().click()
    await expect(page).toHaveURL("/submit")

    await expectLocalizedValidationMessage(page)
  })
})
