import type { bitcartInvoices, bitcartManage, bitcartStores } from "@bitcart/client-sdk/endpoints"
import { publicStoreCheckoutSettingsDefault } from "@bitcart/client-sdk/schemas"

import {
  deriveCheckoutModel,
  type CheckoutDeriveContext,
  type CheckoutModel,
  type CheckoutSource,
} from "./model"
import { createCheckoutControl } from "./runtime/control-store"

export const makePayment = (
  overrides: Partial<bitcartInvoices.InvoicePayment> = {},
): bitcartInvoices.InvoicePayment => ({
  id: "method-btc",
  created: "2026-09-24T10:00:00+00:00",
  recommended_fee: "0",
  wallet: null,
  symbol: "btc",
  lightning: false,
  contract: "",
  label: "",
  hint: null,
  currency: "btc",
  amount: "0.00150000",
  payment_address: "bc1qexampleaddress",
  payment_url: "bitcoin:bc1qexampleaddress?amount=0.0015",
  rate: "66666.67",
  name: "BTC",
  divisibility: 8,
  confirmations: 0,
  discount: null,
  applied_discount: null,
  effective_price: "100",
  network_fee: "0.00000000",
  subtotal: overrides.amount ?? "0.00150000",
  due: overrides.amount ?? "0.00150000",
  due_price: "100",
  user_address: null,
  node_id: null,
  ...overrides,
})

export const makeInvoice = (
  overrides: Partial<bitcartInvoices.Invoice> = {},
): bitcartInvoices.Invoice => ({
  created: "2026-09-24T10:00:00+00:00",
  updated: null,
  metadata: {},
  order_id: "",
  notification_url: "",
  redirect_url: "",
  buyer_email: "buyer@example.com",
  shipping_address: "",
  notes: "",
  id: "invoice-1",
  user_id: "user-1",
  store_id: "store-1",
  time_left: 900,
  expiration_seconds: 900,
  product_names: {},
  product_quantities: {},
  payments: [makePayment()],
  paid_date: null,
  payment_id: null,
  refund_id: null,
  paid_currency: null,
  discount: null,
  price: "100",
  status: "pending",
  exception_status: "none",
  currency: "USD",
  tx_hashes: [],
  transactions: [],
  promocode: "",
  products: [],
  sent_amount: "0",
  sent_price: "0",
  effective_price: overrides.price ?? "100",
  expiration: 15,
  payment_methods: [],
  ...overrides,
})

export const makeRefund = (
  overrides: Partial<bitcartInvoices.InvoiceRefund> = {},
): bitcartInvoices.InvoiceRefund => ({
  created: "2026-09-25T09:00:00+00:00",
  updated: null,
  metadata: {},
  currency: "USD",
  id: "refund-1",
  user_id: "user-1",
  wallet_id: "wallet-1",
  invoice_id: "invoice-1",
  destination: null,
  wallet_currency: null,
  payout_id: null,
  payout_status: null,
  tx_hash: null,
  amount: "100.00",
  ...overrides,
})

export const makeStore = (
  checkoutSettings: Partial<bitcartStores.StoreCheckoutSettings> = {},
): bitcartStores.Store => ({
  created: "2026-09-24T10:00:00+00:00",
  updated: null,
  metadata: {},
  name: "Example Store",
  default_currency: "USD",
  checkout_settings: {
    ...publicStoreCheckoutSettingsDefault,
    email_required: false,
    ...checkoutSettings,
  },
  theme_settings: { store_theme_url: "", checkout_theme_url: "" },
  id: "store-1",
  user_id: "user-1",
  currency_data: {},
})

export const makePolicies = (
  overrides: Partial<bitcartManage.Policies> = {},
): CheckoutSource["policies"] => ({
  allow_powered_by_bitcart: false,
  explorer_urls: { btc: "https://explorer.example.com/tx/{}" },
  allow_eth_plugin_info: true,
  admin_url: "https://admin.example.com",
  ...overrides,
})

export const makeSource = (overrides: Partial<CheckoutSource> = {}): CheckoutSource => ({
  invoice: makeInvoice(),
  store: makeStore(),
  policies: makePolicies(),
  submitCustomerDetails: () => Promise.resolve(),
  submitSenderAddress: () => Promise.resolve("accepted"),
  ...overrides,
})

export const makeModel = (
  source: Partial<CheckoutSource> = {},
  context: Partial<CheckoutDeriveContext> = {},
): CheckoutModel => {
  const { state, actions } = createCheckoutControl()

  return deriveCheckoutModel(makeSource(source), state, actions, {
    selection: "preselect",
    mode: "light",
    terminal: false,
    openedOnComplete: false,
    ...context,
  })
}
