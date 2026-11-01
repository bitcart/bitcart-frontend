import {
  createForeignThemeRecoveryTest,
  createThemeCycleToggleTest,
  createThemePersistenceTest,
} from "@bitcart/qa/e2e"
import { test } from "@playwright/test"

import { DEFAULT_TEST_ROUTE, PAGE_CATALOG } from "./constants"

test.describe("Checkout: UI themes", () => {
  test(
    "theme toggle cycles through themes",
    createThemeCycleToggleTest({ route: DEFAULT_TEST_ROUTE }),
  )

  test(
    "theme persists across navigation",
    createThemePersistenceTest({ pageCatalog: PAGE_CATALOG, startRoute: DEFAULT_TEST_ROUTE }),
  )

  test(
    "theme recovers from a foreign persisted value",
    createForeignThemeRecoveryTest({ route: DEFAULT_TEST_ROUTE }),
  )
})
