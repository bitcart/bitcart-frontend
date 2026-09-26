import { Button } from "@bitcart/ui-kit/components"
import { t } from "@lingui/core/macro"

import { CheckoutCard, CheckoutFooter, useCheckout } from ".."

export const CheckoutMethodSelectScreen = () => {
  const { methods, selectMethod, cancelChange } = useCheckout("select")

  return (
    <CheckoutCard>
      <div className="p-5 gap-4 flex flex-col">
        <p className="text-base font-semibold">{t`Choose a payment method`}</p>

        <div className="gap-2 grid grid-cols-2">
          {methods.map((method) => (
            <Button key={method.id} variant="outline" onClick={() => selectMethod(method.id)}>
              {method.name}
            </Button>
          ))}
        </div>

        {cancelChange && (
          <Button variant="ghost" onClick={cancelChange}>
            {t`Cancel`}
          </Button>
        )}
      </div>

      <CheckoutFooter />
    </CheckoutCard>
  )
}
