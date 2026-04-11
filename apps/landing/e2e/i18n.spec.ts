import {
  createLocalePersistenceTest,
  createLocaleSwitchTest,
  createPseudoLocalizationRenderTest,
  testLocaleSelectorVisibilityWithDefaultLocale,
} from "@bitcart/qa/e2e"
import { test } from "@playwright/test"

import { PAGE_CATALOG } from "./constants"

test.describe("Landing: Internationalization", () => {
  test(
    "locale selector is visible and shows English by default",
    testLocaleSelectorVisibilityWithDefaultLocale,
  )

  test(
    "selecting French in the locale selector changes page locale",
    createLocaleSwitchTest({ localeId: "fr" }),
  )

  test(
    "selected locale persists across page navigation",
    createLocalePersistenceTest({ localeId: "fr", pageCatalog: PAGE_CATALOG }),
  )

  test(
    "pseudo locale renders translated text on all pages",
    createPseudoLocalizationRenderTest({ pageCatalog: PAGE_CATALOG }),
  )
})
