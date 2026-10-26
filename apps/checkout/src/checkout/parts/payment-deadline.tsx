import { cn } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react/macro"

import { useFormattingLocale } from "../amount-format"
import { useCheckout } from "../hooks"

const HOUR = 3600

export const PaymentDeadline = ({ className }: { className?: string }) => {
  const { t } = useLingui()
  const { invoice } = useCheckout()
  const locale = useFormattingLocale()

  if (invoice.expirationSeconds <= HOUR) {
    return null
  } else {
    const deadline = new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(invoice.expiresAt))

    return (
      <div className={cn("text-sm text-muted-foreground", className)}>{t`Due by ${deadline}`}</div>
    )
  }
}
