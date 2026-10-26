import { readdirSync } from "node:fs"
import { resolve } from "node:path"

import {
  CHECKOUT_AMOUNT_BREAKDOWN_TESTID,
  CHECKOUT_AMOUNT_TESTID,
  CHECKOUT_COUNTDOWN_TESTID,
  CHECKOUT_METHOD_HINT_TESTID,
  CHECKOUT_METHOD_SELECTOR_TESTID,
  CHECKOUT_OPEN_WALLET_TESTID,
  CHECKOUT_PAYMENT_ADDRESS_TESTID,
  CHECKOUT_PAYMENT_QR_TESTID,
  CHECKOUT_PREVIEW_CASE_IDS,
  CHECKOUT_PREVIEW_CASES,
  CHECKOUT_RECOMMENDED_FEE_TESTID,
  CHECKOUT_SENDER_ADDRESS_TESTID,
  CHECKOUT_STATUS_TESTID,
  checkoutPreviewCaseQuery,
  type CheckoutPreviewCaseId,
} from "@bitcart/qa"
import {
  expectNoConsoleMessages,
  setupFailureConsoleMessageTracking,
  waitUntilHydrated,
} from "@bitcart/qa/e2e"
import { expect, test, type Page } from "@playwright/test"

import { E2E_DIRNAME } from "./constants"

