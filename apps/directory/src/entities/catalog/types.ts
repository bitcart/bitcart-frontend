import type { DirectoryCatalog, DirectoryEntryCategoryId } from "@/common/data/bitcart/directory"

export type CatalogEntryCategoryId = DirectoryEntryCategoryId

export type CatalogEntryExtraBadgeVariant = "sponsor" | "official"

export type CatalogEntryBadgeVariant = CatalogEntryCategoryId | CatalogEntryExtraBadgeVariant

export type CatalogEntryCategoryFilterState = CatalogEntryCategoryId | "all"

export type CatalogLookupResult = DirectoryCatalog

export type CatalogLookup = {
  filters: {
    category: CatalogEntryCategoryFilterState
    subcategory?: string
  }

  filterControls: {
    handleCategorySelect: (category: CatalogEntryCategoryFilterState) => void
    handleCategoryReset: VoidFunction
    handleSubcategorySelect: (subcategory?: string) => void
    handleSubcategoryReset: VoidFunction
    handleFiltersReset: VoidFunction
  }

  searchTerm: string
  setSearchTerm: (query: string) => void
  result: CatalogLookupResult
}
