import { useCallback, useMemo, useState } from "react"

import { directoryHooks } from "@/common/data/bitcart/directory"

import type { CatalogEntryCategoryFilterState, CatalogLookup } from "../types"

export const useCatalogLookup = (): CatalogLookup => {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<CatalogEntryCategoryFilterState>("all")

  const [subcategoryFilter, setSubcategoryFilter] =
    useState<directoryHooks.UseCatalogParams["subcategory"]>(undefined)

  const filters = useMemo(
    () => ({ category: categoryFilter, subcategory: subcategoryFilter }),
    [categoryFilter, subcategoryFilter],
  )

  const handleCategoryReset = useCallback(() => setCategoryFilter("all"), [])
  const handleSubcategoryReset = useCallback(() => setSubcategoryFilter(undefined), [])

  const handleFiltersReset = useCallback(() => {
    handleCategoryReset()
    handleSubcategoryReset()
  }, [handleCategoryReset, handleSubcategoryReset])

  const filterControls = useMemo(
    () => ({
      handleCategorySelect: setCategoryFilter,
      handleCategoryReset,
      handleSubcategorySelect: setSubcategoryFilter,
      handleSubcategoryReset,
      handleFiltersReset,
    }),

    [handleCategoryReset, handleFiltersReset, handleSubcategoryReset],
  )

  const { data: result, ...queryResult } = directoryHooks.useCatalog({
    category: categoryFilter === "all" ? undefined : categoryFilter,
    subcategory: subcategoryFilter,
    searchTerm,
  })

  return {
    filters,
    filterControls,
    searchTerm,
    setSearchTerm,
    result,
    ...queryResult,
  }
}
