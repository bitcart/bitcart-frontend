import type { DestinationTypeAwareLinkInputs, DestinationTypeAwareLinkProps } from "@/types"

export const isExternalHref = (href: string): boolean => {
  return !href.startsWith("/") && !href.startsWith("#")
}

export const getDestinationTypeAwareLinkProps = ({
  href,
  isOriginAware = true,
}: DestinationTypeAwareLinkInputs): DestinationTypeAwareLinkProps => {
  if (isExternalHref(href) && !href.startsWith("mailto:")) {
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
