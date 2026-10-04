import { bitcartInvoices, type bitcartManage, type bitcartStores } from "@bitcart/api-sdk/endpoints"
import type { CustomerUpdateData } from "@bitcart/api-sdk/schemas"
import { formatAmount, getRemainingAmount } from "@bitcart/core/utils"
import type { BasicThemeMode } from "@bitcart/ui-kit/types"

import type { CheckoutUiActions, CheckoutUiState } from "./runtime/control-store"
import type { CheckoutPalette } from "./theme/palette"

//* Store appearance settings not provided by the API yet. Fixtures supply them until then.
export type CheckoutAppearance = {
  palette?: CheckoutPalette
  logos?: Partial<Record<BasicThemeMode, string>>
}

export type CheckoutSource = {
  invoice: bitcartInvoices.Invoice
  store: bitcartStores.Store
  policies: Pick<bitcartManage.Policies, "allow_powered_by_bitcart">
  appearance?: CheckoutAppearance
  submitCustomerDetails: (update: CustomerUpdateData) => Promise<void>
}

export type CheckoutSelectionMode = "preselect" | "explicit"

export type CheckoutModelOptions = {
  selection: CheckoutSelectionMode
}

export type CheckoutDeriveContext = CheckoutModelOptions & {
  mode: BasicThemeMode
}

export type CustomerDetailsField = "email" | "address" | "notes"

export type CheckoutMethod = {
  id: string
  name: string
  symbol: string
  amount: string
  rateStr: string
  lightning: boolean
  chainId: number | null
  hint: string | null
}

export type CheckoutPartialPayment = {
  paid: string
  total: string
}

export type CheckoutPayment = CheckoutMethod & {
  address: string

  //* `null` once a partial payment has arrived: the URI still encodes the full amount.
  paymentUrl: string | null

  recommendedFee: number | null

  //* Set while the invoice is partially paid, when `amount` is the remainder still due.
  partial: CheckoutPartialPayment | null
}

export type CheckoutLogo = {
  url: string
  backdrop: BasicThemeMode | null
}

export type CheckoutBranding = {
  logo: CheckoutLogo | null
  showPoweredBy: boolean
  palette: CheckoutPalette | null
}

export type CheckoutInvoiceSummary = {
  id: string
  price: string
  currency: string
  orderId: string
  redirectUrl: string | null
  timeLeft: number
}

export type CheckoutStoreSummary = {
  name: string
}

type CheckoutModelBase = {
  invoice: CheckoutInvoiceSummary
  store: CheckoutStoreSummary
  branding: CheckoutBranding
  methods: CheckoutMethod[]
  selectMethod: (methodId: string) => void
}

export type CheckoutStatusModel = CheckoutModelBase & {
  phase: "status"
  status: bitcartInvoices.InvoiceTerminalStatus
}

//* The backend never stores `unconfirmed` on an invoice, but it's part of the status enum.
const PAYMENT_DETECTED_STATUSES = ["paid", "unconfirmed", "confirmed"] as const

type PaymentDetectedStatus = (typeof PAYMENT_DETECTED_STATUSES)[number]

const isPaymentDetectedStatus = (
  status: bitcartInvoices.InvoiceStatus,
): status is PaymentDetectedStatus =>
  (PAYMENT_DETECTED_STATUSES as readonly string[]).includes(status)

export type CheckoutConfirmingModel = CheckoutModelBase & {
  phase: "confirming"
  status: PaymentDetectedStatus
  confirmations: { received: number; required: number } | null
}

export type CheckoutUnavailableModel = CheckoutModelBase & {
  phase: "unavailable"
}

export type CustomerDetailsValues = Partial<Record<CustomerDetailsField, string>>

export type CheckoutDetailsModel = CheckoutModelBase & {
  phase: "details"

  details: {
    fields: CustomerDetailsField[]
    submit: (values: CustomerDetailsValues) => Promise<void>
  }
}

export type CheckoutSelectModel = CheckoutModelBase & {
  phase: "select"
  cancelChange?: () => void
}

export type CheckoutPaymentModel = CheckoutModelBase & {
  phase: "payment"
  selectedMethodId: string
  payment: CheckoutPayment

  //* Absent without an alternative method: a single method, or one pinned by a partial payment.
  changeMethod?: () => void
}

export type CheckoutModel =
  | CheckoutStatusModel
  | CheckoutConfirmingModel
  | CheckoutUnavailableModel
  | CheckoutDetailsModel
  | CheckoutSelectModel
  | CheckoutPaymentModel

const getMissingDetailsFields = ({ invoice, store }: CheckoutSource): CustomerDetailsField[] => {
  const { email_required, ask_address } = store.checkout_settings
  const isAddressMissing = ask_address && !invoice.shipping_address

  return [
    ...(email_required && !invoice.buyer_email ? (["email"] as const) : []),
    ...(isAddressMissing ? (["address"] as const) : []),

    //* Optional, asked along with the address; the API ignores notes once an invoice has some.
    ...(isAddressMissing && !invoice.notes ? (["notes"] as const) : []),
  ]
}

const CUSTOMER_DETAILS_UPDATE_KEYS = {
  email: "buyer_email",
  address: "shipping_address",
  notes: "notes",
} as const satisfies Record<CustomerDetailsField, keyof CustomerUpdateData>

const toCustomerDetailsUpdate = (
  fields: CustomerDetailsField[],
  values: CustomerDetailsValues,
): CustomerUpdateData =>
  Object.fromEntries(
    fields.map((field) => [CUSTOMER_DETAILS_UPDATE_KEYS[field], values[field] ?? ""]),
  )

