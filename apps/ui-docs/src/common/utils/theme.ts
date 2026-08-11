import { type Brand, BRANDS, DEFAULT_BRAND, DEFAULT_MODE, type Mode, MODES } from "../constants"

export const resolveBrand = (brand: string | null | undefined): Brand =>
  BRANDS.includes(brand as Brand) ? (brand as Brand) : DEFAULT_BRAND

export const resolveMode = (resolvedTheme: string | undefined): Mode =>
  MODES.includes(resolvedTheme as Mode) ? (resolvedTheme as Mode) : DEFAULT_MODE
