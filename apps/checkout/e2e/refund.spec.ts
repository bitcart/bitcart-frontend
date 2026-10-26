import { CHECKOUT_REFUND_TESTID } from "@bitcart/qa"
import {
  expectNoConsoleMessages,
  setupFailureConsoleMessageTracking,
  waitUntilHydrated,
} from "@bitcart/qa/e2e"
import { expect, test, type BrowserContext } from "@playwright/test"

import { makeInvoice, makePayment, makePolicies, makeRefund, makeStore } from "#/checkout/fixtures"

const REFUND_ID = "e2e-refund"
const INVOICE_ID = "e2e-refunded-invoice"
const ADDRESS = "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
}

type SubmitResponse = { status: number; json: unknown }

const mockRefundApi = async (
  context: BrowserContext,
  { refund = makeRefund({ id: REFUND_ID, invoice_id: INVOICE_ID, amount: "40.00" }) } = {},
) => {
  const payment = makePayment()

  const api = {
    refund: refund as ReturnType<typeof makeRefund> | null,
    submissions: [] as unknown[],
    submitResponse: null as SubmitResponse | null,
  }

  const invoice = makeInvoice({
    id: INVOICE_ID,
    status: "complete",
    payments: [payment],
    payment_id: payment.id,
    refund_id: REFUND_ID,
  })

  const serve = (pattern: RegExp, respond: (body: unknown) => SubmitResponse) =>
    context.route(pattern, async (route) => {
      if (route.request().method() === "OPTIONS") {
        await route.fulfill({ status: 204, headers: CORS_HEADERS })
      } else {
        const { status, json } = respond(route.request().postDataJSON())

        await route.fulfill({ status, json, headers: CORS_HEADERS })
      }
    })

  await serve(new RegExp(`/invoices/refunds/${REFUND_ID}(?:\\?.*)?$`, "u"), () =>
    api.refund ? { status: 200, json: api.refund } : { status: 404, json: { detail: "Not found" } },
  )

  await serve(new RegExp(`/invoices/refunds/${REFUND_ID}/submit$`, "u"), (body) => {
    api.submissions.push(body)

    return (
      api.submitResponse ?? {
        status: 200,
        json: {
          ...api.refund,
          payout_id: "payout-1",
          payout_status: "pending",
          destination: ADDRESS,
        },
      }
    )
  })

  await serve(new RegExp(`/invoices/${INVOICE_ID}(?:\\?.*)?$`, "u"), () => ({
    status: 200,
    json: invoice,
  }))

  await serve(/\/stores\/store-1(?:\?.*)?$/u, () => ({ status: 200, json: makeStore() }))
  await serve(/\/manage\/policies(?:\?.*)?$/u, () => ({ status: 200, json: makePolicies() }))

  return api
}

test.describe("Checkout: Refund", () => {
  test("claims a refund after reviewing the address", async ({ page, context }) => {
    setupFailureConsoleMessageTracking(page)

    const api = await mockRefundApi(context)

    await page.goto(`/refunds/${REFUND_ID}`)
    await waitUntilHydrated(page)

    const refund = page.getByTestId(CHECKOUT_REFUND_TESTID)

    await expect(refund.getByRole("heading", { name: "Refund from Example Store" })).toBeVisible()
    await expect(refund.getByText("$40.00")).toBeVisible()

    await refund.getByRole("textbox", { name: /Your BTC address/u }).fill(ADDRESS)
    await refund.getByRole("button", { name: "Continue" }).click()
    await refund.getByRole("button", { name: "Submit refund" }).click()

    await expect(refund.getByRole("heading", { name: "Refund requested" })).toBeVisible()
    expect(api.submissions).toStrictEqual([{ destination: ADDRESS }])

    expectNoConsoleMessages(page)
  })

  test("returns a rejected address to its field", async ({ page, context }) => {
    const api = await mockRefundApi(context)

    api.submitResponse = { status: 422, json: { detail: "Invalid destination address" } }

    await page.goto(`/refunds/${REFUND_ID}`)
    await waitUntilHydrated(page)

    const refund = page.getByTestId(CHECKOUT_REFUND_TESTID)

    await refund.getByRole("textbox", { name: /Your BTC address/u }).fill("not-an-address")
    await refund.getByRole("button", { name: "Continue" }).click()
    await refund.getByRole("button", { name: "Submit refund" }).click()

    await expect(
      refund.getByText("This address can't receive this refund. Check it's a BTC address."),
    ).toBeVisible()

    await expect(refund.getByRole("textbox", { name: /Your BTC address/u })).toHaveValue(
      "not-an-address",
    )
  })

  test("explains a refund that does not exist", async ({ page, context }) => {
    const api = await mockRefundApi(context)

    api.refund = null

    await page.goto(`/refunds/${REFUND_ID}`)
    await waitUntilHydrated(page)

    //* The app retries a failed query three times, backing off for about 7 seconds in all.
    await expect(page.getByText("Refund not found")).toBeVisible({ timeout: 15_000 })
  })

  test("explains a refund whose invoice was deleted", async ({ page, context }) => {
    await mockRefundApi(context, { refund: makeRefund({ id: REFUND_ID, invoice_id: null }) })

    await page.goto(`/refunds/${REFUND_ID}`)
    await waitUntilHydrated(page)

    await expect(page.getByText("Refund unavailable")).toBeVisible()
  })
})
