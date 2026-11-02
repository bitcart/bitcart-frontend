import { waitUntilHydrated } from "@bitcart/qa/e2e"
import { expect, test } from "@playwright/test"

test.describe("Blog: List header", () => {
  test("on a phone, the current filter scrolls into view", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/category/plugins")
    await waitUntilHydrated(page)

    const filters = page.getByRole("navigation", { name: "Filter posts" })
    const current = filters.getByRole("link", { name: /^Plugins/ })

    await expect(current).toHaveAttribute("aria-current", "page")
    await expect(current).toBeInViewport({ ratio: 1 })
  })

  test("links to the RSS feed", async ({ page }) => {
    await page.goto("/")
    await waitUntilHydrated(page)

    await expect(page.getByRole("link", { name: "RSS feed" })).toHaveAttribute("href", "/rss.xml")
  })
})
