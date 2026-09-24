import { bitcartInvoices, bitcartStores } from "@bitcart/api-sdk/endpoints"
import { useCountdown } from "@bitcart/hooks"
import { useQueryErrorResetBoundary } from "@tanstack/react-query"
import { createFileRoute, useRouter, type ErrorComponentProps } from "@tanstack/react-router"
import { useCallback, useEffect, useState } from "react"
import { isDefined } from "remeda"

import { ErrorFallback } from "./-components/error-fallback"
import { LoadingFallback } from "./-components/loading-fallback"
import { AccordionTemplate } from "./-templates/accordion"

const INVOICE_DATA_REFETCH_INTERVAL_MS = 30_000

export const Route = createFileRoute("/i/$invoiceId")({
  component: InvoicePage,
  ssr: false,

  //* Picks the checkout template, the way the drafts' `?variant=` did.
  validateSearch: (search: Record<string, unknown>) => ({
    template: typeof search.template === "string" ? search.template : undefined,
  }),

  //* Doubles as the Suspense fallback.
  pendingComponent: LoadingFallback,
  errorComponent: InvoiceErrorFallback,
})

function InvoiceErrorFallback({ error, reset }: ErrorComponentProps) {
  const router = useRouter()
  const { reset: resetQueryErrors } = useQueryErrorResetBoundary()

  //* Suspense queries rethrow their cached error until the query cache is reset alongside the boundary.
  useEffect(() => {
    resetQueryErrors()
  }, [resetQueryErrors])

  const handleRetry = useCallback(() => {
    reset()
    void router.invalidate()
  }, [reset, router])

  return <ErrorFallback error={error} retry={handleRetry} />
}

function InvoicePage() {
  const { invoiceId } = Route.useParams()
  const { template } = Route.useSearch()
  const [activePaymentMethodIndex, setActivePaymentMethodIndex] = useState(0)

  const { data: invoice, refetch: refetchInvoice } = bitcartInvoices.useInvoiceSuspense(
    invoiceId,

    {
      query: {
        refetchInterval: ({ state: { data: invoiceData } }) =>
          isDefined(invoiceData) && bitcartInvoices.isTerminalStatus(invoiceData.status)
            ? false
            : INVOICE_DATA_REFETCH_INTERVAL_MS,
      },
    },
  )

  //* The schema allows a storeless invoice, which counts as a malformed response.
  // TODO: Drop once the API schema provides the correct type.
  if (!invoice.store_id) {
    throw new Error(`Invoice ${invoiceId} is not associated with a store`)
  }

  const { data: store } = bitcartStores.useStoreSuspense(invoice.store_id)
  const refreshInvoiceData = useCallback(() => void refetchInvoice(), [refetchInvoice])
  const { formatted: countdownFormatted } = useCountdown(invoice.time_left)

  const invoiceWsConnectionHandle = bitcartInvoices.useInvoiceWebsocket({
    invoiceId,
    status: invoice.status,
    onMessage: refreshInvoiceData,
    onConnect: refreshInvoiceData,
  })

  const templateProps = {
    activePaymentMethodIndex,
    countdownFormatted,
    currentStatus: invoice.status,
    invoice,
    invoiceWsConnectionHandle,
    onPaymentMethodSelect: setActivePaymentMethodIndex,
    store,
  }

  switch (template) {
    //* Accordion is the only ported template so far; the rest get their own cases.
    default:
      return <AccordionTemplate {...templateProps} />
  }
}
