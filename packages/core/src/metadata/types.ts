import type { InternalHref } from "../navigation"

export type DocumentImageMimeType = "image/png" | "image/jpeg" | "image/gif" | "image/webp"

export type DocumentFaviconMimeType = DocumentImageMimeType | "image/x-icon" | "image/svg+xml"

export type DocumentFavicon = {
  href: InternalHref
  type: DocumentFaviconMimeType
}

export type DocumentViewportParams = {
  width?: "device-width" | number
  height?: "device-height" | number
  initialScale?: number
  minimumScale?: number
  maximumScale?: number
  userScalable?: "yes" | "no"
  viewportFit?: "auto" | "contain" | "cover"
  interactiveWidget?: "resizes-content" | "resizes-visual" | "overlays-content"
}

export interface StaticDocumentMetadata {
  author: string
  title: string
  description: string

  image: {
    src: string
    alt: string
    type: DocumentImageMimeType
    width: string
    height: string
    secureUrl?: string
  }
}

export interface DocumentMetadata extends StaticDocumentMetadata {
  locale: string
  url: string
  baseUrl: string
}

export type DocumentHeadMetaTagAttributes = {
  charSet?: string
  content?: string
  httpEquiv?: string
  itemProp?: string
  media?: string
  name?: string
  property?: string
}

export type DocumentHeadLinkTagAttributes = {
  as?: string
  blocking?: "render"
  crossOrigin?: "anonymous" | "use-credentials" | ""
  fetchPriority?: "high" | "low" | "auto"
  href?: string
  hrefLang?: string
  imageSizes?: string
  imageSrcSet?: string
  integrity?: string
  media?: string

  referrerPolicy?:
    | ""
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "origin"
    | "origin-when-cross-origin"
    | "same-origin"
    | "strict-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url"

  rel?: string
  sizes?: string
  title?: string
  type?: string
}

export type DocumentHeadManifest = {
  meta: DocumentHeadMetaTagAttributes[]
  links: DocumentHeadLinkTagAttributes[]
}
