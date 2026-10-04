import type { HttpHref } from "@bitcart/core/navigation"

import { CheckoutFooter, ExtensionSlot, StatusOverlay, useCheckout } from ".."

export const CheckoutStatusScreen = () => {
  const { status, store, invoice } = useCheckout("status")

  return (
    <div className="max-w-md rounded-2xl bg-card text-card-foreground shadow-xl w-full overflow-hidden">
      <ExtensionSlot name="checkout:header-extra" className="px-5 py-3" />

      <StatusOverlay
        status={status}
        storeName={store.name}
        invoiceId={invoice.id}
        orderAmount={invoice.price}
        orderCurrency={invoice.currency}
        redirectUrl={(invoice.redirectUrl ?? "") as HttpHref}
      />

      <CheckoutFooter />
    </div>
  )
}
