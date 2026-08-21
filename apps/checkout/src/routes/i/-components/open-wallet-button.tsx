import type { HttpHref } from "@bitcart/core/navigation"
import { LinkButton } from "@bitcart/ui-kit/components"
import { t } from "@lingui/core/macro"

type OpenWalletButtonProps = {
  paymentUrl: string
}

export const OpenWalletButton = ({ paymentUrl }: OpenWalletButtonProps) => {
  return (
    <div className="px-4 py-4 flex justify-center">
      {/*
      // TODO: Fix this.
      //! BIP21-style wallet URIs (`bitcoin:…`) are external hrefs `LinkButton` has no type for.
      */}
      <LinkButton isExternalLink href={paymentUrl as HttpHref}>{t`OPEN IN WALLET`}</LinkButton>
    </div>
  )
}
