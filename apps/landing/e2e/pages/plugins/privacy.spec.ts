import { expect, test } from "@playwright/test"

test.describe("Landing: Privacy Policy page", () => {
  test("page loads successfully", async ({ page }) => {
    const response = await page.goto("/plugins/privacy")
    expect(response?.status()).toBe(200)
  })

  test("expected content is visible", async ({ page }) => {
    await page.goto("/plugins/privacy")
    await expect(page.getByText("Privacy Policy", { exact: false }).first()).toBeVisible()
  })
})
