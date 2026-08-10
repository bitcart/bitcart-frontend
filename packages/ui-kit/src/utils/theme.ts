import { THEME_MODES } from "@/constants"
import type { ThemeMode } from "@/types"

export const isThemeMode = (value: string | undefined): value is ThemeMode =>
  THEME_MODES.includes(value as ThemeMode)
