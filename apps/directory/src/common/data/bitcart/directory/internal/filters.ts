import { normalizeSearchTerm } from "@bitcart/core/utils"
import { evolve, filter } from "remeda"

import type { DirectoryCatalog } from "./types"

export const catalogCategoryFilter = (
  data: DirectoryCatalog,
  targetCategory: string,
): DirectoryCatalog =>
  evolve(data, {
    entries: filter<DirectoryCatalog["entries"], boolean>(
      ({ category }) => category === targetCategory,
    ),
  })

export const catalogSubcategoryFilter = (
  data: DirectoryCatalog,
  targetSubcategory: string,
): DirectoryCatalog =>
  evolve(data, {
    entries: filter<DirectoryCatalog["entries"], boolean>(
      ({ subcategory }) => subcategory === targetSubcategory,
    ),
  })

export const catalogEntrySearch = (
  data: DirectoryCatalog,
  searchTerm: string,
): DirectoryCatalog => {
  if (searchTerm) {
    const normalizedSearchTerm = normalizeSearchTerm(searchTerm)

    return evolve(data, {
      entries: filter<DirectoryCatalog["entries"], boolean>(
        (entry) =>
          entry.name.toLowerCase().includes(normalizedSearchTerm) ||
          entry.description.toLowerCase().includes(normalizedSearchTerm),
      ),
    })
  } else return data
}
