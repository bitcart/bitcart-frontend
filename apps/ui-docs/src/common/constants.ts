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

export const SYSTEM_MODE = "system" as const

export type ModeSelection = Mode | typeof SYSTEM_MODE

export const MODE_SELECTIONS: ModeSelection[] = [SYSTEM_MODE, ...MODES]

export const DEFAULT_BRAND: Brand = "landing"
export const DEFAULT_MODE: Mode = "light"

export const BRAND_STORAGE_KEY = "brand"
export const MODE_STORAGE_KEY = "theme"
