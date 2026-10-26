import type { I18n, MessageDescriptor } from "@lingui/core"
import { msg } from "@lingui/core/macro"

import type { CheckoutAmountFormat } from "./amount-format"
import type {
  CheckoutFinalStatus,
  CheckoutReceiptRefund,
  CheckoutReceiptRefundStatus,
  CheckoutStatusException,
} from "./model"

const RECEIPT_STATUS_LABELS: Record<CheckoutFinalStatus, MessageDescriptor> = {
  complete: msg`Paid`,
  refunded: msg`Refunded`,
  expired: msg`Expired`,
  invalid: msg`Invalid`,
  unknown: msg`Unknown`,
}

export const getReceiptStatusLabel = (
  i18n: I18n,
  status: CheckoutFinalStatus,
  exception: CheckoutStatusException | null,
): string =>
  exception?.kind === "failedConfirm"
    ? i18n.t(msg`Failed to confirm`)
    : i18n.t(RECEIPT_STATUS_LABELS[status])

const REFUND_STATUS_LABELS: Record<CheckoutReceiptRefundStatus, MessageDescriptor> = {
  unclaimed: msg`Awaiting your address`,
  pending: msg`Pending`,
  sent: msg`Sent`,
  failed: msg`Not sent`,
}

export const getRefundStatusLabel = (i18n: I18n, status: CheckoutReceiptRefundStatus): string =>
  i18n.t(REFUND_STATUS_LABELS[status])

export const formatRefundAmount = (
  format: CheckoutAmountFormat,
  { amount, currency }: Pick<CheckoutReceiptRefund, "amount" | "currency">,
  invoiceCurrency: string,
): string => (currency === invoiceCurrency ? format.fiat(amount) : format.crypto(amount, currency))
