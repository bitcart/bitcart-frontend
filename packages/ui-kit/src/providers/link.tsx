import { LinkComponentContext } from "@/contexts/link"
import type { BasicLinkComponent } from "@/types"

export type LinkComponentProviderProps = {
  LinkComponent: BasicLinkComponent
  children: React.ReactNode
}

export const LinkComponentProvider: React.FC<LinkComponentProviderProps> = ({
  LinkComponent,
  children,
}) => {
  return (
    <LinkComponentContext.Provider value={LinkComponent}>{children}</LinkComponentContext.Provider>
  )
}
