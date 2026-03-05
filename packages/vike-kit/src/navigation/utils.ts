export const scrollToTop = () => {
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
}

export const scrollToElement = (selector: string) => {
  const element = document.querySelector(selector)

  if (element) {
    element.scrollIntoView({ behavior: "smooth" })
  }
}

export const isExternalLink = (href: string): boolean => {
  return !href.startsWith("/") && !href.startsWith("#")
}

export const getAnchorElementProps = (href: string): React.HTMLProps<HTMLAnchorElement> => {
  if (isExternalLink(href) && !href.startsWith("mailto:")) {
    return {
      target: "_blank",
    }
  } else return {}
}
