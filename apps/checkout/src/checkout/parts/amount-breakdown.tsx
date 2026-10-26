import { CHECKOUT_AMOUNT_BREAKDOWN_TESTID } from "@bitcart/qa"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react/macro"
import { ChevronDownIcon } from "lucide-react"

import { useAmountFormat } from "../amount-format"
import { useCheckout } from "../hooks"

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <>
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="font-mono text-right">{children}</dd>
  </>
)

export const AmountBreakdown = ({ className }: { className?: string }) => {
  const { t } = useLingui()
  const { payment } = useCheckout("payment")
  const format = useAmountFormat()
  const { breakdown, partial } = payment

  const hasPriceMath = breakdown?.discount || breakdown?.networkCost
  const hasSeveralTransfers = partial && partial.received.length > 1

  if (!breakdown || !(hasPriceMath || hasSeveralTransfers)) {
    return null
  } else {
    const crypto = (amount: string) => format.crypto(amount, payment.symbol)
    const { orderAmount, discount, networkCost } = breakdown
    const price = format.fiat(breakdown.price)
    const originalPrice = discount && format.fiat(discount.originalPrice)

    return (
      <Collapsible className={className} data-testid={CHECKOUT_AMOUNT_BREAKDOWN_TESTID}>
        <CollapsibleTrigger
          className={cn(`
            group gap-1 text-xs text-muted-foreground font-medium
            hover:text-foreground
            flex items-center
          `)}
        >
          {t`Price breakdown`}
          <ChevronDownIcon className="size-3.5 transition-transform group-data-[panel-open]:rotate-180" />
        </CollapsibleTrigger>

        <CollapsibleContent className="pt-2">
          <dl className="gap-x-4 gap-y-1.5 text-xs grid grid-cols-[1fr_auto]">
            <Row label={t`Order amount`}>
              {crypto(orderAmount)}
              <span className="text-muted-foreground block">
                {originalPrice ? (
                  <>
                    <span className="sr-only">{t`${price}, discounted from ${originalPrice}`}</span>

                    <span aria-hidden>
                      <s>{originalPrice}</s> {price}
                    </span>
                  </>
                ) : (
                  price
                )}
              </span>
            </Row>

            {discount && (
              <Row label={t`Discount`}>
                <span className="font-sans">{discount.name}</span> −{discount.percent}%
              </Row>
            )}

            {networkCost && <Row label={t`Network cost`}>+{crypto(networkCost)}</Row>}

            {partial && (
              <>
                {partial.received.length > 1 ? (
                  partial.received.map(({ hash, amount }, index) => {
                    const number = index + 1

                    return (
                      <Row key={hash} label={t`Payment ${number}`}>
                        −{crypto(amount)}
                      </Row>
                    )
                  })
                ) : (
                  <Row label={t`Already paid`}>−{crypto(partial.paid)}</Row>
                )}

                <Row label={t`Due`}>
                  {crypto(payment.amount)}

                  <span className="text-muted-foreground block">
                    {format.fiat(partial.remainingPrice)}
                  </span>
                </Row>
              </>
            )}
          </dl>
        </CollapsibleContent>
      </Collapsible>
    )
  }
}
