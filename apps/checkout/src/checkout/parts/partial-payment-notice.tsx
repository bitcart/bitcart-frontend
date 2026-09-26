import { cn } from "@bitcart/ui-kit/utils"
import { t } from "@lingui/core/macro"
import { InfoIcon } from "lucide-react"

import { useCheckout } from "../hooks"

export const PartialPaymentNotice = ({ className }: { className?: string }) => {
  const { payment } = useCheckout("payment")

  if (!payment.partial) {
    return null
  } else {
    const unit = payment.symbol.toUpperCase()

    return (
      <div
        role="status"
        className={cn(
          "gap-2 rounded-lg bg-muted px-3 py-2.5 text-xs text-foreground flex items-start",
          className,
        )}
      >
        <InfoIcon className="mt-0.5 size-3.5 shrink-0" />

        <span>
          {t`Received ${payment.partial.paid} of ${payment.partial.total} ${unit}. Please send the remaining ${payment.amount} ${unit}.`}
        </span>
      </div>
    )
  }
}
