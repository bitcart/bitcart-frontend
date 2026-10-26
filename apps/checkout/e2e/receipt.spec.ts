import {
  CHECKOUT_PREVIEW_CASE_IDS,
  CHECKOUT_PREVIEW_CASES,
  CHECKOUT_RECEIPT_TESTID,
  checkoutPreviewCaseQuery,
  type CheckoutPreviewCaseId,
} from "@bitcart/qa"
import {
  expectNoConsoleMessages,
  setupFailureConsoleMessageTracking,
  waitUntilHydrated,
} from "@bitcart/qa/e2e"
import { expect, test } from "@playwright/test"

const RECEIPT_CONTENT: Record<CheckoutPreviewCaseId, string[] | null> = {
  new: null,
  expiring: null,
  lightning: null,
  "zero-price": null,
  discount: null,
  "network-fee": null,
  details: null,
  "sender-address": null,
  partial: null,
  "partial-split": null,
  "partial-split-discount": null,
  paid: null,
  complete: ["Paid", "Merino wool socks", "Transaction"],
  "complete-split": ["0.00020000 BTC", "0.00023210 BTC"],
  "complete-lightning": ["Payment hash"],
  "complete-discount": ["Autumn sale", "Network cost"],
  "complete-zero-price": ["243.00", "0.00420000 BTC"],
  overpaid: ["28.93", "0.00050000 BTC"],
  expired: null,
  "expired-partial": ["Expired", "11.57"],
  invalid: null,
  "failed-confirm": ["Failed to confirm"],
  refunded: ["Refunded", "Refund transaction"],
  "refund-unclaimed": ["Paid", "Awaiting your address"],
  "refund-pending": ["Paid", "Pending"],
  "refund-failed": ["Paid", "Not sent"],
  unknown: null,
  unavailable: null,
}

test.describe("Checkout: Receipt", () => {
  for (const id of CHECKOUT_PREVIEW_CASE_IDS) {
    const content = RECEIPT_CONTENT[id]

    test(`${content ? "shows" : "has no"} a receipt when ${id}`, async ({ page }) => {
      setupFailureConsoleMessageTracking(page)

      await page.goto(
        `/preview/flow?${checkoutPreviewCaseQuery(CHECKOUT_PREVIEW_CASES[id])}&view=receipt`,
      )

      await waitUntilHydrated(page)

      const receipt = page.getByTestId(CHECKOUT_RECEIPT_TESTID)

      await expect(receipt).toHaveCount(content ? 1 : 0)
      await expect(page.getByText("This scenario has no receipt.")).toHaveCount(content ? 0 : 1)

      for (const text of content ?? []) {
        await expect(receipt.getByText(text).first(), text).toBeVisible()
      }

      expectNoConsoleMessages(page)
    })
  }

  test("prints in black, without the print button", async ({ page }) => {
    await page.goto("/preview/flow?status=complete&view=receipt")
    await waitUntilHydrated(page)

    const receipt = page.getByTestId(CHECKOUT_RECEIPT_TESTID)
    const printButton = receipt.getByRole("button", { name: "Print receipt" })

    await expect(printButton).toBeVisible()

    await page.emulateMedia({ media: "print", colorScheme: "dark" })

    await expect(printButton).toBeHidden()
    await expect(receipt.getByText("Receipt", { exact: true })).toHaveCSS("color", "oklab(0 0 0)")
  })
})
