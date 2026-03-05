import { useMemo, useState } from "react"

import { bitcartHooks } from "@/common/data/bitcart"

import type { CoinCatalogLookup } from "../types"
import { coinCatalogEntrySearch } from "../utils/search"

export const useCoinCatalogLookup = (): CoinCatalogLookup => {
  const [searchTerm, setSearchTerm] = useState("")
  const { data, ...queryResult } = bitcartHooks.useAssetCatalog()
  const result = useMemo(() => coinCatalogEntrySearch(data, searchTerm), [data, searchTerm])

  return {
    searchTerm,
    setSearchTerm,
    result,
    ...queryResult,
  }
}
