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
