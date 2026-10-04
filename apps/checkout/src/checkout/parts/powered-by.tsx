import { BitcartWordmarkIcon } from "@bitcart/ui-kit/icons"
import { cn } from "@bitcart/ui-kit/utils"
import { t } from "@lingui/core/macro"

import { useCheckout } from "../hooks"

export const PoweredBy = ({ className }: { className?: string }) => {
  const { branding } = useCheckout()

  return (
    branding.showPoweredBy && (
      <a
        href="https://bitcart.ai"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t`Powered by Bitcart`}
        className={cn(
          "gap-1.5 text-xs text-muted-foreground flex shrink-0 items-center whitespace-nowrap",
          className,
        )}
      >
        <span>{t`Powered by`}</span>
        <BitcartWordmarkIcon aria-hidden className="h-4 sm:h-5 w-auto" />
      </a>
    )
  )
}
