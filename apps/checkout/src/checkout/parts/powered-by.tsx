import { BitcartWordmarkIcon } from "@bitcart/ui-kit/icons"
import { cn } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react/macro"

import { useCheckout } from "../hooks"
import { ExternalLink } from "./external-link"

export const PoweredBy = ({ className }: { className?: string }) => {
  const { t } = useLingui()
  const { branding } = useCheckout()

  return (
    branding.showPoweredBy && (
      <ExternalLink
        href="https://bitcart.ai"
        aria-label={t`Powered by Bitcart`}
        className={cn(
          "gap-1.5 text-xs text-muted-foreground flex shrink-0 items-center whitespace-nowrap",
          className,
        )}
      >
        <span>{t`Powered by`}</span>
        <BitcartWordmarkIcon className="h-4 sm:h-5 w-auto" />
      </ExternalLink>
    )
  )
}
