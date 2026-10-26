import { FittedText } from "@bitcart/ui-kit/components"
import { useLingui } from "@lingui/react/macro"

import { useAmountFormat } from "../amount-format"
import { CHECKOUT_FIT_STEPS } from "../fit-steps"
import { useCheckout } from "../hooks"
import type { CheckoutMethod } from "../model"

export const MethodAmount = ({
  method,
  className,
}: {
  method: CheckoutMethod
  className?: string
}) => {
  const { t } = useLingui()
  const { invoice } = useCheckout()
  const format = useAmountFormat()

  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground">{t`Amount`}</p>

      <FittedText steps={CHECKOUT_FIT_STEPS.payAmount}>
        <span className="text-3xl font-bold tracking-tight block whitespace-nowrap tabular-nums">
          {invoice.isAnyAmount ? (
            t`Any amount`
          ) : (
            <>
              {method.amount}

              <span className="ml-1.5 text-base font-semibold text-muted-foreground">
                {method.symbol.toUpperCase()}
              </span>
            </>
          )}
        </span>
      </FittedText>

      <p className="text-sm text-muted-foreground">{format.rate(method.rate, method.symbol)}</p>
    </div>
  )
}
