import type {
  DestinationTypeAwareLinkInputs,
  DestinationTypeAwareLinkProps,
  ExternalHref,
  InternalHref,
} from "./types"

const APP_HANDOFF_HREF_PREFIXES = ["mailto:", "tel:"] as const
const EXTERNAL_HREF_PREFIXES = ["//", "http://", "https://", "mailto:", "tel:"] as const

export const isAppHandoffHref = (href: string): boolean =>
  APP_HANDOFF_HREF_PREFIXES.some((prefix) => href.startsWith(prefix))

/**
 * Narrows an href to the same-origin shapes {@link InternalHref} admits:
 * an absolute path, a bare fragment, or a bare query string.
 */
export const isInternalHref = (href: string): href is InternalHref => {
  //* For protocol-relative URLs, e.g. `//cdn.example.com`.
  if (href.startsWith("//")) {
    return false
  } else return href.startsWith("/") || href.startsWith("#") || href.startsWith("?")
}

/**
 * Narrows an href to the cross-origin shapes {@link ExternalHref} admits.
 */
export const isExternalHref = (href: string): href is ExternalHref =>
  EXTERNAL_HREF_PREFIXES.some((prefix) => href.startsWith(prefix))

export const getDestinationTypeAwareLinkProps = ({
  href,
  isOriginAware = true,
}: DestinationTypeAwareLinkInputs): DestinationTypeAwareLinkProps => {
  if (isExternalHref(href) && !isAppHandoffHref(href)) {
    return {
      target: "_blank",
      rel: isOriginAware ? "noopener" : "noopener noreferrer",
    }
  } else return {}
}

/**
 * Returns the current `window.location` object on the client, or `null` otherwise.
 */
export const getWindowLocation = (): Location | null =>
  typeof window === "undefined" ? null : window.location
