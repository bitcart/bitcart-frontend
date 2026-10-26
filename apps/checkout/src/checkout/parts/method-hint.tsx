import { CHECKOUT_METHOD_HINT_TESTID } from "@bitcart/qa"
import { cn } from "@bitcart/ui-kit/utils"
import { InfoIcon } from "lucide-react"

import { useCheckout } from "../hooks"

export const MethodHint = ({ className }: { className?: string }) => {
  const { hint } = useCheckout("payment").payment

  return (
    hint !== null && (
      <p
        data-testid={CHECKOUT_METHOD_HINT_TESTID}
        className={cn(
          "gap-2 text-xs text-muted-foreground flex items-start whitespace-pre-line",
          className,
        )}
      >
        <InfoIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        <span className="min-w-0 break-words">{hint}</span>
      </p>
    )
  )
}