const TEMPLATE_IDS = readdirSync(resolve(E2E_DIRNAME, "../src/templates"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)

const SCENARIO_AMOUNT = "0.00043210"
const SCENARIO_REMAINDER = "0.00023210"
const SCENARIO_FEE_INCLUSIVE_AMOUNT = "0.00045210"
const SCENARIO_FEE_INCLUSIVE_REMAINDER = "0.00025210"
const SENDER_ADDRESS = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"

const template = (page: Page) => page.locator("[data-checkout-template]")
const byTestId = (page: Page, testId: string) => template(page).getByTestId(testId)

const visibleByTestId = (page: Page, testId: string) =>
  byTestId(page, testId).filter({ visible: true })

const slot = (page: Page, name: string) => template(page).locator(`[data-extension-slot="${name}"]`)

const expectSlots = async (page: Page, names: string[]) => {
  for (const name of ["checkout:header-extra", ...names, "checkout:footer-extra"]) {
    await expect(slot(page, name), `the ${name} slot`).toBeAttached()
  }
}

const chooseFirstMethodIfAsked = async (page: Page) => {
  const amount = byTestId(page, CHECKOUT_AMOUNT_TESTID)
  const selector = byTestId(page, CHECKOUT_METHOD_SELECTOR_TESTID)

  await expect(amount.or(selector).first()).toBeAttached()

  if ((await amount.count()) === 0) {
    await selector.getByRole("option").or(selector.getByRole("button")).first().click()
  }
}

const expectPaymentContent = async (
  page: Page,
  {
    amount = SCENARIO_AMOUNT,
    hasWalletLink = true,
    hasBreakdown = false,
  }: { amount?: string | RegExp; hasWalletLink?: boolean; hasBreakdown?: boolean } = {},
) => {
  await chooseFirstMethodIfAsked(page)

  await expect(byTestId(page, CHECKOUT_AMOUNT_TESTID)).toContainText(amount)
  await expect(byTestId(page, CHECKOUT_AMOUNT_BREAKDOWN_TESTID)).toHaveCount(hasBreakdown ? 1 : 0)

  await expect(byTestId(page, CHECKOUT_COUNTDOWN_TESTID)).toBeAttached()
  await expect(byTestId(page, CHECKOUT_PAYMENT_ADDRESS_TESTID)).toBeAttached()
  await expect(byTestId(page, CHECKOUT_PAYMENT_QR_TESTID)).toBeAttached()
  await expect(byTestId(page, CHECKOUT_RECOMMENDED_FEE_TESTID)).toBeAttached()
  await expect(byTestId(page, CHECKOUT_METHOD_HINT_TESTID)).toBeAttached()

  await expect(visibleByTestId(page, CHECKOUT_OPEN_WALLET_TESTID)).toHaveCount(
    hasWalletLink ? 1 : 0,
  )

  await expectSlots(page, ["checkout:payment-extra"])
}

const expectLightningContent = async (page: Page) => {
  await chooseFirstMethodIfAsked(page)

  await expect(byTestId(page, CHECKOUT_AMOUNT_TESTID)).toContainText(SCENARIO_AMOUNT)
  await expect(byTestId(page, CHECKOUT_PAYMENT_ADDRESS_TESTID)).toBeAttached()
  await expect(byTestId(page, CHECKOUT_PAYMENT_QR_TESTID)).toBeAttached()

  await expect(visibleByTestId(page, CHECKOUT_OPEN_WALLET_TESTID)).toHaveAttribute(
    "href",
    /^lightning:lnbc/,
  )

  await expectSlots(page, ["checkout:payment-extra"])
}

const expectSenderAddressContent = async (page: Page) => {
  const field = template(page).locator('[name="senderAddress"]')
  const selector = byTestId(page, CHECKOUT_METHOD_SELECTOR_TESTID)

  await expect(field.or(selector).first()).toBeAttached()

  if ((await field.count()) === 0) {
    await selector.getByRole("option").or(selector.getByRole("button")).first().click()
  }

  await expect(field).toBeAttached()
  await expect(byTestId(page, CHECKOUT_PAYMENT_ADDRESS_TESTID)).toHaveCount(0)
  await expectSlots(page, ["checkout:address-extra"])

  await field.fill(SENDER_ADDRESS)
  await template(page).locator('button[type="submit"]').click()

  await expect(byTestId(page, CHECKOUT_SENDER_ADDRESS_TESTID)).toHaveText(SENDER_ADDRESS)
  await expect(byTestId(page, CHECKOUT_PAYMENT_ADDRESS_TESTID)).toBeAttached()
  await expect(byTestId(page, CHECKOUT_PAYMENT_QR_TESTID)).toBeAttached()
  await expectSlots(page, ["checkout:payment-extra"])
}

const expectStatusContent = async (page: Page) => {
  await expect(byTestId(page, CHECKOUT_STATUS_TESTID)).toBeVisible()
  await expectSlots(page, ["checkout:status-extra"])
}

const CONTRACT: Record<CheckoutPreviewCaseId, (page: Page) => Promise<void>> = {
  new: (page) => expectPaymentContent(page),
  expiring: (page) => expectPaymentContent(page),
  lightning: expectLightningContent,
  "zero-price": (page) => expectPaymentContent(page, { amount: /any amount/iu }),
  discount: (page) => expectPaymentContent(page, { hasBreakdown: true }),

  "network-fee": (page) =>
    expectPaymentContent(page, { amount: SCENARIO_FEE_INCLUSIVE_AMOUNT, hasBreakdown: true }),

  partial: (page) => expectPaymentContent(page, { amount: SCENARIO_REMAINDER }),

  "partial-split": (page) =>
    expectPaymentContent(page, {
      amount: SCENARIO_FEE_INCLUSIVE_REMAINDER,
      hasBreakdown: true,
    }),

  "partial-split-discount": (page) =>
    expectPaymentContent(page, {
      amount: SCENARIO_FEE_INCLUSIVE_REMAINDER,
      hasBreakdown: true,
    }),

  details: async (page) => {
    for (const field of ["email", "address", "notes"]) {
      await expect(template(page).locator(`[name="${field}"]`), `the ${field} input`).toBeAttached()
    }

    await expectSlots(page, [])

    await template(page).locator('[name="email"]').fill("buyer@example.com")
    await template(page).locator('[name="address"]').fill("Main St 1")
    await template(page).locator('button[type="submit"]').click()

    await expectPaymentContent(page)
  },

  "sender-address": expectSenderAddressContent,
  paid: (page) => expectSlots(page, []),
  unavailable: (page) => expectSlots(page, []),

  complete: expectStatusContent,
  "complete-split": expectStatusContent,
  "complete-lightning": expectStatusContent,
  "complete-discount": expectStatusContent,
  "complete-zero-price": expectStatusContent,
  overpaid: expectStatusContent,
  expired: expectStatusContent,
  "expired-partial": expectStatusContent,
  invalid: expectStatusContent,
  "failed-confirm": expectStatusContent,
  refunded: expectStatusContent,
  "refund-unclaimed": expectStatusContent,
  "refund-pending": expectStatusContent,
  "refund-failed": expectStatusContent,
  unknown: expectStatusContent,
}

test.describe("Checkout: Template contract", () => {
  for (const templateId of TEMPLATE_IDS) {
    for (const id of CHECKOUT_PREVIEW_CASE_IDS) {
      test(`the ${templateId} template shows the required content when ${id}`, async ({ page }) => {
        setupFailureConsoleMessageTracking(page)

        await page.goto(
          `/preview/${templateId}?${checkoutPreviewCaseQuery(CHECKOUT_PREVIEW_CASES[id])}`,
        )

        await waitUntilHydrated(page)
        await expect(template(page)).toBeAttached()

        await CONTRACT[id](page)

        expectNoConsoleMessages(page)
      })
    }

    test(`the ${templateId} template offers no wallet link or copy action on a terminal`, async ({
      page,
    }) => {
      setupFailureConsoleMessageTracking(page)

      await page.goto(`/preview/${templateId}?status=new&environment=terminal`)
      await waitUntilHydrated(page)

      await expectPaymentContent(page, { hasWalletLink: false })
      await expect(template(page).getByRole("button", { name: /^Copy/u })).toHaveCount(0)

      expectNoConsoleMessages(page)
    })
  }
})
