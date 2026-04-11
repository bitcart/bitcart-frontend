import { expect, test } from "@playwright/test"

test.describe("Landing: Homepage", () => {
  test("hero section renders", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText("Bitcart", { exact: true }).first()).toBeVisible()
    await expect(page.getByText("Start Accepting Crypto Payments", { exact: false })).toBeVisible()
  })

  test("features section is visible", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText("Features", { exact: false }).first()).toBeVisible()
  })
})
