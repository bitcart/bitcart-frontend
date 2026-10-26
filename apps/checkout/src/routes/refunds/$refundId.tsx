import type { bitcartInvoices } from "@bitcart/client-sdk/endpoints"
import { useLingui } from "@lingui/react/macro"
import { createFileRoute } from "@tanstack/react-router"
import { AlertCircleIcon } from "lucide-react"

import { CheckoutCard } from "#/checkout"
import { getRefundPage, type CheckoutRefundPage } from "#/checkout/refund/page"
import { CheckoutRefundView } from "#/checkout/runtime/refund-view"
import { preloadRefundSource, useCheckoutSource, useRefundSource } from "#/checkout/runtime/source"

import { CHECKOUT_APP_CONFIG } from "../-components/app-controls"
import { CheckoutHeader } from "../-components/checkout-header"
import { RefundErrorFallback } from "../-components/error-fallback"
import { RefundLoadingFallback } from "../-components/loading-fallback"
import { PoweredByFooter } from "../-components/powered-by-footer"

export const Route = createFileRoute("/refunds/$refundId")({
  component: RefundPage,
  ssr: false,
  loader: ({ context: { queryClient }, params }) =>
    preloadRefundSource(queryClient, params.refundId),
  pendingComponent: RefundLoadingFallback,
  errorComponent: RefundErrorFallback,
})

function RefundPage() {
  const { refundId } = Route.useParams()
  const { refund, submit } = useRefundSource(refundId)

  if (refund.invoice_id) {
    return <InvoiceRefund refund={refund} invoiceId={refund.invoice_id} submit={submit} />
  } else return <RefundUnavailable />
}

function InvoiceRefund({
  refund,
  invoiceId,
  submit,
}: {
  refund: bitcartInvoices.InvoiceRefund
  invoiceId: string
  submit: CheckoutRefundPage["submit"]
}) {
  const { source } = useCheckoutSource(invoiceId)
  const page = getRefundPage(refund, source.invoice, source.policies.explorer_urls, submit)

  return <CheckoutRefundView source={source} page={page} appConfig={CHECKOUT_APP_CONFIG} />
}

function RefundUnavailable() {
  const { t } = useLingui()

  return (
    <CheckoutCard>
      <CheckoutHeader />

      <div className="px-8 py-12 text-center">
        <AlertCircleIcon className="mb-4 size-12 text-muted-foreground mx-auto" />
        <p className="text-lg font-semibold">{t`Refund unavailable`}</p>

        <p className="mt-1 text-muted-foreground text-sm">
          {t`This refund is no longer available. Contact the store that issued it.`}
        </p>
      </div>

      <PoweredByFooter />
    </CheckoutCard>
  )
}
