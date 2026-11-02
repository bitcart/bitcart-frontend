import { waitUntilHydrated } from "@bitcart/qa/e2e"
import { expect, test } from "@playwright/test"

import { SAMPLE_POST } from "./constants"

test.describe("Blog: Search", () => {
  test("finds a post by a word in its body and opens it", async ({ page }) => {
    await page.goto("/")
    await waitUntilHydrated(page)

    await page.getByRole("button", { name: "Search" }).click()
    await page.getByRole("combobox").fill(SAMPLE_POST.bodyOnlyTerm)

    const result = page.getByRole("option", { name: SAMPLE_POST.title })

    await expect(page.getByRole("option")).toHaveCount(1)
    await expect(result).toBeVisible()

    await page.keyboard.press("Enter")
    await expect(page).toHaveURL(SAMPLE_POST.path)
    await expect(page.getByRole("heading", { level: 1, name: SAMPLE_POST.title })).toBeVisible()
  })
})
