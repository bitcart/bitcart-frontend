import { i18n } from "@lingui/core"
import { createFileRoute } from "@tanstack/react-router"
import { useCallback } from "react"

import { preloadCheckoutSource, useCheckoutSource } from "#/checkout/runtime/source"
import { CheckoutView } from "#/checkout/runtime/view"
import { checkoutTemplates } from "#/common/checkout-templates"
import { ENV_TAG } from "#/common/constants"
import { useCatalogLoader } from "#/common/i18n"
import { EMBED_APP_CONFIG, getEmbedHost, isEmbeddedByLoader } from "#/common/integrations/embed"

import { CHECKOUT_APP_CONFIG } from "../-components/app-controls"
import { InvoiceErrorFallback } from "../-components/error-fallback"
import { LoadingFallback } from "../-components/loading-fallback"

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
  //* `embed=v1` is set by the embed loader. `method` preselects a payment method, as in the links
  //* that open the checkout in a wallet app.
  validateSearch: (
    search: Record<string, unknown>,
  ): { template?: string; embed?: "v1"; method?: string } => ({
    template: typeof search.template === "string" ? search.template : undefined,
    embed: search.embed === "v1" ? "v1" : undefined,
    method: typeof search.method === "string" ? search.method : undefined,
  }),

  loaderDeps: ({ search }) => ({ template: search.template }),

  //* Starts every load that depends only on the route in parallel, before the page code loads.
  //* Nothing is awaited: the page suspends, and reports failures, where each result is used.
  loader: ({ context: { queryClient }, params, deps }) => {
    preloadCheckoutSource(queryClient, params.invoiceId)

    const templateId = resolveTemplateId(deps.template)

    void checkoutTemplates.load(templateId).catch(() => undefined)
    void checkoutTemplates.loadCatalog(templateId, i18n.locale).catch(() => undefined)
  },

  //* Doubles as the Suspense fallback.
  pendingComponent: LoadingFallback,
  errorComponent: InvoiceErrorFallback,
})

function InvoicePage() {
  const { invoiceId } = Route.useParams()
  const { template, embed, method } = Route.useSearch()
  const { source, connection } = useCheckoutSource(invoiceId)
  const isEmbeddedCheckout = isEmbeddedByLoader({ embed })

  const templateId = resolveTemplateId(template)

  const appConfig = isEmbeddedCheckout
    ? { ...CHECKOUT_APP_CONFIG, ...EMBED_APP_CONFIG }
    : CHECKOUT_APP_CONFIG

  useCatalogLoader(
    useCallback(
      (locale: string) => checkoutTemplates.loadCatalog(templateId, locale),
      [templateId],
    ),
  )

  return (
    <CheckoutView
      source={source}
      connection={connection}
      registry={checkoutTemplates}
      templateId={templateId}
      appConfig={appConfig}
      initialMethodId={method}
      onModelChange={
        isEmbeddedCheckout ? (_model, { invoice }) => getEmbedHost().report(invoice) : undefined
      }
    />
  )
}
