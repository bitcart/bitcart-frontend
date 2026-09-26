import type { HttpHref } from "@bitcart/core/navigation"

import { CheckoutFooter, StatusOverlay, useCheckout } from ".."

export const CheckoutStatusScreen = () => {
  const { status, store, invoice } = useCheckout("status")

  return (
    <div className="max-w-md rounded-2xl bg-card text-card-foreground shadow-xl w-full overflow-hidden">
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
