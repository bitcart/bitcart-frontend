import { DisplayInvoice, Policy, PublicStore } from "@bitcart/client-sdk/schemas"
import {
  CHECKOUT_PREVIEW_CASES,
  CHECKOUT_PREVIEW_METHODS,
  CHECKOUT_PREVIEW_RECEIVED,
  CHECKOUT_PREVIEW_STATUSES,
  type CheckoutPreviewAxes,
  type CheckoutPreviewCase,
} from "@bitcart/qa"
import { describe, expect, test } from "vitest"

import { getPreviewAxisOptions, normalizePreviewAxes } from "./axes"
import { buildPreviewScenario } from "./build"

const selected = (axes: CheckoutPreviewAxes) => {
  const { invoice, store } = buildPreviewScenario(axes)

  return { invoice, store, payment: invoice.payments[0] }
}

const sum = (amounts: string[]) =>
  amounts.reduce((total, amount) => total + Math.round(Number(amount) * 1e8), 0)

const allCombinations = (): CheckoutPreviewAxes[] => {
  const combinations = CHECKOUT_PREVIEW_STATUSES.flatMap((status) =>
    CHECKOUT_PREVIEW_METHODS.flatMap((method) =>
      [false, true].flatMap((anyAmount) =>
        [false, true].flatMap((discount) =>
          [false, true].flatMap((fee) =>
            CHECKOUT_PREVIEW_RECEIVED.map((received) =>
              JSON.stringify(
                normalizePreviewAxes({ status, method, anyAmount, discount, fee, received }),
              ),
            ),
          ),
        ),
      ),
    ),
  )

  return [...new Set(combinations)].map((axes) => JSON.parse(axes) as CheckoutPreviewAxes)
}

