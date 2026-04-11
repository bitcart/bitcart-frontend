import { createThemePersistenceTest, themeCycleToggleTest } from "@bitcart/qa/e2e"
import { test } from "@playwright/test"

import { PAGE_CATALOG } from "./constants"

test.describe("Landing: UI themes", () => {
  test("theme toggle cycles through themes", themeCycleToggleTest)

  test(
    "theme persists across navigation",
    createThemePersistenceTest({ pageCatalog: PAGE_CATALOG }),
  )
})
