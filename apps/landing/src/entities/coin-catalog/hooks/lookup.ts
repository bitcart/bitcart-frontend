import { bitcartCryptos } from "@bitcart/api-sdk/endpoints"
import { useMemo, useState } from "react"

import type { CoinCatalogLookup } from "../types"
import { coinCatalogEntrySearch } from "../utils/search"

export const useCoinCatalogLookup = (): CoinCatalogLookup => {
  const [searchTerm, setSearchTerm] = useState("")
  const { data, ...queryResult } = bitcartCryptos.usePaymentMethodCatalogSuspense()
  const result = useMemo(() => coinCatalogEntrySearch(data, searchTerm), [data, searchTerm])

  return {
    searchTerm,
    setSearchTerm,
    result,
    ...queryResult,
  }
}
