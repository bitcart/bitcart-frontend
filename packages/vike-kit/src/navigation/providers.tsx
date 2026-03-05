import { useEffect } from "react"
import { useIsClient } from "usehooks-ts"
import { usePageContext } from "vike-react/usePageContext"

import { scrollToElement } from "./utils"

export type HashAutoscrollProviderProps = {
  children: React.ReactNode
}

/**
 * Automates [scrollIntoView](https://developer.mozilla.org/docs/Web/API/Element/scrollIntoView)
 * behavior for internal links that contain DOM element ids.
 *
 * **Must wrap the root layout!**
 */
export const HashAutoscrollProvider: React.FC<HashAutoscrollProviderProps> = ({ children }) => {
  const { urlOriginal } = usePageContext()
  const isClient = useIsClient()

  useEffect(() => {
    if (isClient && urlOriginal.includes("#")) {
      const hash = urlOriginal.split("#").at(1)

      if (typeof hash === "string" && hash.length > 0) {
        scrollToElement(`#${hash}`)
      }
    }
  }, [isClient, urlOriginal])

  return children
}
