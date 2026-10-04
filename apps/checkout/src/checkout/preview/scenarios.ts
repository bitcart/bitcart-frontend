import type { CheckoutPreviewStatus } from "@bitcart/qa"

import { makeInvoice, makePayment, makePolicies, makeStore } from "../fixtures"
import type { CheckoutSource } from "../model"

export type CheckoutPreviewScenario = Pick<CheckoutSource, "invoice" | "store" | "policies">

const btc = makePayment({
  id: "preview-btc",
  name: "BTC",
  symbol: "btc",
  currency: "btc",
  amount: "0.00043210",
  payment_address: "bc1qpreview7h3t2kq9x8v4m6d5c0n2r7a8s3w9e4f6g",
  payment_url: "bitcoin:bc1qpreview7h3t2kq9x8v4m6d5c0n2r7a8s3w9e4f6g?amount=0.0004321",
  rate: "57857.00",
  rate_str: "57,857.00 USD",
  recommended_fee: 4,
})

const ltc = makePayment({
  id: "preview-ltc",
  name: "LTC",
  symbol: "ltc",
  currency: "ltc",
  amount: "0.31250000",
  payment_address: "ltc1qpreview4d8f2k7m3n9p5q1r6s0t8u2v4w7x3y5z",
  payment_url: "litecoin:ltc1qpreview4d8f2k7m3n9p5q1r6s0t8u2v4w7x3y5z?amount=0.3125",
  rate: "80.00",
  rate_str: "80.00 USD",
})

const eth = makePayment({
  id: "preview-eth",
  name: "ETH",
  symbol: "eth",
  currency: "eth",
  amount: "0.00821000",
  divisibility: 18,
  chain_id: 1,
  payment_address: "0x5a3b9c2d7e1f4a6b8c0d2e4f6a8b0c2d4e6f8a0b",
  payment_url: "ethereum:0x5a3b9c2d7e1f4a6b8c0d2e4f6a8b0c2d4e6f8a0b?value=8210000000000000",
  rate: "3045.00",
  rate_str: "3,045.00 USD",
})

const store = makeStore({ show_recommended_fee: true, transaction_speed: 2 })
const policies = makePolicies({ allow_powered_by_bitcart: true })

const invoice = (overrides: Parameters<typeof makeInvoice>[0]) =>
  makeInvoice({
    id: "preview-invoice",
    price: "25.00",
    currency: "USD",
    payments: [btc, ltc, eth],
    ...overrides,
  })

const paidWithBtc = (status: "paid" | "complete" | "refunded") =>
  invoice({ status, payment_id: btc.id, paid_currency: "btc", sent_amount: 0.0004321 })

export const CHECKOUT_PREVIEW_SCENARIOS = {
  new: { invoice: invoice({}), store, policies },

  details: {
    invoice: invoice({ buyer_email: "", shipping_address: "", notes: "" }),
    store: makeStore({ show_recommended_fee: true, email_required: true, ask_address: true }),
    policies,
  },

  partial: {
    invoice: invoice({ exception_status: "paid_partial", payment_id: btc.id, sent_amount: 0.0002 }),
    store,
    policies,
  },

  paid: {
    invoice: invoice({
      status: "paid",
      payment_id: btc.id,
      payments: [{ ...btc, confirmations: 1 }, ltc, eth],
    }),

    store,
    policies,
  },

  complete: { invoice: paidWithBtc("complete"), store, policies },
  expired: { invoice: invoice({ status: "expired", time_left: 0 }), store, policies },
  invalid: { invoice: invoice({ status: "invalid" }), store, policies },
  refunded: { invoice: paidWithBtc("refunded"), store, policies },
  unavailable: { invoice: invoice({ payments: [] }), store, policies },
} satisfies Record<CheckoutPreviewStatus, CheckoutPreviewScenario>
