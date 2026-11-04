import { createLatinFontPreloadTest, createNonLatinFontOnDemandTest } from "@bitcart/qa/e2e"
import { test } from "@playwright/test"

import { DEFAULT_TEST_ROUTE } from "./constants"

test.describe("Checkout: Fonts", () => {
  test("preloads the Latin font alone", createLatinFontPreloadTest({ route: DEFAULT_TEST_ROUTE }))

  test(
    "fetches a non-Latin font only once text needs it",
    createNonLatinFontOnDemandTest({ route: DEFAULT_TEST_ROUTE }),
  )
})
