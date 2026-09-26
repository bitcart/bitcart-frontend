import type { bitcartInvoices, bitcartManage, bitcartStores } from "@bitcart/api-sdk/endpoints"
import { publicStoreCheckoutSettingsDefault } from "@bitcart/api-sdk/schemas"

import type { CheckoutSource } from "../model"

export const makePayment = (
  overrides: Partial<bitcartInvoices.InvoicePayment> = {},
): bitcartInvoices.InvoicePayment => ({
  id: "method-btc",
  created: "2026-09-24T10:00:00+00:00",
  recommended_fee: 0,
  symbol: "btc",
  lightning: false,
  contract: null,
  label: "",
  hint: null,
  currency: "btc",
  amount: "0.00150000",
  payment_address: "bc1qexampleaddress",
  payment_url: "bitcoin:bc1qexampleaddress?amount=0.0015",
  rate: "66666.67",
  rate_str: "66,666.67 USD",
  name: "BTC",
  divisibility: 8,
  confirmations: 0,
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
  promocode: "",
  products: [],
  sent_amount: 0,
  expiration: 15,
  payment_methods: [],
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
): Pick<bitcartManage.Policies, "allow_powered_by_bitcart"> => ({
  allow_powered_by_bitcart: false,
  ...overrides,
})

export const makeSource = (overrides: Partial<CheckoutSource> = {}): CheckoutSource => ({
  invoice: makeInvoice(),
  store: makeStore(),
  policies: makePolicies(),
  submitCustomerDetails: () => Promise.resolve(),
  ...overrides,
})
