import { expect, test } from "@playwright/test"

const PATHS = ["/i/e2e-invoice", "/preview/flow"]

test.describe("Checkout: Search engines", () => {
  for (const path of PATHS) {
    test(`the served ${path} document asks search engines not to index it`, async ({ request }) => {
      const response = await request.get(path)
      const html = await response.text()

      expect(html).toMatch(/<meta[^>]*name="robots"[^>]*content="noindex, nofollow"/)
    })
  }
})
