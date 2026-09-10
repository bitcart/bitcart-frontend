import { bitcartInvoices, bitcartStores } from "@bitcart/api-sdk/endpoints"
import { useQueryClient, useQueryErrorResetBoundary } from "@tanstack/react-query"
import { createFileRoute, useRouter, type ErrorComponentProps } from "@tanstack/react-router"
import { useCallback, useEffect, useState } from "react"

import { useCountdown } from "#/common/hooks"

import { ErrorFallback } from "./-components/error-fallback"
import { LoadingFallback } from "./-components/loading-fallback"
import { AccordionTemplate } from "./-templates/accordion"

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
  const queryClient = useQueryClient()

  const { data: invoice, queryKey: invoiceQueryKey } = bitcartInvoices.useInvoiceSuspense({
    invoiceId,
  })

  //* The schema allows a storeless invoice, which counts as a malformed response.
  // TODO: Drop once the API schema provides the correct type.
  if (!invoice.store_id) {
    throw new Error(`Invoice ${invoiceId} is not associated with a store`)
  }

  const { data: store } = bitcartStores.useStoreSuspense({ storeId: invoice.store_id })

  const [selectedPaymentIndex, setSelectedPaymentIndex] = useState(0)
  const { formatted: countdownFormatted } = useCountdown(invoice.time_left)

  const handleWsMessage = useCallback(
    (_message: bitcartInvoices.InvoiceWsMessage) => {
      void queryClient.invalidateQueries({ queryKey: invoiceQueryKey })
    },

    [invoiceQueryKey, queryClient],
  )

  bitcartInvoices.useInvoiceWebsocket({
    invoiceId,
    status: invoice.status,
    onMessage: handleWsMessage,
  })

  const templateProps = {
    invoice,
    store,
    currentStatus: invoice.status,
    selectedPaymentIndex,
    setSelectedPaymentIndex,
    countdownFormatted,
  }

  switch (template) {
    //* Accordion is the only ported template so far; the rest get their own cases.
    default:
      return <AccordionTemplate {...templateProps} />
  }
}
