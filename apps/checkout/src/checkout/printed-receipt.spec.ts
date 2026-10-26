import type { bitcartInvoices } from "@bitcart/client-sdk/endpoints"
import { i18n } from "@lingui/core"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import type { CheckoutAmountFormat } from "./amount-format"
import { makeInvoice, makeModel, makePayment, makeRefund, makeStore } from "./fixtures"
import type { CheckoutSource } from "./model"
import { getPrintedReceipt } from "./printed-receipt"
import type { ReceiptBlock, Span } from "./terminal"

const TX_HASH = "4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b"

const format: CheckoutAmountFormat = {
  fiat: (amount) => `$${amount}`,
  crypto: (amount, symbol) => `${amount} ${symbol.toUpperCase()}`,
  number: (amount) => amount,
  rate: (rate, symbol) => `1 ${symbol.toUpperCase()} = $${rate}`,
}

const print = (
  overrides: Partial<bitcartInvoices.Invoice> = {},
  source: Partial<CheckoutSource> = {},
) => {
  const model = makeModel({
    ...source,

    invoice: makeInvoice({
      id: "invoice-42",
      status: "complete",
      paid_date: "2026-09-24T10:06:00+00:00",
      payment_id: "method-btc",
      sent_amount: "0.00150000",
      sent_price: "100.00",
      transactions: [{ tx_hash: TX_HASH, amount: "0.00150000" }],
      ...overrides,
    }),
  })

  if (model.phase !== "status" || !model.receipt) {
    throw new Error("Expected a receipt")
  } else
    return getPrintedReceipt(model, model.receipt, {
      i18n,
      format,
      locale: "en-US",
      origin: "http://192.0.2.10:3000",
    })
}

const spanText = (half: string | Span) => (typeof half === "string" ? half : half.text)

const fields = (overrides?: Partial<bitcartInvoices.Invoice>, source?: Partial<CheckoutSource>) =>
  print(overrides, source).blocks.flatMap((block) =>
    block.kind === "field" ? [[spanText(block.label), spanText(block.value)]] : [],
  )

const hasField = (printed: string[][], label: string) => printed.some(([name]) => name === label)

const blocksFrom = (blocks: ReceiptBlock[], label: string, count: number) => {
  const start = blocks.findIndex((block) => block.kind === "field" && block.label === label)

  return blocks.slice(start, start + count)
}

const heading = (text: string): ReceiptBlock => ({
  kind: "text",
  text,
  style: "heading",
  bold: true,
  align: "center",
})

