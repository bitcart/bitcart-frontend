import { CHECKOUT_WALLET_SENT_TESTID } from "@bitcart/qa"
import { Spinner } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react/macro"

import { useCheckout } from "../hooks"
import { ExternalLink } from "./external-link"

export const WalletSentNotice = ({ hash, className }: { hash: string; className?: string }) => {
  const { t } = useLingui()
  const { payment } = useCheckout("payment")
  const transactionUrl = payment.getTransactionUrl(hash)

  return (
    <div
      role="status"
      data-testid={CHECKOUT_WALLET_SENT_TESTID}
      className={cn(
        "gap-3 rounded-xl border-border p-3 text-sm flex items-start border",
        className,
      )}
    >
      <Spinner aria-hidden className="mt-0.5 size-4 text-muted-foreground shrink-0" />

      <div className="min-w-0 gap-0.5 flex flex-col">
        <p className="font-medium">{t`Payment sent`}</p>
        <p className="text-muted-foreground">{t`Waiting for the network to pick it up…`}</p>

        {transactionUrl ? (
          <ExternalLink
            href={transactionUrl}
            className="text-primary font-medium underline-offset-4 hover:underline"
          >
            {t`View transaction`}
          </ExternalLink>
        ) : (
          <p className="text-xs text-muted-foreground font-mono break-all">{hash}</p>
        )}
      </div>
    </div>
  )
}
