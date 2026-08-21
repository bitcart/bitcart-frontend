import { ThemeProvider as NextThemesThemeProvider } from "next-themes"
import { useState } from "react"

import type { BasicThemeMode, ThemeMode } from "../types"
import { isThemeMode } from "../utils/theme"

const DEFAULT_THEME_MODE: ThemeMode = "system"
const THEME_STORAGE_KEY = "theme"

/**
 * Repairs an invalid persisted theme value.
 */
const resetInvalidPersistedTheme = (): void => {
  if (typeof window !== "undefined") {
    const persistedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

    if (!isThemeMode(persistedTheme)) {
      window.localStorage.setItem(THEME_STORAGE_KEY, DEFAULT_THEME_MODE)
    }
  }
}

export type ThemeProviderProps = {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  //* Lazy state runs the repair in this render, ahead of next-themes reading storage in its own.
  useState(resetInvalidPersistedTheme)

  return (
    <NextThemesThemeProvider
      disableTransitionOnChange
      attribute="class"
      storageKey={THEME_STORAGE_KEY}
      themes={["light", "dark"] as BasicThemeMode[]}
    >
      {children}
    </NextThemesThemeProvider>
  )
}
