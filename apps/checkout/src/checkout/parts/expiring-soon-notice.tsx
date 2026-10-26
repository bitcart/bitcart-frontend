import { cn } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react/macro"
import { TriangleAlertIcon } from "lucide-react"

import { useCheckoutCountdown } from "../hooks"

//* The `status` region stays mounted while empty, so screen readers announce the notice on arrival.
export const ExpiringSoonNotice = ({ className }: { className?: string }) => {
  const { t } = useLingui()
  const { isExpiringSoon, isExpired } = useCheckoutCountdown()

  return (
    <div role="status">
      {isExpiringSoon && !isExpired && (
        <p
          className={cn(
            "gap-2 bg-destructive/10 text-destructive text-xs font-medium flex items-center",
            className,
          )}
        >
          <TriangleAlertIcon aria-hidden className="size-3.5 shrink-0" />
          {t`This invoice is about to expire. Complete your payment soon.`}
        </p>
      )}
    </div>
  )
}
