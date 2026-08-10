import { expect, test } from "@playwright/test"

test.describe("Vike Example: Error page", () => {
  test("unknown route renders the 404 page", async ({ page }) => {
    await page.goto("/this-route-does-not-exist")
    await expect(page.getByText("404", { exact: false }).first()).toBeVisible()
  })
})
