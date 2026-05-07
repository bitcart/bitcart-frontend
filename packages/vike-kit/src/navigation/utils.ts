export const isExternalHref = (href: string): boolean => {
  return !href.startsWith("/") && !href.startsWith("#")
}

export const getAnchorElementProps = (
  href: string,
  additionalProps?: object,
): React.HTMLProps<HTMLAnchorElement> => {
  if (isExternalHref(href) && !href.startsWith("mailto:")) {
    return {
      target: "_blank",
      rel: "noopener",
      ...additionalProps,
    }
  } else return additionalProps ?? {}
}

/**
 * Returns the current `window.location` object on the client, or `null` otherwise.
 */
export const getWindowLocation = (): Location | null =>
  typeof window === "undefined" ? null : window.location
