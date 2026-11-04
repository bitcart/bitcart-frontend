import { createLatinFontPreloadTest, createNonLatinFontOnDemandTest } from "@bitcart/qa/e2e"
import { test } from "@playwright/test"

test.describe("Blog: Fonts", () => {
  test("preloads the Latin font alone", createLatinFontPreloadTest())
  test("fetches a non-Latin font only once text needs it", createNonLatinFontOnDemandTest())
})
