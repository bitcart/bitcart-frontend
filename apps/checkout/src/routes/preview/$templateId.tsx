import { CHECKOUT_PREVIEW_STATUSES, DEFAULT_CHECKOUT_PREVIEW_STATUS } from "@bitcart/qa"
import { i18n } from "@lingui/core"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { useCallback, useMemo } from "react"
import * as z from "zod"

import { CheckoutPreview } from "#/checkout/preview/preview"
import { CHECKOUT_PALETTE_PRESET_IDS, checkoutPaletteSchema } from "#/checkout/theme/palette"
import { checkoutTemplates } from "#/common/checkout-templates"
import { ENV_TAG } from "#/common/constants"
import { useCatalogLoader } from "#/common/i18n"

import { CHECKOUT_APP_CONFIG } from "../-components/app-controls"
import { LoadingFallback } from "../-components/loading-fallback"
import { PreviewOptions } from "./-components/preview-options"

export const Route = createFileRoute("/preview/$templateId")({
  component: PreviewPage,
  ssr: false,

  validateSearch: z.object({
    status: z.enum(CHECKOUT_PREVIEW_STATUSES).catch(DEFAULT_CHECKOUT_PREVIEW_STATUS),
    palette: z.enum(CHECKOUT_PALETTE_PRESET_IDS).optional().catch(undefined),
  }),

  beforeLoad: ({ params }) => {
    if (ENV_TAG === "production" || !checkoutTemplates.ids.includes(params.templateId)) {
      throw notFound() as Error
    }
  },

  loader: ({ params }) => {
    void checkoutTemplates.load(params.templateId).catch(() => undefined)
    void checkoutTemplates.loadCatalog(params.templateId, i18n.locale).catch(() => undefined)
  },

  //* Doubles as the Suspense fallback.
  pendingComponent: LoadingFallback,
  notFoundComponent: PreviewNotFound,
})

function PreviewNotFound() {
  return (
    <p className="text-muted-foreground text-sm">
      No checkout template matches this preview address.
    </p>
  )
}

function PreviewPage() {
  const { templateId } = Route.useParams()
  const { status, palette: preset } = Route.useSearch()
  const palette = useMemo(() => (preset ? checkoutPaletteSchema.parse({ preset }) : null), [preset])

  useCatalogLoader(
    useCallback(
      (locale: string) => checkoutTemplates.loadCatalog(templateId, locale),
      [templateId],
    ),
  )

  return (
    <div className="gap-4 flex w-full flex-col items-center">
      <PreviewOptions />

      <CheckoutPreview
        registry={checkoutTemplates}
        templateId={templateId}
        status={status}
        palette={palette}
        appConfig={CHECKOUT_APP_CONFIG}
      />
    </div>
  )
}
