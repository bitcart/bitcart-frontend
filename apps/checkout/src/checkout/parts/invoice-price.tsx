import { useLingui } from "@lingui/react/macro"

import { useAmountFormat } from "../amount-format"
import { useCheckout } from "../hooks"

export const InvoicePrice = ({ className }: { className?: string }) => {
  const { t } = useLingui()
  const model = useCheckout()
  const format = useAmountFormat()

  const price =
    (model.phase === "payment" && model.payment.breakdown?.price) || model.invoice.effectivePrice

  return (
    <span className={className}>
      {model.invoice.isAnyAmount ? t`Any amount` : format.fiat(price)}
    </span>
  )
}
