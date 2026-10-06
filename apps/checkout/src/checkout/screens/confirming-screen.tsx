import { Spinner } from "@bitcart/ui-kit/components"
import { useLingui } from "@lingui/react/macro"

import { CheckoutCard, CheckoutFooter, ExtensionSlot, useCheckout } from ".."

export const CheckoutConfirmingScreen = () => {
  const { t } = useLingui()
  const { confirmations, invoice, store } = useCheckout("confirming")

  return (
    <CheckoutCard>
      <ExtensionSlot name="checkout:header-extra" className="px-5 pt-5" />

      <div className="px-8 py-12 gap-3 flex flex-col items-center text-center">
        <Spinner className="size-12 text-pending" />
        <p className="mt-3 text-xl font-semibold">{t`Payment received`}</p>

        <p className="text-muted-foreground text-sm">
          {t`The payment is on its way. This page updates by itself once it's confirmed.`}
        </p>

        {confirmations && confirmations.required > 0 && (
          <p className="text-sm font-medium tabular-nums">
            {t`Waiting for confirmations: ${confirmations.received} of ${confirmations.required}`}
          </p>
        )}

        <p className="mt-2 text-muted-foreground text-sm">
          {store.name} · {invoice.price} {invoice.currency}
        </p>
      </div>

      <CheckoutFooter />
    </CheckoutCard>
  )
}
