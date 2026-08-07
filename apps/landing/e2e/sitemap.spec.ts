import { sitemapEntryReachabilityTest } from "@bitcart/qa/e2e"
import { test } from "@playwright/test"

test.describe("Landing: Sitemap", () => {
  test("all sitemap entries are accessible", sitemapEntryReachabilityTest)
})
