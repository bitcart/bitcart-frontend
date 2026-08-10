import {
  createLocaleSwitchTest,
  createPseudoLocalizationRenderTest,
  testLocaleSelectorVisibilityWithDefaultLocale,
} from "@bitcart/qa/e2e"
import { test } from "@playwright/test"

import { PAGE_CATALOG } from "./constants"

test.describe("Vike Example: Internationalization", () => {
  test(
    "locale selector is visible and shows English by default",
    testLocaleSelectorVisibilityWithDefaultLocale,
  )

  test(
    "selecting French in the locale selector changes page locale",
    createLocaleSwitchTest({ localeId: "fr" }),
  )

  test(
    "pseudo locale renders translated text on all pages",
    createPseudoLocalizationRenderTest({ pageCatalog: PAGE_CATALOG }),
  )
})