const resolveDefaultMethod = ({
  payments,
  payment_id,
}: bitcartInvoices.Invoice): bitcartInvoices.InvoicePayment | undefined =>
  payments.find(({ id }) => id === payment_id) ?? payments[0]

const toCheckoutMethod = (payment: bitcartInvoices.InvoicePayment): CheckoutMethod => ({
  id: payment.id,
  name: payment.name,
  symbol: payment.symbol,
  amount: payment.amount,
  rateStr: payment.rate_str,
  lightning: payment.lightning,
  chainId: payment.chain_id ?? null,
  hint: payment.hint,
})

const toCheckoutPayment = (
  payment: bitcartInvoices.InvoicePayment,
  { show_recommended_fee }: bitcartStores.StoreCheckoutSettings,
  partiallyPaidAmount: number | null,
): CheckoutPayment => {
  const recommendedFee =
    show_recommended_fee && payment.recommended_fee > 0 ? payment.recommended_fee : null

  const payable = {
    ...toCheckoutMethod(payment),
    address: payment.payment_address,
    recommendedFee,
  }

  if (partiallyPaidAmount === null) {
    return { ...payable, paymentUrl: payment.payment_url, partial: null }
  } else
    return {
      ...payable,
      amount: getRemainingAmount(payment.amount, partiallyPaidAmount, payment.divisibility),
      paymentUrl: null,

      partial: {
        paid: formatAmount(partiallyPaidAmount, payment.divisibility),
        total: payment.amount,
      },
    }
}

//* The backend credits partial payments only to the method that first received funds.
const getPartiallyPaidMethod = ({
  exception_status,
  payment_id,
  payments,
}: bitcartInvoices.Invoice): bitcartInvoices.InvoicePayment | undefined =>
  exception_status === "paid_partial" ? payments.find(({ id }) => id === payment_id) : undefined

const summarizeInvoice = (invoice: bitcartInvoices.Invoice): CheckoutInvoiceSummary => ({
  id: invoice.id,
  price: invoice.price,
  currency: invoice.currency,
  orderId: invoice.order_id,
  redirectUrl: invoice.redirect_url || null,
  timeLeft: invoice.time_left,
})

const OTHER_MODE = { light: "dark", dark: "light" } as const

const resolveLogo = (
  { store, appearance }: CheckoutSource,
  mode: BasicThemeMode,
): CheckoutLogo | null => {
  const { custom_logo_link, use_dark_mode } = store.checkout_settings

  const logos = appearance?.logos ?? {
    [use_dark_mode ? "dark" : "light"]: custom_logo_link || undefined,
  }

  const url = logos[mode]
  const fallbackUrl = logos[OTHER_MODE[mode]]

  if (url) {
    return { url, backdrop: null }
  } else if (fallbackUrl) {
    return { url: fallbackUrl, backdrop: OTHER_MODE[mode] }
  } else return null
}

const resolveBranding = (source: CheckoutSource, mode: BasicThemeMode): CheckoutBranding => ({
  logo: resolveLogo(source, mode),
  showPoweredBy: source.policies.allow_powered_by_bitcart,
  palette: source.appearance?.palette ?? null,
})

export const deriveCheckoutModel = (
  source: CheckoutSource,
  { chosenMethodId, isChangingMethod }: CheckoutUiState,
  actions: CheckoutUiActions,
  { selection, mode }: CheckoutDeriveContext,
): CheckoutModel => {
  const { invoice } = source
  const partiallyPaidMethod = getPartiallyPaidMethod(invoice)

  const methods = (partiallyPaidMethod ? [partiallyPaidMethod] : invoice.payments).map(
    toCheckoutMethod,
  )

  const hasAlternativeMethods = methods.length > 1
  const missingDetailsFields = getMissingDetailsFields(source)

  const chosenPayment = invoice.payments.find(
    ({ id }) => id === (chosenMethodId ?? invoice.payment_id),
  )

  const selectedPayment = partiallyPaidMethod ?? chosenPayment ?? resolveDefaultMethod(invoice)

  const isAwaitingExplicitChoice =
    selection === "explicit" && !chosenPayment && hasAlternativeMethods

  const base: CheckoutModelBase = {
    invoice: summarizeInvoice(invoice),
    store: { name: source.store.name },
    branding: resolveBranding(source, mode),
    methods,
    selectMethod: actions.selectMethod,
  }

  if (bitcartInvoices.isTerminalStatus(invoice.status)) {
    return { ...base, phase: "status", status: invoice.status }
  } else if (isPaymentDetectedStatus(invoice.status)) {
    const paidMethod = invoice.payments.find(({ id }) => id === invoice.payment_id)

    return {
      ...base,
      phase: "confirming",
      status: invoice.status,

      confirmations: paidMethod
        ? {
            received: paidMethod.confirmations,
            required: source.store.checkout_settings.transaction_speed,
          }
        : null,
    }
  } else if (!selectedPayment) {
    return { ...base, phase: "unavailable" }
  } else if (missingDetailsFields.length > 0) {
    return {
      ...base,
      phase: "details",

      details: {
        fields: missingDetailsFields,

        submit: (values) =>
          source.submitCustomerDetails(toCustomerDetailsUpdate(missingDetailsFields, values)),
      },
    }
  } else if (isAwaitingExplicitChoice) {
    return { ...base, phase: "select" }
  } else if (isChangingMethod && hasAlternativeMethods) {
    return { ...base, phase: "select", cancelChange: actions.cancelChange }
  } else
    return {
      ...base,
      phase: "payment",
      selectedMethodId: selectedPayment.id,
      payment: toCheckoutPayment(
        selectedPayment,
        source.store.checkout_settings,
        partiallyPaidMethod ? invoice.sent_amount : null,
      ),

      changeMethod: hasAlternativeMethods ? actions.changeMethod : undefined,
    }
}
