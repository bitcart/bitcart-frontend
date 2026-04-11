import { expect, test } from "@playwright/test"

test.describe("Directory: Homepage", () => {
  test("page loads with title", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText("Bitcart Directory", { exact: false }).first()).toBeVisible()
  })

  test("search field is visible", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("textbox")).toBeVisible()
  })

  test("submit button is visible", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText("Submit", { exact: false }).first()).toBeVisible()
  })
})
