import { bitcartManage } from "@bitcart/client-sdk/endpoints"
import { BitcartWordmarkIcon } from "@bitcart/ui-kit/icons"
import { useLingui } from "@lingui/react/macro"

import { ExternalLink } from "#/checkout"

export const PoweredByFooter = () => {
  const { t } = useLingui()
  const { data: policies } = bitcartManage.usePolicies()

  if (!policies?.allow_powered_by_bitcart) {
    return null
  } else
    return (
      <div className="py-4 gap-2 flex items-center justify-center">
        <span className="text-muted-foreground text-sm">{t`Powered by`}</span>

        <ExternalLink href="https://bitcart.ai" className="gap-1.5 flex items-center">
          <BitcartWordmarkIcon className="h-5 w-auto" />
        </ExternalLink>
      </div>
    )
}
