import type { CatalogEntryCategoryId } from "./types"

export const CATALOG_ENTRY_SELFCONTAINED_CATEGORY_IDS: CatalogEntryCategoryId[] = [
  "app",
  "host",
] as const

export const CATALOG_ENTRY_SUPERCATEGORY_ID = "merchant" as const

export const CATALOG_ENTRY_CATEGORY_IDS: CatalogEntryCategoryId[] = [
  ...CATALOG_ENTRY_SELFCONTAINED_CATEGORY_IDS,
  CATALOG_ENTRY_SUPERCATEGORY_ID,
]
