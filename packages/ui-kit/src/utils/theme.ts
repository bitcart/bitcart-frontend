import { isNonNullish } from "remeda"

import { THEME_MODES } from "@/constants"
import type { ThemeMode } from "@/types"

export const isThemeMode = (value: string | null | undefined): value is ThemeMode =>
  isNonNullish(value) && THEME_MODES.includes(value as ThemeMode)
