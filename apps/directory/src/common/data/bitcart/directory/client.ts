import { Effect, identity } from "effect"

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
  Effect.runPromise(
    Effect.promise(getDirectoryEntries).pipe(
      Effect.andThen((data) => ({ entries: data, totalCount: data.length })),

      Effect.andThen(
        category === undefined ? identity : (data) => catalogCategoryFilter(data, category),
      ),

      Effect.andThen(
        subcategory == undefined ? identity : (data) => catalogSubcategoryFilter(data, subcategory),
      ),

      Effect.andThen((data) => catalogEntrySearch(data, searchTerm)),
    ),
  )
