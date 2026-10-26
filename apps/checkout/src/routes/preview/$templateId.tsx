import type { HttpHref, InternalHref } from "@bitcart/core/navigation"
import {
  CHECKOUT_PREVIEW_ENVIRONMENTS,
  CHECKOUT_PREVIEW_EXPIRATIONS,
  CHECKOUT_PREVIEW_METHODS,
  CHECKOUT_PREVIEW_RECEIVED,
  CHECKOUT_PREVIEW_STATUSES,
  CHECKOUT_PREVIEW_VIEWS,
  CHECKOUT_PREVIEW_WALLETS,
  DEFAULT_CHECKOUT_PREVIEW_STATUS,
} from "@bitcart/qa"
import { useCurrentBreakpoint } from "@bitcart/ui-kit/hooks"
import { cn, toast } from "@bitcart/ui-kit/utils"
import type { BreakpointKey } from "@bitcart/unocss-preset"
import { i18n } from "@lingui/core"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { useCallback, useMemo, useState } from "react"
import * as z from "zod"

import { CHECKOUT_PREVIEW_BRAND_IDS } from "#/checkout/preview/brands"
import { CHECKOUT_PREVIEW_SPEED_IDS } from "#/checkout/preview/expiration"
import { CheckoutPreview } from "#/checkout/preview/preview"
import { CHECKOUT_PALETTE_PRESET_IDS, checkoutPaletteSchema } from "#/checkout/theme/palette"
import { checkoutTemplates } from "#/common/checkout-templates"
import { ENV_TAG } from "#/common/constants"
import { useCatalogLoader } from "#/common/i18n"
import { EMBED_APP_CONFIG, getEmbedHost, isEmbeddedByLoader } from "#/common/integrations/embed"

import { CHECKOUT_APP_CONFIG } from "../-components/app-controls"
import { LoadingFallback } from "../-components/loading-fallback"
import { PreviewOptionsBar, PreviewOptionsPanel } from "./-components/preview-options"
import { PreviewSheet, SheetFrameContent } from "./-components/preview-sheet"
import { PREVIEW_SHEET_AXES } from "./-components/sheet"

const previewFlag = z.boolean().optional().catch(undefined)

const WIDE_BREAKPOINTS = new Set<BreakpointKey>(["lg", "xl", "2xl", "3xl"])

export const Route = createFileRoute("/preview/$templateId")({
  component: PreviewPage,
  ssr: false,

  validateSearch: z.object({
    status: z.enum(CHECKOUT_PREVIEW_STATUSES).catch(DEFAULT_CHECKOUT_PREVIEW_STATUS),
    received: z.enum(CHECKOUT_PREVIEW_RECEIVED).optional().catch(undefined),
    method: z.enum(CHECKOUT_PREVIEW_METHODS).optional().catch(undefined),
    discount: previewFlag,
    fee: previewFlag,
    anyAmount: previewFlag,
    recommendedFee: previewFlag,
    senderAddress: previewFlag,
    longPrice: previewFlag,
    longName: previewFlag,
    longCoin: previewFlag,
    customLabel: previewFlag,
    duplicateCoin: previewFlag,
    manyMethods: previewFlag,
    view: z.enum(CHECKOUT_PREVIEW_VIEWS).catch("checkout"),
    environment: z.enum(CHECKOUT_PREVIEW_ENVIRONMENTS).optional().catch(undefined),
    wallet: z.enum(CHECKOUT_PREVIEW_WALLETS).optional().catch(undefined),
    expiration: z.enum(CHECKOUT_PREVIEW_EXPIRATIONS).optional().catch(undefined),
    speed: z.enum(CHECKOUT_PREVIEW_SPEED_IDS).optional().catch(undefined),
    palette: z.enum(CHECKOUT_PALETTE_PRESET_IDS).optional().catch(undefined),
    brand: z.enum(CHECKOUT_PREVIEW_BRAND_IDS).optional().catch(undefined),
    sheet: z.enum(PREVIEW_SHEET_AXES).optional().catch(undefined),
    sheetFrame: previewFlag,
    embed: z.literal("v1").optional().catch(undefined),
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
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const {
    view,
    environment,
    wallet,
    expiration,
    speed,
    palette: preset,
    brand,
    sheet,
    sheetFrame,
    embed,
    ...axes
  } = search

  const isEmbeddedCheckout = isEmbeddedByLoader({ embed })

  const isWide = WIDE_BREAKPOINTS.has(useCurrentBreakpoint())
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)
  const palette = useMemo(() => (preset ? checkoutPaletteSchema.parse({ preset }) : null), [preset])

  const appConfig = useMemo(
    () => ({
      ...CHECKOUT_APP_CONFIG,
      redirect: (url: HttpHref) => toast.info(`A live checkout would now return to ${url}`),
      ...(isEmbeddedCheckout ? EMBED_APP_CONFIG : {}),
      openPage: (href: InternalHref) =>
        href.endsWith("/receipt")
          ? void navigate({ search: (previous) => ({ ...previous, view: "receipt" }) })
          : toast.info(`A live checkout would now open ${href}`),
    }),
    [navigate, isEmbeddedCheckout],
  )

  useCatalogLoader(
    useCallback(
      (locale: string) => checkoutTemplates.loadCatalog(templateId, locale),
      [templateId],
    ),
  )

  const preview = (
    <CheckoutPreview
      registry={checkoutTemplates}
      templateId={templateId}
      axes={axes}
      view={view}
      environment={environment}
      wallet={wallet}
      expiration={expiration}
      speed={speed}
      palette={palette}
      brand={brand}
      appConfig={appConfig}
      showsSimulator={!sheetFrame}
      onModelChange={
        isEmbeddedCheckout ? (_model, { invoice }) => getEmbedHost().report(invoice) : undefined
      }
    />
  )

  if (sheetFrame) {
    return <SheetFrameContent>{preview}</SheetFrameContent>
  } else if (isEmbeddedCheckout) {
    return <div className="gap-4 max-w-lg flex w-full flex-col items-center">{preview}</div>
  } else
    return (
      <div
        className={cn(
          "gap-4 flex w-full flex-col self-start",
          isWide && "gap-6 flex-row items-start",
        )}
      >
        {isWide ? (
          <PreviewOptionsPanel
            isCollapsed={isPanelCollapsed}
            onToggle={() => setIsPanelCollapsed((isCollapsed) => !isCollapsed)}
          />
        ) : (
          <PreviewOptionsBar />
        )}

        <div className="min-w-0 gap-4 flex flex-1 flex-col items-center">
          {sheet ? (
            <PreviewSheet
              key={JSON.stringify(search)}
              axis={sheet}
              templateId={templateId}
              search={search}
            />
          ) : (
            preview
          )}
        </div>
      </div>
    )
}
