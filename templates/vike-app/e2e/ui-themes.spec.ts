import { themeCycleToggleTest } from "@bitcart/qa/e2e"
import { test } from "@playwright/test"

test.describe("Vike Example: UI themes", () => {
  test("theme toggle cycles through themes", themeCycleToggleTest)
})
