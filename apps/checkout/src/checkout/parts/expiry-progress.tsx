import { cn } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react/macro"

import { useCheckout, useCheckoutCountdown } from "../hooks"
import { useRemainingTime } from "../remaining-time"

export const ExpiryProgress = ({ className }: { className?: string }) => {
  const { t } = useLingui()
  const { invoice } = useCheckout()
  const { progress, isExpiringSoon, secondsLeft } = useCheckoutCountdown()
  const { description } = useRemainingTime()

  return (
    <div className={cn("bg-muted h-1 overflow-hidden", className)}>
      <div
        role="progressbar"
        aria-label={t`Time left to pay`}
        aria-valuemin={0}
        aria-valuemax={invoice.expirationSeconds}
        aria-valuenow={secondsLeft}
        aria-valuetext={description}
        className={cn(
          "h-full transition-[width,background-color] duration-1000 ease-linear",
          isExpiringSoon ? "bg-destructive" : "bg-primary",
        )}
        style={{ width: `${(1 - progress) * 100}%` }}
      />
    </div>
  )
}