beforeEach(() => {
  vi.stubEnv("TZ", "UTC")
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("getPrintedReceipt", () => {
  test("prints a paid invoice", () => {
    expect(
      print({
        order_id: "order-7",
        products: ["product-1"],
        product_names: { "product-1": "Socks" },
        product_quantities: { "product-1": 2 },
      }),
    ).toStrictEqual({
      blocks: [
        { kind: "text", text: "Example Store", style: "title", bold: true, align: "center" },
        heading("Paid"),
        { kind: "rule" },

        {
          kind: "field",
          label: "Invoice",
          value: { text: "invoice-42", code: true, style: "small" },
        },

        { kind: "field", label: "Order", value: { text: "order-7", code: true } },
        { kind: "field", label: "Paid on", value: "Sep 24, 2026, 10:06 AM" },
        { kind: "rule" },
        { kind: "field", label: "Socks", value: "×2" },
        { kind: "rule" },
        { kind: "field", label: "Total", value: { text: "$100", style: "title" }, bold: true },
        { kind: "rule" },
        { kind: "field", label: "Payment method", value: "BTC" },
        { kind: "field", label: "Amount", value: "0.00150000 BTC" },
        { kind: "field", label: "Rate", value: "1 BTC = $66666.67" },
        { kind: "field", label: "Transaction", value: { text: "4a5e1e4b…fdeda33b", code: true } },
        { kind: "space" },
        { kind: "qr", data: "http://192.0.2.10:3000/i/invoice-42/receipt" },
        { kind: "text", text: "Scan to view this receipt online", style: "small", align: "center" },
      ],
    })
  })

  test("labels a Lightning payment's hash as a payment hash", () => {
    expect(fields({ payments: [makePayment({ lightning: true })] })).toContainEqual([
      "Payment hash",
      "4a5e1e4b…fdeda33b",
    ])
  })

  test("prints each transaction of a split payment with its amount, when known", () => {
    const { blocks } = print({
      transactions: [
        { tx_hash: TX_HASH, amount: "0.00100000" },
        { tx_hash: "short-hash", amount: "0.00050000" },
        { tx_hash: "unknown-amount", amount: null },
      ],
    })

    expect(blocksFrom(blocks, "Transaction", 5)).toStrictEqual([
      { kind: "field", label: "Transaction", value: "0.00100000 BTC" },
      { kind: "text", text: "4a5e1e4b…fdeda33b", code: true, align: "right" },
      { kind: "field", label: "Transaction", value: "0.00050000 BTC" },
      { kind: "text", text: "short-hash", code: true, align: "right" },
      { kind: "field", label: "Transaction", value: { text: "unknown-amount", code: true } },
    ])
  })

  test("prints the issue date of an invoice that has no paid date", () => {
    expect(fields({ paid_date: null })).toContainEqual(["Issued", "Sep 24, 2026, 10:00 AM"])
  })

  test("prints what was paid when it differs from the total", () => {
    expect(
      fields({ exception_status: "paid_over", sent_amount: "0.00200000", sent_price: "133.33" }),
    ).toEqual(
      expect.arrayContaining([
        ["Total", "$100"],
        ["Amount paid", "$133.33"],
        ["Amount", "0.00200000 BTC"],
      ]),
    )
  })

  test("leaves out what was paid when it matches the total", () => {
    expect(hasField(fields(), "Amount paid")).toBe(false)
  })

  test("prints a zero-price invoice's received amount as its total, once", () => {
    const printed = fields({
      price: "0.00",
      payments: [makePayment({ amount: "0.00000000" })],
      exception_status: "paid_over",
      sent_price: "280.00",
    })

    expect(printed).toContainEqual(["Total", "$280.00"])
    expect(hasField(printed, "Amount paid")).toBe(false)
  })

  test("leaves out the order and items when the invoice has none", () => {
    const { blocks } = print()

    expect(blocks.some((block) => block.kind === "field" && block.label === "Order")).toBe(false)
    expect(fields().some(([, value]) => value.startsWith("×"))).toBe(false)
  })

  test.each([
    [
      "an underpaid invoice that expired",
      { status: "expired", exception_status: "paid_partial", sent_price: "33.33" },
      "Expired",
    ],
    [
      "a payment that failed to confirm",
      { status: "invalid", exception_status: "failed_confirm" },
      "Failed to confirm",
    ],
    ["a refunded invoice", { status: "refunded" }, "Refunded"],
  ] as const)("heads the receipt of %s with its status", (_case, overrides, status) => {
    expect(print(overrides).blocks.slice(0, 3)).toStrictEqual([
      { kind: "text", text: "Example Store", style: "title", bold: true, align: "center" },
      heading(status),
      { kind: "rule" },
    ])
  })

  test("prints the original price and the discount above the total", () => {
    const { blocks } = print({
      price: "100.00",
      effective_price: "90.00",
      sent_price: "90.00",

      payments: [
        makePayment({
          effective_price: "90.00",
          applied_discount: { name: "Autumn sale", percent: 10 },
        }),
      ],
    })

    expect(blocksFrom(blocks, "Price", 3)).toStrictEqual([
      { kind: "field", label: "Price", value: "$100.00" },
      { kind: "field", label: "Discount", value: "Autumn sale −10%" },
      { kind: "field", label: "Total", value: { text: "$90.00", style: "title" }, bold: true },
    ])
  })

  test("prints the network cost of the paid method", () => {
    expect(fields({ payments: [makePayment({ network_fee: "0.00002000" })] })).toContainEqual([
      "Network cost",
      "0.00002000 BTC",
    ])
  })

  test("prints the refund and its transaction", () => {
    const { blocks } = print(
      { status: "refunded", refund_id: "refund-1" },
      { refund: makeRefund({ amount: "40.00", payout_status: "sent", tx_hash: TX_HASH }) },
    )

    expect(blocksFrom(blocks, "Refund", 4)).toStrictEqual([
      { kind: "field", label: "Refund", value: "$40.00" },
      { kind: "field", label: "Refund status", value: "Sent" },
      { kind: "field", label: "Refund issued", value: "Sep 25, 2026, 9:00 AM" },
      {
        kind: "field",
        label: "Refund transaction",
        value: { text: "4a5e1e4b…fdeda33b", code: true },
      },
    ])
  })

  test("prints a refund paid in another currency in that currency", () => {
    expect(
      fields(
        { status: "refunded", refund_id: "refund-1" },
        { refund: makeRefund({ amount: "0.00060000", currency: "btc" }) },
      ),
    ).toContainEqual(["Refund", "0.00060000 BTC"])
  })

  test.each([
    [{ support_email: "help@example.com" }, "help@example.com"],
    [{ support_url: "https://help.example.com/" }, "https://help.example.com/"],
  ])("prints where to ask about the payment (%o)", (settings, contact) => {
    const { blocks } = print({}, { store: makeStore(settings) })
    const qr = blocks.findIndex((block) => block.kind === "qr")

    expect(blocks.slice(qr - 4, qr)).toStrictEqual([
      { kind: "rule" },
      { kind: "text", text: "Questions about this payment?", style: "small", align: "center" },
      { kind: "text", text: contact, style: "small", align: "center" },
      { kind: "space" },
    ])
  })

  test("prints only identifiers in the code face", () => {
    const { blocks } = print({
      order_id: "order-7",
      exception_status: "paid_over",
      sent_price: "133.33",

      transactions: [
        { tx_hash: TX_HASH, amount: "0.00100000" },
        { tx_hash: "short-hash", amount: "0.00050000" },
      ],
    })

    const codeTexts = blocks.flatMap((block) => {
      if (block.kind === "field") {
        return [block.label, block.value]
          .filter((half) => block.code ?? (typeof half !== "string" && half.code))
          .map(spanText)
      } else if (block.kind === "text" && block.code) {
        return [block.text]
      } else return []
    })

    expect(codeTexts).toStrictEqual(["invoice-42", "order-7", "4a5e1e4b…fdeda33b", "short-hash"])
  })

  test("labels every line without a colon, leaving the separation to the shell", () => {
    expect(
      fields({
        order_id: "order-7",
        exception_status: "paid_over",
        sent_price: "133.33",
        payments: [makePayment({ lightning: true })],
      }).map(([label]) => label),
    ).toStrictEqual([
      "Invoice",
      "Order",
      "Paid on",
      "Total",
      "Amount paid",
      "Payment method",
      "Amount",
      "Rate",
      "Payment hash",
    ])
  })
})
