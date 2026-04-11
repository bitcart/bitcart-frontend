import { expect, test } from "@playwright/test"

test.describe("Landing: Support Us page", () => {
  test("page loads successfully", async ({ page }) => {
    const response = await page.goto("/support-us")
    expect(response?.status()).toBe(200)
  })

  test("expected content is visible", async ({ page }) => {
    await page.goto("/support-us")
    await expect(page.getByText("Support", { exact: false }).first()).toBeVisible()
  })
})
