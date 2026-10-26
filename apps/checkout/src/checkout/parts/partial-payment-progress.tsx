import { CHECKOUT_AMOUNT_TESTID } from "@bitcart/qa"
import { FittedText } from "@bitcart/ui-kit/components"
import { Plural, useLingui } from "@lingui/react/macro"
import { CircleCheckIcon, CircleDashedIcon } from "lucide-react"

import { useAmountFormat } from "../amount-format"
import { CHECKOUT_FIT_STEPS } from "../fit-steps"
import { useCheckout } from "../hooks"
import { PaymentAmount } from "./payment-amount"

export const PartialPaymentProgress = ({
  className,
  showAmountDue = true,
}: {
  className?: string
  showAmountDue?: boolean
}) => {
  const { t } = useLingui()
  const { payment } = useCheckout("payment")
  const format = useAmountFormat()

  if (!payment.partial) {
    return null
  } else {
    const transfers = payment.partial.received.length

    return (
      <div className={className}>
        <div className="gap-2.5 text-sm flex items-center">
          <CircleCheckIcon aria-hidden className="size-4 text-success shrink-0" />

          <span className="text-muted-foreground flex-1">
            {transfers > 1 ? (
              <Plural value={transfers} one="# payment" other="# payments" />
            ) : (
              t`Received`
            )}
          </span>

          <span className="font-mono text-muted-foreground">
            {format.crypto(payment.partial.paid, payment.symbol)}
          </span>
        </div>

        {showAmountDue && (
          <>
            <div
              aria-hidden
              className="h-4 border-muted-foreground/40 ml-[7.5px] border-l border-dashed"
            />

            <div className="gap-2.5 flex items-center">
              <CircleDashedIcon aria-hidden className="size-4 text-primary shrink-0" />
              <span className="text-sm font-medium whitespace-nowrap">{t`Send now`}</span>

              <FittedText steps={CHECKOUT_FIT_STEPS.amount} className="flex-1">
                <div
                  className="text-2xl font-bold tracking-tight text-right whitespace-nowrap"
                  data-testid={CHECKOUT_AMOUNT_TESTID}
                >
                  <PaymentAmount unitClassName="ml-1.5 text-muted-foreground text-sm font-medium" />
                </div>
              </FittedText>
            </div>
          </>
        )}
      </div>
    )
  }
}
