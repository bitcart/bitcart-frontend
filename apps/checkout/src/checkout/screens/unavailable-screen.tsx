import { t } from "@lingui/core/macro"
import { CircleSlashIcon } from "lucide-react"

import { CheckoutCard, CheckoutFooter } from ".."

export const CheckoutUnavailableScreen = () => (
  <CheckoutCard>
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
