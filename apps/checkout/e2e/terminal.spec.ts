import {
  CHECKOUT_RECEIPT_TESTID,
  CHECKOUT_STATUS_TESTID,
  type CheckoutPreviewEnvironment,
  type CheckoutPreviewView,
} from "@bitcart/qa"
import {
  expectNoConsoleMessages,
  setupFailureConsoleMessageTracking,
  waitUntilHydrated,
} from "@bitcart/qa/e2e"
import { expect, test, type Page } from "@playwright/test"

const openPreview = async (
  page: Page,
  view: CheckoutPreviewView,
  environment?: CheckoutPreviewEnvironment,
) => {
  const environmentParam = environment ? `&environment=${environment}` : ""

  await page.goto(`/preview/flow?status=complete&view=${view}${environmentParam}`)
  await waitUntilHydrated(page)
}

const openStatus = async (page: Page, environment?: CheckoutPreviewEnvironment) => {
  await openPreview(page, "checkout", environment)

  return page.getByTestId(CHECKOUT_STATUS_TESTID)
}

const openReceipt = async (page: Page, environment?: CheckoutPreviewEnvironment) => {
  await openPreview(page, "receipt", environment)

  return page.getByTestId(CHECKOUT_RECEIPT_TESTID)
}

test.describe("Checkout: Terminal", () => {
  test("returns to the store and opens the receipt in a browser", async ({ page }) => {
    const status = await openStatus(page)

    await expect(status.getByRole("button", { name: "Return to Store" })).toBeVisible()

    await status.getByRole("button", { name: "View Receipt" }).click()

    await expect(page).toHaveURL(/view=receipt/)
    await expect(page.getByTestId(CHECKOUT_RECEIPT_TESTID)).toBeVisible()
  })

  test("prints the receipt and keeps the buyer on the terminal", async ({ page }) => {
    setupFailureConsoleMessageTracking(page)

    const status = await openStatus(page, "terminal")
    const printButton = status.getByRole("button", { name: /Print/ })

    await expect(status.getByRole("button", { name: "Return to Store" })).toHaveCount(0)
    await expect(status.getByRole("button", { name: "View Receipt" })).toHaveCount(0)

    await printButton.click()

    await expect(printButton).toHaveText("Printing…")
    await expect(printButton).toBeDisabled()
    await expect(printButton).toHaveText("Print again")
    await expect(printButton).toBeEnabled()

    expectNoConsoleMessages(page)
  })

  test("tells the merchant how to fix a failed print", async ({ page }) => {
    const status = await openStatus(page, "terminal-out-of-paper")

    await status.getByRole("button", { name: "Print receipt" }).click()

    const alert = status.getByRole("alert")

    await expect(alert).toContainText("Out of paper")
    await expect(alert).toContainText("Load a new roll, then print again.")
    await expect(alert).not.toContainText("fake")
  })

  test("offers the receipt on a terminal without a printer", async ({ page }) => {
    const status = await openStatus(page, "terminal-no-printer")

    await expect(status.getByRole("button", { name: "View Receipt" })).toBeVisible()
    await expect(status.getByRole("button", { name: "Return to Store" })).toHaveCount(0)
  })

  test("prints the receipt page on the terminal's printer", async ({ page }) => {
    const receipt = await openReceipt(page, "terminal")

    await receipt.getByRole("button", { name: "Print receipt" }).click()

    await expect(receipt.getByRole("button", { name: "Print again" })).toBeEnabled()
  })

  test("offers no print on the receipt page of a terminal without a printer", async ({ page }) => {
    const receipt = await openReceipt(page, "terminal-no-printer")

    await expect(receipt.getByText("Paid", { exact: true })).toBeVisible()
    await expect(receipt.getByRole("button", { name: /Print/ })).toHaveCount(0)
  })
})
