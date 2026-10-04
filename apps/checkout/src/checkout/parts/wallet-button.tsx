import { CHECKOUT_OPEN_WALLET_TESTID } from "@bitcart/qa"
import { Button } from "@bitcart/ui-kit/components"
import { t } from "@lingui/core/macro"
import { WalletIcon } from "lucide-react"

import { useCheckout } from "../hooks"

export const WalletButton = ({ className }: { className?: string }) => {
  const { payment } = useCheckout("payment")

  if (!payment.paymentUrl) {
    return null
  } else {
    //! `paymentUrl` is a BIP21-style wallet URI, and `LinkButton` accepts HTTP hrefs only.
    //! Base UI sets `role="button"` when `nativeButton` is false; the explicit role overrides it.
    return (
      <Button
        className={className}
        size="lg"
        role="link"
        nativeButton={false}
        data-testid={CHECKOUT_OPEN_WALLET_TESTID}
        render={<a href={payment.paymentUrl} aria-label={t`Open in Wallet`} />}
      >
        <WalletIcon className="mr-2 size-4" />
        {t`Open in Wallet`}
      </Button>
    )
  }
}
