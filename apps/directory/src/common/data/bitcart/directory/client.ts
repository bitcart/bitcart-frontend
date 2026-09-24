import { identity, pipe } from "remeda"

import {
  catalogCategoryFilter,
  catalogEntrySearch,
  catalogSubcategoryFilter,
} from "./internal/filters"
import { getDirectoryEntries } from "./internal/requests"
import type { DirectoryCatalog, DirectoryEntry } from "./internal/types"

export { getDirectoryCategories as getCategories } from "./internal/requests"

export type GetCatalogParams = {
  category?: DirectoryEntry["category"]
  subcategory?: DirectoryEntry["subcategory"]
  searchTerm?: string
}

export const getCatalog = (
  { category, subcategory, searchTerm = "" }: GetCatalogParams | undefined = { searchTerm: "" },
): Promise<DirectoryCatalog> =>
  getDirectoryEntries().then((entries) =>
    pipe(
      { entries, totalCount: entries.length },

      category === undefined ? identity() : (data) => catalogCategoryFilter(data, category),

      subcategory === undefined
        ? identity()
        : (data) => catalogSubcategoryFilter(data, subcategory),

      (data) => catalogEntrySearch(data, searchTerm),
    ),
  )
