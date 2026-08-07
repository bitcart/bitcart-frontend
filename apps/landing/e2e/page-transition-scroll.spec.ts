import {
  createScrollResetOnNavigationTest,
  createScrollToHashOnNavigationTest,
} from "@bitcart/qa/e2e"
import { test } from "@playwright/test"

test.describe("Landing: page transition scroll", () => {
  test(
    "cross-page navigation without a hash scrolls to the top",
    createScrollResetOnNavigationTest({ fromPath: "/", toLinkHref: "/coins" }),
  )

  test(
    "cross-page navigation with a hash scrolls to the anchor",
    createScrollToHashOnNavigationTest({ fromPath: "/coins", toLinkHref: "/#features" }),
  )
})
