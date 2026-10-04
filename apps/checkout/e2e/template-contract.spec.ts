import { readdirSync } from "node:fs"
import { resolve } from "node:path"

import {
  CHECKOUT_AMOUNT_TESTID,
  CHECKOUT_COUNTDOWN_TESTID,
  CHECKOUT_METHOD_SELECTOR_TESTID,
  CHECKOUT_OPEN_WALLET_TESTID,
  CHECKOUT_PAYMENT_ADDRESS_TESTID,
  CHECKOUT_PAYMENT_QR_TESTID,
  CHECKOUT_PREVIEW_STATUSES,
  CHECKOUT_RECOMMENDED_FEE_TESTID,
  CHECKOUT_STATUS_TESTID,
  type CheckoutPreviewStatus,
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

const template = (page: Page) => page.locator("[data-checkout-template]")
const byTestId = (page: Page, testId: string) => template(page).getByTestId(testId)
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

const expectPaymentContent = async (page: Page, { isPartial }: { isPartial: boolean }) => {
  await chooseFirstMethodIfAsked(page)

  await expect(byTestId(page, CHECKOUT_AMOUNT_TESTID)).toContainText(
    isPartial ? SCENARIO_REMAINDER : SCENARIO_AMOUNT,
  )

  await expect(byTestId(page, CHECKOUT_COUNTDOWN_TESTID)).toBeAttached()
  await expect(byTestId(page, CHECKOUT_PAYMENT_ADDRESS_TESTID)).toBeAttached()
  await expect(byTestId(page, CHECKOUT_PAYMENT_QR_TESTID)).toBeAttached()
  await expect(byTestId(page, CHECKOUT_RECOMMENDED_FEE_TESTID)).toBeAttached()

  await expect(byTestId(page, CHECKOUT_OPEN_WALLET_TESTID)).toHaveCount(isPartial ? 0 : 1)

  await expectSlots(page, ["checkout:payment-extra"])
}

const expectStatusContent = async (page: Page) => {
  await expect(byTestId(page, CHECKOUT_STATUS_TESTID)).toBeVisible()
  await expectSlots(page, ["checkout:status-extra"])
}

const CONTRACT: Record<CheckoutPreviewStatus, (page: Page) => Promise<void>> = {
  new: (page) => expectPaymentContent(page, { isPartial: false }),
  partial: (page) => expectPaymentContent(page, { isPartial: true }),

  details: async (page) => {
    for (const field of ["email", "address", "notes"]) {
      await expect(template(page).locator(`[name="${field}"]`), `the ${field} input`).toBeAttached()
    }

    await expectSlots(page, [])

    await template(page).locator('[name="email"]').fill("buyer@example.com")
    await template(page).locator('[name="address"]').fill("Main St 1")
    await template(page).locator('button[type="submit"]').click()

    await expectPaymentContent(page, { isPartial: false })
  },

  paid: (page) => expectSlots(page, []),
  unavailable: (page) => expectSlots(page, []),

  complete: expectStatusContent,
  expired: expectStatusContent,
  invalid: expectStatusContent,
  refunded: expectStatusContent,
}

test.describe("Checkout: Template contract", () => {
  for (const templateId of TEMPLATE_IDS) {
    for (const status of CHECKOUT_PREVIEW_STATUSES) {
      test(`the ${templateId} template shows the required content when ${status}`, async ({
        page,
      }) => {
        setupFailureConsoleMessageTracking(page)

        await page.goto(`/preview/${templateId}?status=${status}`)
        await waitUntilHydrated(page)
        await expect(template(page)).toBeAttached()

        await CONTRACT[status](page)

        expectNoConsoleMessages(page)
      })
    }
  }
})
