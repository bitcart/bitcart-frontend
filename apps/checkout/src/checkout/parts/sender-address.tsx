import { CHECKOUT_SENDER_ADDRESS_TESTID } from "@bitcart/qa"
import { cn } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react/macro"

import { useCheckout } from "../hooks"
import { MarkedValue } from "./copyable-value"

export const SenderAddress = ({ className }: { className?: string }) => {
  const { t } = useLingui()
  const { payment } = useCheckout("payment")

  return (
    payment.senderAddress !== null && (
      <div className={cn("rounded-xl bg-muted px-3 py-2.5", className)}>
        <p className="text-xs text-muted-foreground">{t`Send from`}</p>

        <p
          data-testid={CHECKOUT_SENDER_ADDRESS_TESTID}
          className="mt-0.5 text-sm font-mono text-balance break-all"
        >
          <MarkedValue value={payment.senderAddress} isMarked />
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {t`Payments from other addresses won't be credited.`}
        </p>
      </div>
    )
  )
}
