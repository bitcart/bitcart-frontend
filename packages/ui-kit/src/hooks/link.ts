import { useContext } from "react"

import { LinkComponentContext } from "@/contexts/link"
import type { BasicLinkComponent } from "@/types"

export const useLinkComponent = (): BasicLinkComponent => {
  const LinkComponent = useContext(LinkComponentContext)

  if (!LinkComponent) {
    throw new Error("useLinkComponent must be used within a LinkComponentProvider")
  }

  return LinkComponent
}
