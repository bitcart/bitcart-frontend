import { ThemeProvider as NextThemesThemeProvider } from "next-themes"

import type { BasicThemeMode } from "../types"

export type ThemeProviderProps = {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => (
  <NextThemesThemeProvider
    disableTransitionOnChange
    attribute="class"
    themes={["light", "dark"] as BasicThemeMode[]}
  >
    {children}
  </NextThemesThemeProvider>
)
