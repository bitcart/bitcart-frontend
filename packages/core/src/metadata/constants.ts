import type { DocumentFavicon, DocumentViewportParams } from "./types"

export const DEFAULT_FAVICON: DocumentFavicon = {
  href: "/favicon.ico",
  type: "image/x-icon",
}

export const DEFAULT_VIEWPORT_PARAMS: DocumentViewportParams = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
}

export const BITCART_ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Bitcart",
  url: "https://bitcart.ai",

  sameAs: [
    "https://twitter.com/BitcartCC",
    "https://github.com/bitcart",
    "https://reddit.com/r/Bitcart",
    "https://linkedin.com/company/bitcart",
    "https://instagram.com/bitcartcc",
  ],
} as const

export const VIEWPORT_PARAM_NAMES: Record<keyof DocumentViewportParams, string> = {
  width: "width",
  height: "height",
  initialScale: "initial-scale",
  minimumScale: "minimum-scale",
  maximumScale: "maximum-scale",
  userScalable: "user-scalable",
  viewportFit: "viewport-fit",
  interactiveWidget: "interactive-widget",
}
