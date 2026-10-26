//! The public API for checkout templates, which import from this module only. A breaking change to
//! its exports requires a major bump of `CHECKOUT_API_VERSION`.

export const CHECKOUT_API_VERSION = "1.0.0"

export { AmountBreakdown } from "./parts/amount-breakdown"
export { CheckoutCard } from "./parts/checkout-card"
export { CheckoutCloseButton } from "./parts/close-button"
export { CheckoutHeader, StoreBrandRow } from "./parts/checkout-header"
export { CheckoutConnectionBanner } from "./parts/connection-banner"
export { CheckoutControls } from "./parts/controls"
export { CountdownRing } from "./parts/countdown-ring"
export { ExpiringSoonNotice } from "./parts/expiring-soon-notice"
export { EthPluginOffer } from "./parts/eth-plugin-offer"
export { ExpiryProgress } from "./parts/expiry-progress"
export { ExternalLink } from "./parts/external-link"
export { CheckoutHelp } from "./parts/help"
export { InvoicePrice } from "./parts/invoice-price"
export { LightningNodeInfo } from "./parts/lightning-node-info"
export { ManualPaymentDivider } from "./parts/manual-payment-divider"
export { MethodHint } from "./parts/method-hint"
export { MethodAmount } from "./parts/method-amount"
export { MethodIcon, MethodSummary } from "./parts/method-summary"
export { MethodTitle } from "./parts/method-title"
export { CheckoutFooter } from "./parts/footer"
export { PartialPaymentProgress } from "./parts/partial-payment-progress"
export { PayingWith } from "./parts/paying-with"
export { PaymentAddress } from "./parts/payment-address"
export { PaymentAmount } from "./parts/payment-amount"

export {
  PaymentAmountHeading,
  type PaymentAmountHeadingProps,
} from "./parts/payment-amount-heading"

export { PaymentDeadline } from "./parts/payment-deadline"
export { PaymentQr } from "./parts/payment-qr"
export { PoweredBy } from "./parts/powered-by"
export { PrintReceiptButton, PrintReceiptFailure } from "./parts/print-receipt"
export { ReceiptStatusBadge } from "./parts/receipt-status-badge"
export { RecommendedFee } from "./parts/recommended-fee"
export { ReturnToStoreButton } from "./parts/return-to-store"
export { SenderAddress } from "./parts/sender-address"
export { SenderAddressForm } from "./parts/sender-address-form"
export { StatusOverlay } from "./parts/status-overlay"
export { StoreBrand } from "./parts/store-brand"
export { WalletButton } from "./parts/wallet-button"
export { useWalletAction } from "./wallet-pay/button-kind"
export { ExtensionSlot } from "./runtime/slot"
export { defineExtensionSlotContribution } from "./runtime/slot-contributions"
export { useAmountFormat, useFormattingLocale, type CheckoutAmountFormat } from "./amount-format"
export { useCheckoutCopyStatus, type CheckoutCopy } from "./copy-status"
export { CHECKOUT_FIT_STEPS } from "./fit-steps"
export { useCustomerDetailsForm } from "./customer-details-form"
export { useSenderAddressForm } from "./sender-address-form"
export { useCheckout, useCheckoutCountdown } from "./hooks"
export { useRemainingTime, type CheckoutRemainingTime } from "./remaining-time"
export { useMethodSearch } from "./method-search"
export { useCanOpenExternalLinks } from "./terminal"
export { useReceiptPrinter, type CheckoutReceiptPrinter } from "./receipt-printer"
export { formatRefundAmount, getRefundStatusLabel } from "./receipt-status"
export { defineCheckoutTemplate } from "./template"

export {
  CHECKOUT_AMOUNT_BREAKDOWN_TESTID,
  CHECKOUT_AMOUNT_TESTID,
  CHECKOUT_CLOSE_TESTID,
  CHECKOUT_COUNTDOWN_TESTID,
  CHECKOUT_METHOD_HINT_TESTID,
  CHECKOUT_METHOD_SELECTOR_TESTID,
  CHECKOUT_OPEN_WALLET_TESTID,
  CHECKOUT_PAYMENT_ADDRESS_TESTID,
  CHECKOUT_PAYMENT_QR_TESTID,
  CHECKOUT_RECOMMENDED_FEE_TESTID,
  CHECKOUT_SENDER_ADDRESS_TESTID,
  CHECKOUT_STATUS_TESTID,
} from "@bitcart/qa"

export type {
  CheckoutAmountBreakdown,
  CheckoutBrand,
  CheckoutBranding,
  CheckoutDiscount,
  CheckoutEnvironment,
  CheckoutEthPluginOffer,
  CheckoutFinalStatus,
  CheckoutInvoiceSummary,
  CheckoutLogo,
  CheckoutMethod,
  CheckoutModel,
  CheckoutPartialPayment,
  CheckoutPayment,
  CheckoutReceipt,
  CheckoutReceiptItem,
  CheckoutReceiptPayment,
  CheckoutReceiptRefund,
  CheckoutReceiptRefundStatus,
  CheckoutReceiptTransaction,
  CheckoutReceivedAmount,
  CheckoutSelectionMode,
  CheckoutSenderAddressOutcome,
  CheckoutStatusException,
  CheckoutStoreSupport,
  CheckoutStoreSummary,
  CustomerDetailsField,
  CustomerDetailsValues,
} from "./model"

export type { CheckoutCountdown } from "./runtime/context"

export type {
  ExtensionSlotContribution,
  ExtensionSlotName,
  SlotContextMap,
} from "./runtime/slot-contributions"

export type { CheckoutTemplate, CheckoutTemplateDefinition } from "./template"
export type { CheckoutPaletteInput, CheckoutThemeToken } from "./theme/palette"
