import { createScrollResetOnNavigationTest } from "@bitcart/qa/e2e"
import { test } from "@playwright/test"

test.describe("Directory: page transition scroll", () => {
  test(
    "cross-page navigation without a hash scrolls to the top",
    createScrollResetOnNavigationTest({ fromPath: "/submit", toLinkHref: "/" }),
  )

  //* The app has no in-app hash-anchor navigation (no hash nav links,
  //* and no matching anchor beyond the initial viewport), so the scroll-to-hash
  //* variant (`createScrollToHashOnNavigationTest`) is intentionally not wired up here.
})
