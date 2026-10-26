import type { CheckoutAppearance } from "../model"

const svg = (body: string, width: number, height: number) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${body}</svg>`,
  )}`

const text = (value: string, x: number, length: number, fill: string) =>
  `<text x="${x}" y="68" font-family="Inter, Helvetica, Arial, sans-serif" font-weight="700" font-size="52" textLength="${length}" lengthAdjust="spacingAndGlyphs" fill="${fill}">${value}</text>`

const MARK = `<rect x="0" y="10" width="80" height="80" rx="18" fill="#0e7490"/><path d="M24 30h32M24 50h26M24 70h32M24 30v40" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round"/>`

const wordmark = (fill: string) => svg(`${MARK}${text("Example Store", 100, 380, fill)}`, 500, 100)

const LOGOS = { light: wordmark("#0f172a"), dark: wordmark("#f8fafc") }

const LONG_LOGO = svg(`${MARK}${text("EXAMPLE STORE SUPPLY CO.", 100, 690, "#1c1917")}`, 800, 100)

const ICON = svg(
  `<rect width="100" height="100" rx="22" fill="#0e7490"/><path d="M32 26h38M32 50h30M32 74h38M32 26v48" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round"/>`,
  100,
  100,
)

export const PREVIEW_BRANDS = {
  logo: { logos: LOGOS },
  "long-logo": { logos: { light: LONG_LOGO } },
  "logo-named": { logos: LOGOS, icons: { light: ICON }, useLogoInsteadOfIcon: true },
  icon: { logos: LOGOS, icons: { light: ICON } },
  "dark-logo": { logos: { dark: LOGOS.dark } },
} satisfies Record<string, Omit<CheckoutAppearance, "palette">>

export type CheckoutPreviewBrand = keyof typeof PREVIEW_BRANDS

export const CHECKOUT_PREVIEW_BRAND_IDS = Object.keys(PREVIEW_BRANDS) as CheckoutPreviewBrand[]
