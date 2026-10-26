import { Badge } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react"

import { useCheckout } from "../hooks"
import type { CheckoutFinalStatus } from "../model"
import { getReceiptStatusLabel } from "../receipt-status"

const STATUS_CLASS_NAMES: Record<CheckoutFinalStatus, string> = {
  complete: "bg-success/10 text-success",
  refunded: "bg-warning/10 text-warning",
  expired: "bg-muted text-muted-foreground",
  invalid: "bg-destructive/10 text-destructive-foreground",
  unknown: "bg-muted text-muted-foreground",
}

export const ReceiptStatusBadge = () => {
  const { i18n } = useLingui()
  const { status, exception } = useCheckout("status")

  return (
    <Badge variant="outline" className={cn("border-transparent", STATUS_CLASS_NAMES[status])}>
      {getReceiptStatusLabel(i18n, status, exception)}
    </Badge>
  )
}
