import { createFileRoute, Navigate } from "@tanstack/react-router"

import { CheckoutReceiptView } from "#/checkout/runtime/receipt-view"
import { preloadCheckoutSource, useCheckoutSource } from "#/checkout/runtime/source"

import { CHECKOUT_APP_CONFIG } from "../-components/app-controls"
import { InvoiceErrorFallback } from "../-components/error-fallback"
import { ReceiptLoadingFallback } from "../-components/loading-fallback"

export const Route = createFileRoute("/i/$invoiceId_/receipt")({
  component: ReceiptPage,
  ssr: false,
  loader: ({ context: { queryClient }, params }) =>
    preloadCheckoutSource(queryClient, params.invoiceId),
  pendingComponent: ReceiptLoadingFallback,
  errorComponent: InvoiceErrorFallback,
})

function ReceiptPage() {
  const { invoiceId } = Route.useParams()
  const { source } = useCheckoutSource(invoiceId)

  return (
    <CheckoutReceiptView
      source={source}
      appConfig={CHECKOUT_APP_CONFIG}
      unavailable={<Navigate to="/i/$invoiceId" params={{ invoiceId }} replace />}
    />
  )
}
