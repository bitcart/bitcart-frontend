//! The public API for checkout templates, which import from this module only. A breaking change to
//! its exports requires a major bump of `CHECKOUT_API_VERSION`.

export const CHECKOUT_API_VERSION = "1.0.0"

export { CheckoutCard } from "./parts/checkout-card"
export { CheckoutConnectionBanner } from "./parts/connection-banner"
export { CheckoutControls } from "./parts/controls"
export { CopyField, type CopyFieldProps } from "./parts/copy-field"
export { CheckoutFooter } from "./parts/footer"
export { PartialPaymentNotice } from "./parts/partial-payment-notice"
export { PaymentQr } from "./parts/payment-qr"
export { PoweredBy } from "./parts/powered-by"
export { RecommendedFee } from "./parts/recommended-fee"
export { StatusOverlay } from "./parts/status-overlay"
export { WalletButton } from "./parts/wallet-button"
export { useCheckoutCopy } from "./copy"
export { useCustomerDetailsForm } from "./customer-details-form"
export { useCheckout } from "./hooks"
export { useMethodSearch } from "./method-search"
export { defineCheckoutTemplate } from "./template"

export type {
  CheckoutBranding,
  CheckoutCountdown,
  CheckoutInvoiceSummary,
  CheckoutMethod,
  CheckoutModel,
  CheckoutPartialPayment,
  CheckoutPayment,
  CheckoutSelectionMode,
  CheckoutStoreSummary,
  CustomerDetailsField,
  CustomerDetailsValues,
} from "./model"

export type { CheckoutTemplate, CheckoutTemplateDefinition } from "./template"
