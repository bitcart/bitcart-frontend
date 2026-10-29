import {
  bitcartInvoices,
  type bitcartManage,
  type bitcartStores,
} from "@bitcart/client-sdk/endpoints"
import type { CustomerUpdateData } from "@bitcart/client-sdk/schemas"
import { isHttpHref, type HttpHref, type MailtoHref } from "@bitcart/core/navigation"
import { compareAmounts } from "@bitcart/core/utils"
import type { BasicThemeMode } from "@bitcart/ui-kit/types"

import type { CheckoutUiActions, CheckoutUiState } from "./runtime/control-store"
import type { CheckoutPalette } from "./theme/palette"

//* Store appearance settings not provided by the API yet. Fixtures supply them until then.
export type CheckoutAppearance = {
  palette?: CheckoutPalette
  logos?: Partial<Record<BasicThemeMode, string>>
  icons?: Partial<Record<BasicThemeMode, string>>
  useLogoInsteadOfIcon?: boolean
}

export type CheckoutSource = {
  invoice: bitcartInvoices.Invoice
  store: bitcartStores.Store
  policies: Pick<
    bitcartManage.Policies,
    "allow_powered_by_bitcart" | "explorer_urls" | "allow_eth_plugin_info" | "admin_url"
  >
  refund?: bitcartInvoices.InvoiceRefund
  appearance?: CheckoutAppearance
  submitCustomerDetails: (update: CustomerUpdateData) => Promise<void>
  submitSenderAddress: (methodId: string, address: string) => Promise<CheckoutSenderAddressOutcome>
}

export type CheckoutSenderAddressOutcome = "accepted" | "rejected"

export type CheckoutSelectionMode = "preselect" | "explicit"

export type CheckoutModelOptions = {
  selection: CheckoutSelectionMode
}

export type CheckoutEnvironment = {
  terminal: boolean
}

export type CheckoutDeriveContext = CheckoutModelOptions &
  CheckoutEnvironment & {
    mode: BasicThemeMode
    openedOnComplete: boolean
  }

export type CustomerDetailsField = "email" | "address" | "notes"

export type CheckoutWalletLink = {
  id: string
  name: string
  href: string
}

export type CheckoutMethod = {
  id: string
  name: string
  symbol: string
  amount: string
  rate: string
  lightning: boolean
  chainId: number | null
  network: string | null
  contract: string | null
  label: string | null
  hint: string | null
  walletLinks: CheckoutWalletLink[]
}

export type CheckoutPartialTransfer = {
  hash: string
  amount: string
}

export type CheckoutPartialPayment = {
  paid: string
  total: string
  remainingPrice: string
  received: CheckoutPartialTransfer[]
}

export type CheckoutDiscount = {
  name: string
  percent: number
  originalPrice: string
}

export type CheckoutAmountBreakdown = {
  orderAmount: string
  price: string
  discount: CheckoutDiscount | null
  networkCost: string | null
}

export type CheckoutPayment = CheckoutMethod & {
  address: string
  paymentUrl: string
  qrValue: string
  nodeId: string | null
  senderAddress: string | null
  recommendedFee: string | null
  breakdown: CheckoutAmountBreakdown | null
  partial: CheckoutPartialPayment | null
  getTransactionUrl: (hash: string) => HttpHref | null
}

export type CheckoutLogo = {
  url: string
  backdrop: BasicThemeMode | null
}

export type CheckoutBrand =
  | { kind: "logo"; logo: CheckoutLogo; showsName: boolean }
  | { kind: "icon"; icon: CheckoutLogo; showsName: true }
  | { kind: "bitcart"; showsName: false }

export type CheckoutBranding = {
  brand: CheckoutBrand
  showPoweredBy: boolean
  palette: CheckoutPalette | null
}

export type CheckoutInvoiceSummary = {
  id: string
  price: string
  effectivePrice: string
  currency: string
  orderId: string
  redirectUrl: HttpHref | null
  isAnyAmount: boolean
  timeLeft: number
  expirationSeconds: number
  expiresAt: string
}

