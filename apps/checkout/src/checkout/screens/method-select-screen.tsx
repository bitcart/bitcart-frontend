import { Button } from "@bitcart/ui-kit/components"
import { t } from "@lingui/core/macro"

import {
  CHECKOUT_METHOD_SELECTOR_TESTID,
  CheckoutCard,
  CheckoutFooter,
  ExtensionSlot,
  useCheckout,
} from ".."

export const CheckoutMethodSelectScreen = () => {
  const { methods, selectMethod, cancelChange } = useCheckout("select")

  return (
    <CheckoutCard>
      <ExtensionSlot name="checkout:header-extra" className="px-5 pt-5" />

      <div className="p-5 gap-4 flex flex-col">
        <p className="text-base font-semibold">{t`Choose a payment method`}</p>

        <div className="gap-2 grid grid-cols-2" data-testid={CHECKOUT_METHOD_SELECTOR_TESTID}>
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
