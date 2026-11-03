import { waitUntilHydrated } from "@bitcart/qa/e2e"
import { expect, test } from "@playwright/test"

const EXTERNAL_LINK_POST_PATH = "/bitcartcc-version-0610-is-out"
const IN_PAGE_LINK_POST_PATH = "/bitcartcc-versions-0003-and-4-are-out"

test.describe("Blog: Links in posts", () => {
  test("a link to another site opens in a new tab and says so", async ({ page }) => {
    await page.goto(EXTERNAL_LINK_POST_PATH)
    await waitUntilHydrated(page)

    const link = page.getByRole("link", { name: "bitcart-store#319 (opens in new tab)" })

    await expect(link).toHaveAttribute("target", "_blank")
    await expect(link).toHaveAttribute("rel", "noopener")
  })

  test("a link to a section stays in the tab and scrolls to it", async ({ page }) => {
    await page.goto(IN_PAGE_LINK_POST_PATH)
    await waitUntilHydrated(page)

    const link = page.getByRole("listitem").getByRole("link", { name: "One domain support" })

    await expect(link).not.toHaveAttribute("target")
    await expect(link).not.toHaveAttribute("aria-current")

    await link.click()

    await expect(page).toHaveURL(/#one-domain-support$/)
    await expect(page.locator("#one-domain-support")).toBeInViewport()
  })
})
