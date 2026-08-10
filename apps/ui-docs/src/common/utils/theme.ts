import { type Brand, DEFAULT_THEME_KEY, type Mode, THEME_KEYS, type ThemeKey } from "../constants"

export const parseThemeKey = (themeKey: string | undefined): { brand: Brand; mode: Mode } => {
  const [brand, mode] = (
    THEME_KEYS.includes(themeKey as ThemeKey) ? (themeKey as ThemeKey) : DEFAULT_THEME_KEY
  ).split("-") as [Brand, Mode]

  return { brand, mode }
}
