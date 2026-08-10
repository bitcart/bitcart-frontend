import { useSyncExternalStore } from "react"

import { THEME_MODE_MUTATION_OBSERVATION_SCOPE } from "@/constants"
import type { BasicThemeMode } from "@/types"

export { useTheme, type UseThemeProps } from "next-themes"

const subscribeToDocumentThemeMode = (onModeChange: () => void) => {
  const observer = new MutationObserver(onModeChange)

  observer.observe(document.documentElement, THEME_MODE_MUTATION_OBSERVATION_SCOPE)

  return () => observer.disconnect()
}

const getDocumentThemeMode = (): BasicThemeMode =>
  document.documentElement.classList.contains("dark") ? "dark" : "light"

const getServerThemeMode = (): BasicThemeMode => "light"

/**
 * Directly tracks the theme mode contained in the classlist of `<html>`.
 */
export const useDocumentThemeMode = (): BasicThemeMode =>
  useSyncExternalStore(subscribeToDocumentThemeMode, getDocumentThemeMode, getServerThemeMode)
