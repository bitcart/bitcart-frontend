import { CHECKOUT_AMOUNT_TESTID } from "@bitcart/qa"
import { FittedText } from "@bitcart/ui-kit/components"
import { useLingui } from "@lingui/react/macro"

import { useAmountFormat } from "../amount-format"
import { getCopyOutcome, useCheckoutCopyStatus, type CheckoutCopy } from "../copy-status"
import { CHECKOUT_FIT_STEPS } from "../fit-steps"
import { useCheckout } from "../hooks"
import { CopyAnnouncement, CopyStatusIcon } from "./copy-feedback"
import { InvoicePrice } from "./invoice-price"
import { PaymentAmount } from "./payment-amount"

export type PaymentAmountHeadingProps = {
  copy?: CheckoutCopy
  showsPrice?: boolean
  namesStore?: boolean
  className?: string
}

export const PaymentAmountHeading = ({
  copy,
  showsPrice = false,
  namesStore = false,
  className,
}: PaymentAmountHeadingProps) => {
  const { t } = useLingui()
  const { invoice, payment, environment, branding, store } = useCheckout("payment")
  const format = useAmountFormat()
  const ownCopy = useCheckoutCopyStatus()
  const activeCopy = copy ?? ownCopy
  const outcome = getCopyOutcome(activeCopy, "amount")
  const storeName = store.name
  const unit = payment.symbol.toUpperCase()
  const amountValue = payment.amount

  const heading = (() => {
    if (invoice.isAnyAmount) {
      return t`Send any amount`
    } else if (payment.partial) {
      return t`Send the rest`
    } else if (namesStore && !branding.brand.showsName) {
      return t`Pay ${storeName}`
    } else return t`Send exactly`
  })()

  const amount = (
    <FittedText steps={CHECKOUT_FIT_STEPS.payAmount} className="flex-1">
      <span
        data-testid={CHECKOUT_AMOUNT_TESTID}
        className="text-3xl font-bold tracking-tight block whitespace-nowrap tabular-nums"
      >
        <PaymentAmount unitClassName="ml-1.5 text-base font-semibold text-muted-foreground" />
      </span>
    </FittedText>
  )

  return (
    <div className={className}>
      <p
        data-testid={invoice.isAnyAmount ? CHECKOUT_AMOUNT_TESTID : undefined}
        className="text-sm text-muted-foreground wrap-break-word"
      >
        {heading}
      </p>

      {!invoice.isAnyAmount &&
        (environment.terminal || payment.lightning ? (
          <div className="flex">{amount}</div>
        ) : (
          <>
            <button
              type="button"
              aria-label={t`Copy amount ${amountValue} ${unit}`}
              onClick={() => activeCopy.copy("amount", payment.amount)}
              className="gap-2 rounded-md hover:bg-muted/50 inline-flex max-w-full cursor-pointer items-center"
            >
              {amount}
              <CopyStatusIcon outcome={outcome} />
            </button>

            <CopyAnnouncement outcome={outcome} label={t`Amount`} />
          </>
        ))}

      <div className="gap-x-3 text-sm text-muted-foreground flex flex-wrap">
        {showsPrice &&
          !invoice.isAnyAmount &&
          (payment.partial ? (
            <span>{format.fiat(payment.partial.remainingPrice)}</span>
          ) : (
            <InvoicePrice />
          ))}

        <span>{format.rate(payment.rate, payment.symbol)}</span>
      </div>
    </div>
  )
}