export type CheckoutStoreSupport =
  | { kind: "url"; href: HttpHref }
  | { kind: "email"; address: string; href: MailtoHref }

export type CheckoutStoreSummary = {
  name: string
  support: CheckoutStoreSupport | null
}

type CheckoutModelBase = {
  environment: CheckoutEnvironment
  invoice: CheckoutInvoiceSummary
  store: CheckoutStoreSummary
  branding: CheckoutBranding
  methods: CheckoutMethod[]
  selectMethod: (methodId: string) => void
}

//* `unknown` is a status this checkout doesn't recognise yet, so it can't offer payment for it.
export type CheckoutFinalStatus = bitcartInvoices.InvoiceTerminalStatus | "unknown"

export type CheckoutStatusException =
  | { kind: "failedConfirm" }
  | { kind: "expiredPartiallyPaid"; paid: string; total: string; symbol: string }
  | { kind: "overpaid"; paid: string; total: string; symbol: string }

export type CheckoutReceivedAmount = {
  amount: string
  symbol: string
  price: string
}

export type CheckoutReceiptItem = {
  id: string
  name: string
  quantity: number
}

export type CheckoutReceiptTransaction = {
  hash: string

  //* `null` when an invoice is marked complete with several transaction ids but no amounts.
  amount: string | null
  explorerUrl: HttpHref | null
}

export type CheckoutReceiptPayment = {
  name: string
  symbol: string
  lightning: boolean
  rate: string
  amount: string
  networkCost: string | null
  transactions: CheckoutReceiptTransaction[]
}

export type CheckoutReceiptRefundStatus = "unclaimed" | "pending" | "sent" | "failed"

export type CheckoutReceiptRefund = {
  id: string
  amount: string
  currency: string
  createdAt: string
  status: CheckoutReceiptRefundStatus
  transaction: Omit<CheckoutReceiptTransaction, "amount"> | null
}

export type CheckoutReceipt = {
  createdAt: string
  paidAt: string | null
  items: CheckoutReceiptItem[]
  total: string
  discount: CheckoutDiscount | null
  amountPaid: string | null
  payment: CheckoutReceiptPayment | null
  refund: CheckoutReceiptRefund | null
}

