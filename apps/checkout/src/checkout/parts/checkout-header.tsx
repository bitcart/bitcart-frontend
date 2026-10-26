import { FittedText } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { Trans } from "@lingui/react/macro"

import { useAmountFormat } from "../amount-format"
import { CHECKOUT_FIT_STEPS } from "../fit-steps"
import { useCheckout } from "../hooks"
import { CheckoutCloseButton } from "./close-button"
import { CountdownRing } from "./countdown-ring"
import { CheckoutHelp } from "./help"
import { InvoicePrice } from "./invoice-price"
import { PaymentDeadline } from "./payment-deadline"
import { StoreBrand } from "./store-brand"

export const StoreBrandRow = ({ className }: { className?: string }) => (
  <div className={cn("gap-3 flex items-center", className)}>
    <div className="min-w-0 flex flex-1">
      <StoreBrand />
    </div>

    <CheckoutHelp />
    <CheckoutCloseButton />
  </div>
)

const PayLine = ({ className }: { className?: string }) => {
  const { store } = useCheckout()
  const storeName = store.name

  return (
    <div className={cn("text-sm text-muted-foreground wrap-break-word", className)}>
      <Trans>
        Pay <span className="font-medium text-foreground">{storeName}</span>
      </Trans>
    </div>
  )
}

const AmountLeftLine = () => {
  const model = useCheckout()
  const format = useAmountFormat()
  const partial = model.phase === "payment" ? model.payment.partial : null

  if (!partial) {
    return null
  } else {
    const amountLeft = format.fiat(partial.remainingPrice)

    return (
      <div className="text-sm text-foreground">
        <Trans>
          <span className="font-semibold">{amountLeft}</span> left to pay
        </Trans>
      </div>
    )
  }
}

export const CheckoutHeader = ({ className }: { className?: string }) => {
  const { branding } = useCheckout()
  const hasPayLine = !branding.brand.showsName

  return (
    <div className={cn("px-5 pt-4 pb-5", className)}>
      <StoreBrandRow />

      <div className="mt-4 gap-4 flex items-center">
        <div className="min-w-0 flex-1">
          {hasPayLine && <PayLine />}

          <FittedText steps={CHECKOUT_FIT_STEPS.price} className={cn(hasPayLine && "mt-0.5")}>
            <InvoicePrice className="text-3xl font-bold tracking-tight block whitespace-nowrap tabular-nums" />
          </FittedText>

          <AmountLeftLine />
          <PaymentDeadline className="mt-0.5" />
        </div>

        <CountdownRing />
      </div>
    </div>
  )
}
