import { ThemeProvider } from "@/providers"
import type { BasicLinkComponent, LayoutConfig } from "@/types"
import { cn } from "@/utils"

import { Toaster } from "../molecules/toaster"

export type WebappLayoutProps = {
  LinkComponent: BasicLinkComponent
  config: () => LayoutConfig
  classNames?: { root?: string }
  children: React.ReactNode
}

export const WebappLayout: React.FC<WebappLayoutProps> = ({ classNames, children }) => {
  return (
    <ThemeProvider>
      <div className={cn("", classNames?.root)}>{children}</div>
      <Toaster position="top-center" />
    </ThemeProvider>
  )
}
