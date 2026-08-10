export const APP_NAME = "ui-docs"
export const APP_CANONICAL_NAME = "Bitcart UI SDK Documentation"
export const APP_CONTENT_SOURCE_DIR = "content/docs"
export const APP_CONTENT_ROOT_ROUTE = "/"

export const APP_SOURCE_PUBLIC_REPO_PARAMS = {
  hostEndpoint: "https://github.com",
  user: "bitcart",
  repo: "bitcart-frontend",
  branch: "master",
}

export const APP_SOURCE_PUBLIC_REPO_DIRECTORY = `${APP_SOURCE_PUBLIC_REPO_PARAMS.hostEndpoint}/${
  APP_SOURCE_PUBLIC_REPO_PARAMS.user
}/${APP_SOURCE_PUBLIC_REPO_PARAMS.repo}/tree/${
  APP_SOURCE_PUBLIC_REPO_PARAMS.branch
}/apps/${APP_NAME}`

export const APP_SOURCE_PUBLIC_REPO_CONTENT_DIRECTORY = `${
  APP_SOURCE_PUBLIC_REPO_DIRECTORY
}/${APP_CONTENT_SOURCE_DIR}`

export const BRANDS = ["landing", "directory"] as const
export type Brand = (typeof BRANDS)[number]

export const MODES = ["light", "dark"] as const
export type Mode = (typeof MODES)[number]

export type ThemeKey = `${Brand}-${Mode}`

export const THEME_KEYS: ThemeKey[] = BRANDS.flatMap((brand) =>
  MODES.map((mode) => `${brand}-${mode}` as ThemeKey),
)

export const DEFAULT_THEME_KEY: ThemeKey = "landing-light"

/**
 * next-themes `value` mapping: the stored theme key carries brand and mode, but only
 * the mode may reach the `class` attribute, since Fumadocs styling and the brand
 * stylesheets' dark selector both key off the `light`/`dark` classes.
 */
export const THEME_MODE_CLASS_BY_KEY = Object.fromEntries(
  THEME_KEYS.map((themeKey) => [themeKey, themeKey.split("-")[1] as Mode]),
) as Record<ThemeKey, Mode>
