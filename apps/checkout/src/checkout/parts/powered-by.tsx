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
        className={cn("gap-1.5 text-muted-foreground flex items-center text-[10px]", className)}
      >
        {t`Powered by`}
        <BitcartWordmarkIcon role="img" aria-label="Bitcart" className="h-3" />
      </a>
    )
  )
}
