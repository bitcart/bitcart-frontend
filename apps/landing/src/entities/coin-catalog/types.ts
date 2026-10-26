import { bitcartCryptos } from "@bitcart/client-sdk/endpoints"

export type CoinCatalogLookupResult = bitcartCryptos.PaymentMethodCatalog & {
  searchCounts: bitcartCryptos.PaymentMethodCatalog["totalCounts"]
}

export type CoinCatalogLookup = {
  searchTerm: string
  setSearchTerm: (query: string) => void
  result: CoinCatalogLookupResult
}
