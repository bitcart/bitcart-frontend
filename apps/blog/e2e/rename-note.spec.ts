import { waitUntilHydrated } from "@bitcart/qa/e2e"
import { expect, test } from "@playwright/test"

import { SAMPLE_POST } from "./constants"

test.describe("Blog: Rename note", () => {
  test("a post from before the rename explains the old name", async ({ page }) => {
    await page.goto(SAMPLE_POST.path)
    await waitUntilHydrated(page)

    await expect(page.getByRole("note")).toHaveText(
      "Bitcart was called BitcartCC until August 14, 2023, so this post uses the old name.",
    )
  })
})