describe("buildPreviewScenario", () => {
  test("prices a new invoice in bitcoin at the preview rate", () => {
    const { invoice, payment } = selected({ status: "new" })

    expect(invoice).toMatchObject({ status: "pending", price: "25.00", effective_price: "25.00" })

    expect(payment).toMatchObject({
      amount: "0.00043210",
      due: "0.00043210",
      due_price: "25.00",
      payment_url: "bitcoin:bc1qpreview7h3t2kq9x8v4m6d5c0n2r7a8s3w9e4f6g?amount=0.0004321",
    })
  })

  test("leaves the rest of a partial payment due", () => {
    const { invoice, payment } = selected({ status: "new", received: "partial" })

    expect(invoice).toMatchObject({
      exception_status: "paid_partial",
      payment_id: payment.id,
      sent_amount: "0.00020000",
      sent_price: "11.57",
      transactions: [{ amount: "0.00020000" }],
    })

    expect(payment).toMatchObject({ due: "0.00023210", due_price: "13.43" })
  })

  test("splits a partial payment into two transfers of the same total", () => {
    const { invoice, payment } = selected({ status: "new", received: "partial-2" })

    expect(invoice.transactions.map(({ amount }) => amount)).toStrictEqual([
      "0.00010000",
      "0.00010000",
    ])

    expect(payment.due).toBe("0.00023210")
  })

  test("adds a network cost to the order amount", () => {
    const { store, payment } = selected({ status: "new", fee: true })

    expect(payment).toMatchObject({
      subtotal: "0.00043210",
      network_fee: "0.00002000",
      amount: "0.00045210",
      due_price: "26.16",
    })

    expect(store.checkout_settings.include_network_fee).toBe(true)
  })

  test("discounts the price, keeping the original on the invoice", () => {
    const { invoice, payment } = selected({ status: "new", discount: true })

    expect(invoice).toMatchObject({ price: "27.78", effective_price: "25.00" })
    expect(payment.applied_discount).toStrictEqual({ name: "Autumn sale", percent: 10 })
  })

  test("pays a complete invoice in two transfers adding up to the total", () => {
    const { invoice } = selected({ status: "complete", received: "full-2" })

    expect(invoice).toMatchObject({ status: "complete", sent_amount: "0.00043210" })

    expect(invoice.transactions.map(({ amount }) => amount)).toStrictEqual([
      "0.00020000",
      "0.00023210",
    ])
  })

  test("marks an overpayment", () => {
    const { invoice } = selected({ status: "complete", received: "over" })

    expect(invoice).toMatchObject({
      exception_status: "paid_over",
      sent_amount: "0.00050000",
      sent_price: "28.93",
    })
  })

  test("names methods the way the backend does", () => {
    expect(
      buildPreviewScenario({ status: "new" }).invoice.payments.map(({ name }) => name),
    ).toEqual(["BTC", "LTC", "ETH"])

    expect(
      buildPreviewScenario({ status: "new", method: "lightning" }).invoice.payments.map(
        ({ name }) => name,
      ),
    ).toEqual(["BTC (⚡)", "BTC"])
  })

  test("shows a merchant's custom label as the method's name", () => {
    expect(selected({ status: "new", customLabel: true }).payment).toMatchObject({
      label: "Main store wallet",
      name: "Main store wallet",
    })
  })

  test("numbers two unlabelled wallets of the same coin", () => {
    const { invoice } = buildPreviewScenario({ status: "new", duplicateCoin: true })

    expect(invoice.payments.map(({ id, name }) => [id, name])).toEqual([
      ["preview-btc", "BTC (1)"],
      ["preview-btc-2", "BTC (2)"],
      ["preview-ltc", "LTC"],
      ["preview-eth", "ETH"],
    ])
  })

  test("asks EVM and TRON methods for a sender address on request", () => {
    const wallets = (senderAddress: boolean) =>
      Object.fromEntries(
        buildPreviewScenario({
          status: "new",
          manyMethods: true,
          senderAddress,
        }).invoice.payments.map(({ id, wallet }) => [id, wallet]),
      )

    expect(wallets(true)).toMatchObject({
      "preview-btc": null,
      "preview-eth": { network: "eip155:1", sender_address_required: true },
      "preview-usdt-bep20": { network: "eip155:56", sender_address_required: true },
      "preview-trx": { network: "tron:728126428", sender_address_required: true },
    })

    expect(wallets(false)["preview-eth"]).toMatchObject({ sender_address_required: false })
  })

  test("offers the backend's wallet app links on EVM and TRON methods", () => {
    const links = Object.fromEntries(
      buildPreviewScenario({ status: "new", manyMethods: true }).invoice.payments.map(
        ({ id, wallet }) => [id, wallet?.links.map((link) => link.id) ?? null],
      ),
    )

    expect(links).toMatchObject({
      "preview-btc": null,
      "preview-eth": ["metamask", "trust"],
      "preview-usdc-polygon": ["metamask", "trust"],
      "preview-trx": ["trust", "tronlink"],
    })
  })

  test("offers a long list of methods, tokens on their chains included", () => {
    const { invoice } = buildPreviewScenario({ status: "new", manyMethods: true })

    expect(invoice.payments.length).toBeGreaterThan(10)

    expect(invoice.payments.find(({ id }) => id === "preview-usdc-polygon")).toMatchObject({
      contract: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
      chain_id: 137,
    })
  })

  test("prices a long amount from the same rate", () => {
    const { invoice, payment } = selected({ status: "new", longPrice: true })

    expect(invoice.price).toBe("1234567.89")
    expect(payment).toMatchObject({ amount: "21.33826313", due_price: "1234567.89" })
  })

  test.each<[string, CheckoutPreviewAxes, Partial<CheckoutPreviewAxes>]>([
    ["a complete invoice to its full payment", { status: "complete" }, { received: "full" }],

    [
      "a Lightning invoice to a single payment",
      { status: "new", method: "lightning", received: "partial" },
      { received: "none" },
    ],

    [
      "an any-amount invoice to no discount or network cost",
      { status: "new", anyAmount: true, discount: true, fee: true },
      { discount: false, fee: false },
    ],
  ])("normalizes %s", (_case, axes, expected) => {
    expect(normalizePreviewAxes(axes)).toMatchObject(expected)
  })

  test("offers only what the status and method allow", () => {
    expect(getPreviewAxisOptions({ status: "new", method: "lightning" })).toMatchObject({
      received: ["none"],
      fee: false,
      recommendedFee: false,
    })

    expect(getPreviewAxisOptions({ status: "complete" }).received).toStrictEqual([
      "full",
      "full-2",
      "over",
    ])
  })

  test.each(Object.entries(CHECKOUT_PREVIEW_CASES))(
    "keeps the %s case as named, every axis fitting the others",
    (_id, previewCase: CheckoutPreviewCase) => {
      const { expiration: _expiration, ...axes } = previewCase

      expect(normalizePreviewAxes(axes)).toMatchObject(axes)
    },
  )

  describe.each(allCombinations().map((axes) => [JSON.stringify(axes), axes] as const))(
    "%s",
    (_name, axes) => {
      const { invoice, store, policies } = buildPreviewScenario(axes)

      test("is data the API could return", () => {
        expect(DisplayInvoice.safeParse(invoice).error).toBeUndefined()
        expect(PublicStore.safeParse(store).error).toBeUndefined()
        expect(Policy.safeParse(policies).error).toBeUndefined()
      })

      test("adds its transfers up to what was sent", () => {
        expect(sum(invoice.transactions.map(({ amount }) => amount ?? "0"))).toBe(
          sum([invoice.sent_amount]),
        )
      })
    },
  )
})
