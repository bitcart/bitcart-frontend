import { expect, test } from "@playwright/test"

test.describe("Vike Example: Homepage", () => {
  test("greeting heading is visible", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { name: "Hello, World!" })).toBeVisible()
  })
})
