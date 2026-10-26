import { CHECKOUT_OPEN_WALLET_TESTID } from "@bitcart/qa"
import { Button, WalletLogo } from "@bitcart/ui-kit/components"
import { useLingui } from "@lingui/react/macro"
import { WalletIcon } from "lucide-react"

import { useWalletButtonKind } from "../wallet-pay/button-kind"
import { useWalletPay } from "../wallet-pay/kit"
import { WalletSentNotice } from "./wallet-sent-notice"

export const WalletButton = ({ className }: { className?: string }) => {
  const { t } = useLingui()
  const { control, runner } = useWalletPay()
  const button = useWalletButtonKind()

  switch (button.kind) {
    case "none":
      return null

    case "sent":
      return <WalletSentNotice hash={button.hash} className={className} />

    case "direct": {
      const { wallet, target } = button
      const name = wallet.name ?? t`your wallet`

      return (
        <Button
          className={className}
          size="lg"
          data-testid={CHECKOUT_OPEN_WALLET_TESTID}
          onClick={() => runner.start(wallet, target)}
        >
          <WalletLogo src={wallet.icon} size={20} className="mr-2" />
          {t`Pay with ${name}`}
        </Button>
      )
    }

    case "sheet":
      return (
        <Button
          className={className}
          size="lg"
          aria-haspopup="dialog"
          data-testid={CHECKOUT_OPEN_WALLET_TESTID}
          onClick={control.actions.openSheet}
        >
          <WalletIcon aria-hidden className="mr-2 size-4" />
          {t`Pay with wallet`}
        </Button>
      )

    case "link":
      //! `href` is a BIP21-style wallet URI, and `LinkButton` accepts HTTP hrefs only.
      //! Base UI sets `role="button"` when `nativeButton` is false; the explicit role overrides it.
      return (
        <Button
          className={className}
          size="lg"
          role="link"
          nativeButton={false}
          data-testid={CHECKOUT_OPEN_WALLET_TESTID}
          render={<a href={button.href} aria-label={t`Pay with wallet`} />}
        >
          <WalletIcon aria-hidden className="mr-2 size-4" />
          {t`Pay with wallet`}
        </Button>
      )
  }
}
