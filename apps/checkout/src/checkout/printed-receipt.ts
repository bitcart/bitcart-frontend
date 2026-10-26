import { compareAmounts, formatDateTime } from "@bitcart/core/utils"
import type { I18n } from "@lingui/core"
import { msg } from "@lingui/core/macro"

import type { CheckoutAmountFormat } from "./amount-format"
import type {
  CheckoutReceipt,
  CheckoutReceiptPayment,
  CheckoutReceiptRefund,
  CheckoutStatusModel,
  CheckoutStoreSupport,
} from "./model"
import { formatRefundAmount, getReceiptStatusLabel, getRefundStatusLabel } from "./receipt-status"
import type { ReceiptBlock, ReceiptSpec, Span } from "./terminal"

type PrintedReceiptContext = {
  i18n: I18n
  format: CheckoutAmountFormat
  locale: string
  origin: string
}

const SHORT_HASH_EDGE = 8

const shortenHash = (hash: string): string =>
  hash.length > SHORT_HASH_EDGE * 2 + 1
    ? `${hash.slice(0, SHORT_HASH_EDGE)}…${hash.slice(-SHORT_HASH_EDGE)}`
    : hash

type TextBlock = Extract<ReceiptBlock, { kind: "text" }>

const text = (value: string, options: Omit<TextBlock, "kind" | "text"> = {}): TextBlock => ({
  kind: "text",
  text: value,
  ...options,
})

type FieldBlock = Extract<ReceiptBlock, { kind: "field" }>

const field = (
  label: string | Span,
  value: string | Span,
  options: Omit<FieldBlock, "kind" | "label" | "value"> = {},
): FieldBlock => ({ kind: "field", label, value, ...options })

const code = (value: string): Span => ({ text: value, code: true })

const RULE: ReceiptBlock = { kind: "rule" }

const getPaymentBlocks = (
  { name, symbol, lightning, rate, amount, networkCost, transactions }: CheckoutReceiptPayment,
  { i18n, format }: PrintedReceiptContext,
): ReceiptBlock[] => {
  const label = lightning ? i18n.t(msg`Payment hash`) : i18n.t(msg`Transaction`)
  const isSplit = transactions.length > 1

  return [
    RULE,
    field(i18n.t(msg`Payment method`), name),
    field(i18n.t(msg`Amount`), format.crypto(amount, symbol)),
    field(i18n.t(msg`Rate`), format.rate(rate, symbol)),
    ...(networkCost ? [field(i18n.t(msg`Network cost`), format.crypto(networkCost, symbol))] : []),

    ...transactions.flatMap(({ hash, amount: sent }) =>
      isSplit && sent !== null
        ? [
            field(label, format.crypto(sent, symbol)),
            text(shortenHash(hash), { code: true, align: "right" }),
          ]
        : [field(label, code(shortenHash(hash)))],
    ),
  ]
}

const getRefundBlocks = (
  refund: CheckoutReceiptRefund,
  invoiceCurrency: string,
  { i18n, format, locale }: PrintedReceiptContext,
): ReceiptBlock[] => [
  RULE,
  field(i18n.t(msg`Refund`), formatRefundAmount(format, refund, invoiceCurrency)),
  field(i18n.t(msg`Refund status`), getRefundStatusLabel(i18n, refund.status)),
  field(i18n.t(msg`Refund issued`), formatDateTime(refund.createdAt, locale)),

  ...(refund.transaction
    ? [field(i18n.t(msg`Refund transaction`), code(shortenHash(refund.transaction.hash)))]
    : []),
]

const getSupportBlocks = (
  support: CheckoutStoreSupport,
  { i18n }: PrintedReceiptContext,
): ReceiptBlock[] => [
  RULE,
  text(i18n.t(msg`Questions about this payment?`), { style: "small", align: "center" }),

  text(support.kind === "url" ? support.href : support.address, {
    style: "small",
    align: "center",
  }),
]

export const getPrintedReceipt = (
  { store, invoice, status, exception }: CheckoutStatusModel,
  receipt: CheckoutReceipt,
  context: PrintedReceiptContext,
): ReceiptSpec => {
  const { i18n, format, locale, origin } = context
  const { orderId } = invoice
  const { paidAt, amountPaid, discount } = receipt
  const date = formatDateTime(paidAt ?? receipt.createdAt, locale)

  const paid =
    amountPaid && compareAmounts(amountPaid, receipt.total) !== 0 ? format.fiat(amountPaid) : null

  return {
    blocks: [
      text(store.name, { style: "title", bold: true, align: "center" }),

      text(getReceiptStatusLabel(i18n, status, exception), {
        style: "heading",
        bold: true,
        align: "center",
      }),

      RULE,
      field(i18n.t(msg`Invoice`), { ...code(invoice.id), style: "small" }),
      ...(orderId ? [field(i18n.t(msg`Order`), code(orderId))] : []),
      field(paidAt ? i18n.t(msg`Paid on`) : i18n.t(msg`Issued`), date),

      ...(receipt.items.length > 0
        ? [RULE, ...receipt.items.map(({ name, quantity }) => field(name, `×${quantity}`))]
        : []),

      RULE,

      ...(discount
        ? [
            field(i18n.t(msg`Price`), format.fiat(discount.originalPrice)),
            field(i18n.t(msg`Discount`), `${discount.name} −${discount.percent}%`),
          ]
        : []),

      field(
        i18n.t(msg`Total`),
        { text: format.fiat(receipt.total), style: "title" },
        { bold: true },
      ),

      ...(paid ? [field(i18n.t(msg`Amount paid`), paid)] : []),
      ...(receipt.payment ? getPaymentBlocks(receipt.payment, context) : []),
      ...(receipt.refund ? getRefundBlocks(receipt.refund, invoice.currency, context) : []),
      ...(store.support ? getSupportBlocks(store.support, context) : []),
      { kind: "space" },
      { kind: "qr", data: `${origin}/i/${invoice.id}/receipt` },
      text(i18n.t(msg`Scan to view this receipt online`), { style: "small", align: "center" }),
    ],
  }
}
