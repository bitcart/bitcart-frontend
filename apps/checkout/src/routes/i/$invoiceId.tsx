import { useTheme } from "@bitcart/ui-kit/hooks"
import { useQueryClient, useQueryErrorResetBoundary } from "@tanstack/react-query"
import { createFileRoute, useRouter, type ErrorComponentProps } from "@tanstack/react-router"
import { useCallback, useEffect, useState } from "react"

import { bitcartHooks } from "#/common/data/bitcart"
import type { InvoiceStatus, InvoiceWsMessage } from "#/common/data/bitcart/types"
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
  const { setTheme } = useTheme()

  const { data: invoice } = bitcartHooks.useInvoice(invoiceId)
  const { data: store } = bitcartHooks.useStore(invoice.store_id)

  const [currentStatus, setCurrentStatus] = useState<InvoiceStatus>(invoice.status)
  const [selectedPaymentIndex, setSelectedPaymentIndex] = useState(0)

  const { formatted: countdownFormatted } = useCountdown(invoice.time_left)

  const handleWsMessage = useCallback(
    (message: InvoiceWsMessage) => {
      setCurrentStatus(message.status)
      void queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] })
    },
    [queryClient, invoiceId],
  )

  bitcartHooks.useInvoiceWebsocket({
    invoiceId,
    status: currentStatus,
    onMessage: handleWsMessage,
  })

  useEffect(() => {
    setTheme(store.checkout_settings.use_dark_mode ? "dark" : "light")
  }, [setTheme, store.checkout_settings.use_dark_mode])

  const templateProps = {
    invoice,
    store,
    currentStatus,
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
