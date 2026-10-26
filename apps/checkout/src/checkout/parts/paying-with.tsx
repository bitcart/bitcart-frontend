import { Button, Popover, PopoverContent, PopoverTrigger } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react/macro"
import { InfoIcon } from "lucide-react"

import { getCopyOutcome, useCheckoutCopyStatus, type CheckoutCopy } from "../copy-status"
import { useCheckout } from "../hooks"
import { CopyAnnouncement, CopyStatusIcon } from "./copy-feedback"
import { MarkedValue } from "./copyable-value"
import { MethodIcon } from "./method-summary"
import { MethodTitle } from "./method-title"

const TokenContract = ({ contract, copy }: { contract: string; copy: CheckoutCopy }) => {
  const { t } = useLingui()
  const { environment } = useCheckout()
  const outcome = getCopyOutcome(copy, "contract")

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t`Token contract`}
            className="size-6 p-1 text-muted-foreground relative z-10"
          />
        }
      >
        <InfoIcon className="size-4" />
      </PopoverTrigger>

      <PopoverContent className="w-72 space-y-3">
        <p className="text-sm font-semibold">{t`Token contract`}</p>

        <p className="text-sm font-mono break-all">
          <MarkedValue value={contract} isMarked />
        </p>

        {!environment.terminal && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => copy.copy("contract", contract)}
            >
              {outcome === "failed" ? (
                <CopyStatusIcon outcome={outcome} />
              ) : (
                <>
                  <CopyStatusIcon outcome={outcome} className="text-current" />
                  {outcome === "copied" ? t`Copied` : t`Copy contract`}
                </>
              )}
            </Button>

            <CopyAnnouncement outcome={outcome} label={t`Token contract`} />
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

const usePayingWith = () => {
  const model = useCheckout()

  if (model.phase === "payment") {
    return { method: model.payment, changeMethod: model.changeMethod }
  } else if (model.phase === "address") {
    return { method: model.method, changeMethod: model.changeMethod }
  } else throw new Error(`PayingWith was placed while the checkout is in "${model.phase}"`)
}

export const PayingWith = ({ copy, className }: { copy?: CheckoutCopy; className?: string }) => {
  const { t } = useLingui()
  const { method, changeMethod } = usePayingWith()
  const ownCopy = useCheckoutCopyStatus()

  return (
    <div
      className={cn(
        "gap-3 px-5 py-3 text-sm flex items-center justify-between",
        changeMethod && "hover:bg-muted/50 relative transition-colors",
        className,
      )}
    >
      <span className="gap-1 min-w-0 text-muted-foreground flex items-center">
        <span className="gap-2 min-w-0 flex items-center">
          <MethodIcon method={method} size={24} />

          <span className="gap-1.5 min-w-0 flex items-center">
            <span className="shrink-0 whitespace-nowrap">{t`Paying with`}</span>
            <MethodTitle method={method} className="text-foreground font-semibold" />
          </span>
        </span>

        {method.contract !== null && (
          <TokenContract contract={method.contract} copy={copy ?? ownCopy} />
        )}
      </span>

      {changeMethod && (
        <button
          type="button"
          aria-label={t`Change payment method`}
          onClick={changeMethod}
          className={cn(`
            text-primary font-medium after:inset-0 after:ring-ring shrink-0
            cursor-pointer whitespace-nowrap
            after:absolute
            after:ring-inset hover:underline
            focus-visible:outline-none
            focus-visible:after:ring-2
          `)}
        >
          {t`Change`}
        </button>
      )}
    </div>
  )
}
