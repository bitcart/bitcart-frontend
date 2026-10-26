import { CHECKOUT_COUNTDOWN_TESTID } from "@bitcart/qa"
import { TimerRing } from "@bitcart/ui-kit/components"
import { useLingui } from "@lingui/react/macro"

import { useCheckout, useCheckoutCountdown } from "../hooks"
import { useRemainingTime } from "../remaining-time"

export const CountdownRing = ({ className }: { className?: string }) => {
  const { t } = useLingui()
  const { invoice } = useCheckout()
  const { secondsLeft } = useCheckoutCountdown()
  const { text, description } = useRemainingTime()

  return (
    <TimerRing
      secondsLeft={secondsLeft}
      totalSeconds={invoice.expirationSeconds}
      role="progressbar"
      aria-label={t`Time left to pay`}
      aria-valuemin={0}
      aria-valuemax={invoice.expirationSeconds}
      aria-valuenow={secondsLeft}
      aria-valuetext={description}
      data-testid={CHECKOUT_COUNTDOWN_TESTID}
      className={className}
    >
      <span aria-hidden className="text-xs font-semibold text-foreground relative tabular-nums">
        {text}
      </span>
    </TimerRing>
  )
}
