import { expect, test } from "@playwright/test"

test.describe("Landing: Coins page", () => {
  test("page loads successfully", async ({ page }) => {
    const response = await page.goto("/coins")
    expect(response?.status()).toBe(200)
  })

  test("coins list is rendered with blockchain entries", async ({ page }) => {
    await page.goto("/coins", { waitUntil: "networkidle" })

    await expect(page.getByText("Supported Blockchains")).toBeVisible()
    await expect(page.getByText("Supported Tokens")).toBeVisible()
    await expect(page.getByText("Transaction Fees")).toBeVisible()

    // Bitcoin and Ethereum should always be present as accordion entries
    await expect(page.getByRole("button", { name: /BTC Bitcoin BTC/ })).toBeVisible()
    await expect(page.getByRole("button", { name: /ETH Ethereum ETH/ })).toBeVisible()
  })

  test("search input is present and functional", async ({ page }) => {
    await page.goto("/coins", { waitUntil: "networkidle" })

    const searchInput = page.getByRole("textbox")
    await expect(searchInput).toBeVisible()

    // Search for a specific coin
    await searchInput.fill("Bitcoin")
    await expect(page.getByRole("button", { name: /BTC Bitcoin BTC/ })).toBeVisible()

    // Search for a non-existent coin shows no results
    await searchInput.fill(/* cSpell:ignore */ "xyznonexistent123")
    await expect(page.getByText("No results found")).toBeVisible()

    // Clearing the search shows all coins again
    await page.getByRole("button", { name: "Clear" }).click()
    await expect(page.getByRole("button", { name: /BTC Bitcoin BTC/ })).toBeVisible()
    await expect(page.getByRole("button", { name: /ETH Ethereum ETH/ })).toBeVisible()
  })

  test("search filters coins correctly", async ({ page }) => {
    await page.goto("/coins", { waitUntil: "networkidle" })

    const searchInput = page.getByRole("textbox")

    // Search by token symbol
    await searchInput.fill("USDT")
    await expect(page.getByRole("button", { name: /ETH Ethereum ETH/ })).toBeVisible()

    // Accordion should auto-expand showing matching tokens
    await expect(page.getByText("USDT").first()).toBeVisible()
  })
})
