import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react/macro"
import { ChevronDownIcon } from "lucide-react"

import { useCheckoutCopyStatus, type CheckoutCopy } from "../copy-status"
import { useCheckout } from "../hooks"
import { CopyableValue } from "./copyable-value"

export const LightningNodeInfo = ({
  copy,
  isStartAlignedFromSm = false,
  className,
}: {
  copy?: CheckoutCopy
  isStartAlignedFromSm?: boolean
  className?: string
}) => {
  const { t } = useLingui()
  const { payment, environment } = useCheckout("payment")
  const ownCopy = useCheckoutCopyStatus()

  return (
    payment.nodeId !== null &&
    !environment.terminal && (
      <Collapsible className={className}>
        <CollapsibleTrigger
          className={cn(
            `
              group gap-1 text-xs text-muted-foreground font-medium
              hover:text-foreground
              flex w-full cursor-pointer items-center justify-center
            `,
            isStartAlignedFromSm && "sm:justify-start",
          )}
        >
          {t`Node info`}
          <ChevronDownIcon className="size-3.5 transition-transform group-data-[panel-open]:rotate-180" />
        </CollapsibleTrigger>

        <CollapsibleContent className="pt-2">
          <CopyableValue
            target="nodeId"
            label={t`Node ID`}
            value={payment.nodeId}
            copy={copy ?? ownCopy}
            isStartAlignedFromSm={isStartAlignedFromSm}
          />
        </CollapsibleContent>
      </Collapsible>
    )
  )
}
