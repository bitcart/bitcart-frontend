import type { HttpHref } from "@bitcart/core/navigation"

export type InvoiceStatus = "pending" | "paid" | "confirmed" | "complete" | "expired" | "invalid"

export type InvoicePayment = {
  currency: string
  amount: string
  payment_address: string
  payment_url: string
  rate: string
  rate_str: string
  name: string
  recommended_fee: number
  already_paid: string
  due: string
}

export type Invoice = {
  id: string
  price: string
  currency: string
  status: InvoiceStatus
  expiration: number
  time_left: number
  store_id: string
  payments: InvoicePayment[]

  //* Empty when the store has no post-payment redirect configured.
  redirect_url: HttpHref | ""
}

export type StoreCheckoutSettings = {
  show_recommended_fee: boolean
  use_dark_mode: boolean
  email_required: boolean
}

export type Store = {
  id: string
  name: string
  checkout_settings: StoreCheckoutSettings
}

export type InvoiceWsMessage = {
  status: InvoiceStatus
  paid_currency?: string
  tx_hashes?: string[]
  sent_amount?: string
}
