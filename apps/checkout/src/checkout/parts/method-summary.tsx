import { CoinIcon } from "@bitcart/ui-kit/components"

import { useAmountFormat } from "../amount-format"
import { useCheckout } from "../hooks"
import type { CheckoutMethod } from "../model"
import { getMethodNetwork } from "../networks"
import { MethodTitle } from "./method-title"

export const MethodIcon = ({ method, size }: { method: CheckoutMethod; size?: number }) => (
  <CoinIcon
    symbol={method.symbol}
    contract={method.contract}
    network={getMethodNetwork(method)}
    size={size}
  />
)

export const MethodSummary = ({ method }: { method: CheckoutMethod }) => {
  const { invoice } = useCheckout()
  const format = useAmountFormat()

  return (
    <>
      <MethodIcon method={method} />

      <span className="min-w-0 flex-1">
        <span className="gap-1.5 min-w-0 flex items-center">
          <MethodTitle method={method} className="text-sm font-semibold" />
        </span>

        <span className="text-muted-foreground block truncate text-[11px]">
          {format.rate(method.rate, method.symbol)}
        </span>
      </span>

      {!invoice.isAnyAmount && (
        <span className="text-xs text-muted-foreground font-mono shrink-0">
          {format.number(method.amount)}
        </span>
      )}
    </>
  )
}
