import { expect, test } from "@playwright/test"

test.describe("Landing: Terms of Service", () => {
  test("page loads successfully", async ({ page }) => {
    const response = await page.goto("/plugins/tos")
    expect(response?.status()).toBe(200)
  })

  test("expected content is visible", async ({ page }) => {
    await page.goto("/plugins/tos")
    await expect(page.getByText("Terms of Service", { exact: false }).first()).toBeVisible()
  })
})
