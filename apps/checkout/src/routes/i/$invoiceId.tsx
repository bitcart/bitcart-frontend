import { bitcartInvoices, bitcartManage, bitcartStores } from "@bitcart/api-sdk/endpoints"
import { useQueryErrorResetBoundary } from "@tanstack/react-query"
import { createFileRoute, useRouter, type ErrorComponentProps } from "@tanstack/react-router"
import { useCallback, useEffect } from "react"

import { useCheckoutSource } from "#/checkout/runtime/source"
import { CheckoutView } from "#/checkout/runtime/view"
import { checkoutTemplates } from "#/common/checkout-templates"
import { ENV_TAG } from "#/common/constants"

import { AppControls } from "./-components/app-controls"
import { ErrorFallback } from "./-components/error-fallback"
import { LoadingFallback } from "./-components/loading-fallback"

const CHECKOUT_APP_CONFIG = { controls: <AppControls /> }

const resolveTemplateId = (requested: string | undefined) =>
  checkoutTemplates.resolve({
    requested,

    // TODO: Read the store's checkout template once the API schema provides it.
    stored: undefined,

    allowRequested: ENV_TAG !== "production",
  })

export const Route = createFileRoute("/i/$invoiceId")({
  component: InvoicePage,
  ssr: false,

  //* The `template` search param previews another checkout template, and is ignored in production.
  validateSearch: (search: Record<string, unknown>) => ({
    template: typeof search.template === "string" ? search.template : undefined,
  }),

  loaderDeps: ({ search }) => ({ template: search.template }),

  //* Starts every load that depends only on the route in parallel, before the page code loads.
  //* Nothing is awaited: the page suspends, and reports failures, where each result is used.
  loader: ({ context: { queryClient }, params, deps }) => {
    void queryClient
      .query(bitcartInvoices.invoiceQueryOptions(params.invoiceId))
      .then(({ store_id }) =>
        store_id ? queryClient.query(bitcartStores.storeQueryOptions(store_id)) : undefined,
      )
      .catch(() => undefined)

    void queryClient.query(bitcartManage.policiesQueryOptions()).catch(() => undefined)
    void checkoutTemplates.load(resolveTemplateId(deps.template)).catch(() => undefined)
  },

  //* Doubles as the Suspense fallback.
  pendingComponent: LoadingFallback,
  errorComponent: InvoiceErrorFallback,
})

function InvoiceErrorFallback({ error, reset }: ErrorComponentProps) {
  const router = useRouter()
  const { reset: resetQueryErrors } = useQueryErrorResetBoundary()

  //* Suspense queries rethrow their cached errors until the query cache is reset with the boundary.
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
  const { source, connection } = useCheckoutSource(invoiceId)

  const templateId = resolveTemplateId(template)

  return (
    <CheckoutView
      source={source}
      connection={connection}
      registry={checkoutTemplates}
      templateId={templateId}
      appConfig={CHECKOUT_APP_CONFIG}
    />
  )
}
