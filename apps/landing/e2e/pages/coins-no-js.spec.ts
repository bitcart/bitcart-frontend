import { expect, test } from "@playwright/test"

test.describe("Landing: Coins page (no JavaScript)", () => {
  test.use({ javaScriptEnabled: false })

  test("coin names are server-rendered without JavaScript", async ({ page }) => {
    await page.goto("/coins")

    // React streaming SSR sends the resolved page content inside a hidden container
    // (<div hidden id="S:0">) that client JS would swap into the visible DOM.
    // Without JS the swap never happens, so elements are attached but not visible.
    // Using toBeAttached() proves the server fetched and rendered the coin data.
    await expect(page.getByText("Supported Blockchains")).toBeAttached()
    await expect(page.getByText("Supported Tokens")).toBeAttached()

    // Bitcoin and Ethereum should always be present as accordion entries
    await expect(
      page.getByRole("button", { name: /BTC Bitcoin BTC/, includeHidden: true }),
    ).toBeAttached()

    await expect(
      page.getByRole("button", { name: /ETH Ethereum ETH/, includeHidden: true }),
    ).toBeAttached()
  })
})