export type CheckoutStatusModel = CheckoutModelBase & {
  phase: "status"
  status: CheckoutFinalStatus
  exception: CheckoutStatusException | null
  received: CheckoutReceivedAmount | null
  receipt: CheckoutReceipt | null
  isCompletedLive: boolean
  cancelRedirect?: () => void
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

export type CheckoutEthPluginOffer = {
  buyUrl: HttpHref | null
  isShown: boolean
  show: () => void
  hide: () => void
}

export type CheckoutAddressModel = CheckoutModelBase & {
  phase: "address"
  selectedMethodId: string
  method: CheckoutMethod
  submitAddress: (address: string) => Promise<CheckoutSenderAddressOutcome>
  ethPluginOffer?: CheckoutEthPluginOffer
  changeMethod?: () => void
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
  | CheckoutAddressModel
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

export const CUSTOMER_DETAILS_UPDATE_KEYS = {
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

const UNSAFE_LINK_PROTOCOLS = new Set(["javascript:", "data:", "vbscript:", "file:", "blob:"])

const isSafeWalletHref = (href: string): boolean => {
  try {
    return !UNSAFE_LINK_PROTOCOLS.has(new URL(href).protocol)
  } catch {
    return false
  }
}

const toCheckoutMethod = (payment: bitcartInvoices.InvoicePayment): CheckoutMethod => ({
  id: payment.id,
  name: payment.name,
  symbol: payment.symbol,
  amount: payment.amount,
  rate: payment.rate,
  lightning: payment.lightning,
  chainId: payment.chain_id ?? null,
  network: payment.wallet?.network ?? null,
  contract: payment.contract?.trim() || null,
  label: payment.label.trim() || null,
  hint: payment.hint?.trim() || null,
  walletLinks: (payment.wallet?.links ?? []).flatMap(({ id, name, url }) =>
    isSafeWalletHref(url) ? [{ id, name, href: url }] : [],
  ),
})

const LIGHTNING_URI_PREFIX = "lightning:"

const toLightningUri = (invoice: string): string =>
  invoice.toLowerCase().startsWith(LIGHTNING_URI_PREFIX)
    ? invoice
    : `${LIGHTNING_URI_PREFIX}${invoice}`

const isAwaitingSenderAddress = ({
  wallet,
  user_address,
}: bitcartInvoices.InvoicePayment): boolean =>
  Boolean(wallet?.sender_address_required) && !user_address

const ETH_PLUGIN_ID = "ZIDVfTVxDWQLKyhYiqifyNkhcvfufUKm"

const getEthPluginBuyUrl = (adminUrl: string): HttpHref | null => {
  const url = `${adminUrl.replace(/\/+$/u, "")}/plugins?plugin_id=${ETH_PLUGIN_ID}&action=buy`

  return isHttpHref(url) ? url : null
}

const isAnyAmountInvoice = ({ price }: bitcartInvoices.Invoice): boolean =>
  compareAmounts(price, "0") === 0

const getAmountBreakdown = (
  { subtotal, effective_price, applied_discount, network_fee }: bitcartInvoices.InvoicePayment,
  price: string,
): CheckoutAmountBreakdown => ({
  orderAmount: subtotal,
  price: effective_price,

  discount:
    applied_discount && compareAmounts(effective_price, price) < 0
      ? { ...applied_discount, originalPrice: price }
      : null,

  networkCost: compareAmounts(network_fee, "0") > 0 ? network_fee : null,
})

const getExplorerUrl = (template: string | undefined, hash: string): HttpHref | null => {
  const url = template?.replaceAll("{}", hash)

  return url && isHttpHref(url) ? url : null
}

const toCheckoutPayment = (
  payment: bitcartInvoices.InvoicePayment,
  invoice: bitcartInvoices.Invoice,
  { show_recommended_fee }: bitcartStores.StoreCheckoutSettings,
  explorerUrls: Record<string, string>,
  isPartiallyPaid: boolean,
): CheckoutPayment => {
  const recommendedFee =
    show_recommended_fee && compareAmounts(payment.recommended_fee, "0") > 0
      ? payment.recommended_fee
      : null

  const payable = {
    ...toCheckoutMethod(payment),
    address: payment.payment_address,
    paymentUrl: payment.payment_url,
    qrValue: payment.payment_url,
    nodeId: payment.node_id,
    senderAddress: payment.wallet?.sender_address_required ? payment.user_address : null,
    recommendedFee,
    breakdown: isAnyAmountInvoice(invoice) ? null : getAmountBreakdown(payment, invoice.price),
    getTransactionUrl: (hash: string) => getExplorerUrl(explorerUrls[payment.currency], hash),
  }

  if (payment.lightning) {
    const uri = toLightningUri(payment.payment_url)

    //* BOLT11 is case-insensitive, and an all-uppercase QR code fits in the denser alphanumeric mode.
    return { ...payable, paymentUrl: uri, qrValue: uri.toUpperCase(), partial: null }
  } else if (!isPartiallyPaid) {
    return { ...payable, partial: null }
  } else
    return {
      ...payable,
      amount: payment.due,

      partial: {
        paid: invoice.sent_amount,
        total: payment.amount,
        remainingPrice: payment.due_price,
        received: getReceivedTransfers(invoice),
      },
    }
}

const getReceivedTransfers = ({
  transactions,
}: bitcartInvoices.Invoice): CheckoutPartialTransfer[] => {
  const transfers = transactions.flatMap(({ tx_hash, amount }) =>
    amount === null ? [] : [{ hash: tx_hash, amount }],
  )

  return transfers.length === transactions.length ? transfers : []
}

//* The backend credits partial payments only to the method that first received funds.
const getPartiallyPaidMethod = ({
  exception_status,
  payment_id,
  payments,
}: bitcartInvoices.Invoice): bitcartInvoices.InvoicePayment | undefined =>
  exception_status === "paid_partial" ? payments.find(({ id }) => id === payment_id) : undefined

const isFinalStatus = (status: bitcartInvoices.InvoiceStatus): status is CheckoutFinalStatus =>
  status === "unknown" || bitcartInvoices.isTerminalStatus(status)

const getStatusException = ({
  status,
  exception_status,
  payment_id,
  payments,
  sent_amount,
}: bitcartInvoices.Invoice): CheckoutStatusException | null => {
  const paidMethod = payments.find(({ id }) => id === payment_id)

  if (status === "invalid" && exception_status === "failed_confirm") {
    return { kind: "failedConfirm" }
  } else if (!paidMethod || compareAmounts(sent_amount, "0") <= 0) {
    return null
  } else {
    const { amount, symbol } = paidMethod
    const received = { paid: sent_amount, total: amount, symbol }

    //* A zero-price invoice accepts any amount, yet every payment exceeds its zero amount.
    const isOverpaid = exception_status === "paid_over" && compareAmounts(amount, "0") > 0

    if (status === "expired") {
      return { kind: "expiredPartiallyPaid", ...received }
    } else if (isOverpaid) {
      return { kind: "overpaid", ...received }
    } else return null
  }
}

const getReceivedAmount = ({
  payment_id,
  payments,
  sent_amount,
  sent_price,
}: bitcartInvoices.Invoice): CheckoutReceivedAmount | null => {
  const paidMethod = payments.find(({ id }) => id === payment_id)

  if (paidMethod && compareAmounts(sent_amount, "0") > 0) {
    return { amount: sent_amount, symbol: paidMethod.symbol, price: sent_price }
  } else return null
}

const getReceiptItems = ({
  products,
  product_names,
  product_quantities,
}: bitcartInvoices.Invoice): CheckoutReceiptItem[] =>
  products.flatMap((productId) => {
    const name = product_names[productId]

    return typeof name === "string"
      ? [{ id: productId, name, quantity: product_quantities[productId] ?? 1 }]
      : []
  })

const getReceiptTransactions = (
  { transactions }: bitcartInvoices.Invoice,
  { lightning, currency }: bitcartInvoices.InvoicePayment,
  explorerUrls: Record<string, string>,
): CheckoutReceiptTransaction[] =>
  transactions.map(({ tx_hash, amount }) => ({
    hash: tx_hash,
    amount,
    explorerUrl: lightning ? null : getExplorerUrl(explorerUrls[currency], tx_hash),
  }))

const REFUND_STATUSES: Partial<Record<string, CheckoutReceiptRefundStatus>> = {
  pending: "pending",
  approved: "pending",
  sent: "sent",
  complete: "sent",
  failed: "failed",
  cancelled: "failed",
}

export const getRefundStatus = (
  payoutStatus: string | null | undefined,
): CheckoutReceiptRefundStatus =>
  payoutStatus ? (REFUND_STATUSES[payoutStatus] ?? "pending") : "unclaimed"

export const getReceiptRefund = (
  {
    id,
    amount,
    currency,
    created,
    payout_status,
    tx_hash,
    wallet_currency,
  }: bitcartInvoices.InvoiceRefund,
  explorerUrls: Record<string, string>,
): CheckoutReceiptRefund => ({
  id,
  amount,
  currency,
  createdAt: created,
  status: getRefundStatus(payout_status),
  transaction: tx_hash
    ? {
        hash: tx_hash,
        explorerUrl: getExplorerUrl(
          wallet_currency ? explorerUrls[wallet_currency] : undefined,
          tx_hash,
        ),
      }
    : null,
})

const RECEIPTED_STATUSES = ["complete", "refunded"] as const satisfies CheckoutFinalStatus[]

const getReceipt = (
  invoice: bitcartInvoices.Invoice,
  refund: bitcartInvoices.InvoiceRefund | undefined,
  explorerUrls: Record<string, string>,
): CheckoutReceipt | null => {
  const paidMethod = invoice.payments.find(({ id }) => id === invoice.payment_id)
  const isAnyAmount = isAnyAmountInvoice(invoice)

  const received = getReceivedAmount(invoice)

  const hasReceipt =
    (RECEIPTED_STATUSES as readonly string[]).includes(invoice.status) || received !== null

  if (!hasReceipt) {
    return null
  } else {
    const breakdown =
      paidMethod && !isAnyAmount ? getAmountBreakdown(paidMethod, invoice.price) : null

    return {
      createdAt: invoice.created,
      paidAt: invoice.paid_date,
      items: getReceiptItems(invoice),
      total: isAnyAmount ? invoice.sent_price : invoice.effective_price,
      discount: breakdown?.discount ?? null,
      amountPaid: received?.price ?? null,
      payment: paidMethod
        ? {
            name: paidMethod.name,
            symbol: paidMethod.symbol,
            lightning: paidMethod.lightning,
            rate: paidMethod.rate,
            amount: invoice.sent_amount,
            networkCost: breakdown?.networkCost ?? null,
            transactions: getReceiptTransactions(invoice, paidMethod, explorerUrls),
          }
        : null,
      refund: refund ? getReceiptRefund(refund, explorerUrls) : null,
    }
  }
}

const summarizeInvoice = (invoice: bitcartInvoices.Invoice): CheckoutInvoiceSummary => ({
  id: invoice.id,
  price: invoice.price,
  effectivePrice: invoice.effective_price,
  currency: invoice.currency,
  orderId: invoice.order_id,
  redirectUrl:
    invoice.redirect_url && isHttpHref(invoice.redirect_url) ? invoice.redirect_url : null,
  isAnyAmount: isAnyAmountInvoice(invoice),
  timeLeft: invoice.time_left,
  expirationSeconds: invoice.expiration_seconds,
  expiresAt: new Date(
    Date.parse(invoice.created) + invoice.expiration_seconds * 1000,
  ).toISOString(),
})

const resolveSupport = (
  { support_url, support_email }: bitcartStores.StoreCheckoutSettings,
  invoiceId: string,
): CheckoutStoreSupport | null => {
  if (support_url && isHttpHref(support_url)) {
    return { kind: "url", href: support_url }
  } else if (support_email) {
    //* Untranslated: the merchant reads it, and a fixed subject keeps their mail filters working.
    const subject = encodeURIComponent(`Invoice ${invoiceId}`)

    return {
      kind: "email",
      address: support_email,
      href: `mailto:${support_email}?subject=${subject}`,
    }
  } else return null
}

const OTHER_MODE = { light: "dark", dark: "light" } as const

const resolveImage = (
  images: Partial<Record<BasicThemeMode, string>> | undefined,
  mode: BasicThemeMode,
): CheckoutLogo | null => {
  const url = images?.[mode]
  const fallbackUrl = images?.[OTHER_MODE[mode]]

  if (url) {
    return { url, backdrop: null }
  } else if (fallbackUrl) {
    return { url: fallbackUrl, backdrop: OTHER_MODE[mode] }
  } else return null
}

const getLogos = ({ store, appearance }: CheckoutSource) => {
  const { custom_logo_link, use_dark_mode } = store.checkout_settings

  return appearance?.logos ?? { [use_dark_mode ? "dark" : "light"]: custom_logo_link || undefined }
}

const resolveBrand = (source: CheckoutSource, mode: BasicThemeMode): CheckoutBrand => {
  const logo = resolveImage(getLogos(source), mode)
  const icon = resolveImage(source.appearance?.icons, mode)
  const useLogoInsteadOfIcon = source.appearance?.useLogoInsteadOfIcon === true

  if (logo && useLogoInsteadOfIcon) {
    return { kind: "logo", logo, showsName: true }
  } else if (icon) {
    return { kind: "icon", icon, showsName: true }
  } else if (logo) {
    return { kind: "logo", logo, showsName: false }
  } else return { kind: "bitcart", showsName: false }
}

const resolveBranding = (source: CheckoutSource, mode: BasicThemeMode): CheckoutBranding => ({
  brand: resolveBrand(source, mode),
  showPoweredBy: source.policies.allow_powered_by_bitcart,
  palette: source.appearance?.palette ?? null,
})

export const deriveCheckoutModel = (
  source: CheckoutSource,
  {
    chosenMethodId,
    isChangingMethod,
    isRedirectCancelled,
    isShowingEthPluginOffer,
  }: CheckoutUiState,
  actions: CheckoutUiActions,
  { selection, mode, terminal, openedOnComplete }: CheckoutDeriveContext,
): CheckoutModel => {
  const { invoice } = source
  const partiallyPaidMethod = getPartiallyPaidMethod(invoice)

  const methods = (partiallyPaidMethod ? [partiallyPaidMethod] : invoice.payments).map(
    toCheckoutMethod,
  )

  const hasAlternativeMethods = methods.length > 1
  const missingDetailsFields = getMissingDetailsFields(source)

  const chosenPayment =
    invoice.payments.find(({ id }) => id === chosenMethodId) ??
    invoice.payments.find(({ id }) => id === invoice.payment_id)

  const selectedPayment = partiallyPaidMethod ?? chosenPayment ?? resolveDefaultMethod(invoice)

  const isAwaitingExplicitChoice =
    selection === "explicit" && !chosenPayment && hasAlternativeMethods

  const base: CheckoutModelBase = {
    environment: { terminal },
    invoice: summarizeInvoice(invoice),
    store: {
      name: source.store.name,
      support: resolveSupport(source.store.checkout_settings, invoice.id),
    },
    branding: resolveBranding(source, mode),
    methods,
    selectMethod: actions.selectMethod,
  }

  if (isFinalStatus(invoice.status)) {
    const isCompletedLive = invoice.status === "complete" && !openedOnComplete

    const isRedirecting =
      source.store.checkout_settings.auto_redirect &&
      isCompletedLive &&
      base.invoice.redirectUrl !== null &&
      !terminal &&
      !isRedirectCancelled

    return {
      ...base,
      phase: "status",
      status: invoice.status,
      exception: getStatusException(invoice),
      received: getReceivedAmount(invoice),
      receipt: getReceipt(invoice, source.refund, source.policies.explorer_urls),
      isCompletedLive,
      cancelRedirect: isRedirecting ? actions.cancelRedirect : undefined,
    }
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
  } else if (isAwaitingSenderAddress(selectedPayment)) {
    return {
      ...base,
      phase: "address",
      selectedMethodId: selectedPayment.id,
      method: toCheckoutMethod(selectedPayment),
      submitAddress: (address) => source.submitSenderAddress(selectedPayment.id, address),
      ethPluginOffer:
        source.policies.allow_eth_plugin_info && !terminal
          ? {
              buyUrl: getEthPluginBuyUrl(source.policies.admin_url),
              isShown: isShowingEthPluginOffer,
              show: actions.showEthPluginOffer,
              hide: actions.hideEthPluginOffer,
            }
          : undefined,

      changeMethod: hasAlternativeMethods ? actions.changeMethod : undefined,
    }
  } else
    return {
      ...base,
      phase: "payment",
      selectedMethodId: selectedPayment.id,
      payment: toCheckoutPayment(
        selectedPayment,
        invoice,
        source.store.checkout_settings,
        source.policies.explorer_urls,
        partiallyPaidMethod !== undefined,
      ),

      changeMethod: hasAlternativeMethods ? actions.changeMethod : undefined,
    }
}
