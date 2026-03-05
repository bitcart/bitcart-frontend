import type { AssetCatalog } from "@/common/data/bitcart"

export type CoinCatalogLookupResult = AssetCatalog & {
  searchCounts: AssetCatalog["totalCounts"]
}

export type CoinCatalogLookup = {
  searchTerm: string
  setSearchTerm: (query: string) => void
  result: CoinCatalogLookupResult
}
