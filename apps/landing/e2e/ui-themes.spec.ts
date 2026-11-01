import {
  createForeignThemeRecoveryTest,
  createThemeCycleToggleTest,
  createThemePersistenceTest,
} from "@bitcart/qa/e2e"
import { test } from "@playwright/test"

import { PAGE_CATALOG } from "./constants"

test.describe("Landing: UI themes", () => {
  test("theme toggle cycles through themes", createThemeCycleToggleTest())

  test(
    "theme persists across navigation",
    createThemePersistenceTest({ pageCatalog: PAGE_CATALOG }),
  )

  test("theme recovers from a foreign persisted value", createForeignThemeRecoveryTest())
})
