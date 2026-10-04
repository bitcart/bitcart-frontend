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
export { StoreLogo } from "./parts/store-logo"
export { WalletButton } from "./parts/wallet-button"
export { ExtensionSlot } from "./runtime/slot"
export { defineExtensionSlotContribution } from "./runtime/slot-contributions"
export { useCheckoutCopy } from "./copy"
export { useCustomerDetailsForm } from "./customer-details-form"
export { useCheckout, useCheckoutCountdown } from "./hooks"
export { useMethodSearch } from "./method-search"
export { defineCheckoutTemplate } from "./template"

export {
  CHECKOUT_AMOUNT_TESTID,
  CHECKOUT_COUNTDOWN_TESTID,
  CHECKOUT_METHOD_SELECTOR_TESTID,
  CHECKOUT_OPEN_WALLET_TESTID,
  CHECKOUT_PAYMENT_ADDRESS_TESTID,
  CHECKOUT_PAYMENT_QR_TESTID,
  CHECKOUT_PAYMENT_URI_TESTID,
  CHECKOUT_RECOMMENDED_FEE_TESTID,
  CHECKOUT_STATUS_TESTID,
} from "@bitcart/qa"

export type {
  CheckoutBranding,
  CheckoutInvoiceSummary,
  CheckoutLogo,
  CheckoutMethod,
  CheckoutModel,
  CheckoutPartialPayment,
  CheckoutPayment,
  CheckoutSelectionMode,
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
