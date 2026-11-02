import { waitUntilHydrated } from "@bitcart/qa/e2e"
import { expect, test } from "@playwright/test"

import { PAGE_CATALOG } from "./constants"

const YOUTUBE_POST_PATH = "/bitcartcc-whmcs-plugin-is-out"

test.describe("Blog: Third-party requests", () => {
  for (const { name, path } of PAGE_CATALOG) {
    test(`${name} requests nothing from another origin`, async ({ page, baseURL }) => {
      const { origin } = new URL(baseURL ?? "")
      const foreignRequests: string[] = []

      page.on("request", (request) => {
        const url = new URL(request.url())

        if (url.protocol.startsWith("http") && url.origin !== origin) foreignRequests.push(url.href)
      })

      await page.goto(path)
      await waitUntilHydrated(page)

      expect(foreignRequests).toEqual([])
    })
  }

  test("the YouTube player loads only once the reader presses play", async ({ page }) => {
    //* Keeps the run offline: only the iframe's address is under test.
    await page.route(/youtube/, (route) => route.abort())

    await page.goto(YOUTUBE_POST_PATH)
    await waitUntilHydrated(page)
    await expect(page.locator("iframe")).toHaveCount(0)

    await page.getByRole("button", { name: /^Play video:/ }).click()

    await expect(page.locator("iframe")).toHaveAttribute(
      "src",
      /^https:\/\/www\.youtube-nocookie\.com\/embed\/lUNSbC8NzgQ\?autoplay=1$/,
    )
  })
})
