import { BitcartWordmarkIcon } from "@bitcart/ui-kit/icons"
import { t } from "@lingui/core/macro"

import { BRAND_UMBRELLA_NAME } from "#/common/constants"

export const PoweredByFooter = () => {
  return (
    <div className="py-4 gap-2 flex items-center justify-center">
      <span className="text-muted-foreground text-sm">{t`Powered by`}</span>
      <a
        href="https://bitcart.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="gap-1.5 flex items-center"
      >
        <BitcartWordmarkIcon role="img" aria-label={BRAND_UMBRELLA_NAME} className="h-4" />
      </a>
    </div>
  )
}
