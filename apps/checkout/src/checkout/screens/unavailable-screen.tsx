import { useLingui } from "@lingui/react/macro"
import { CircleSlashIcon } from "lucide-react"

import { CheckoutCard, CheckoutFooter, ExtensionSlot } from ".."

export const CheckoutUnavailableScreen = () => {
  const { t } = useLingui()

  return (
    <CheckoutCard>
      <ExtensionSlot name="checkout:header-extra" className="px-5 pt-5" />

      <div className="px-8 py-12 text-center">
        <CircleSlashIcon className="mb-4 size-12 text-muted-foreground mx-auto" />
        <p className="text-lg font-semibold">{t`No payment methods are available for this invoice`}</p>

        <p className="mt-1 text-muted-foreground text-sm">
          {t`Please contact the store to complete your order.`}
        </p>
      </div>

      <CheckoutFooter />
    </CheckoutCard>
  )
}
