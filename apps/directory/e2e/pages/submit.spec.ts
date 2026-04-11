import { expect, test } from "@playwright/test"

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
})
