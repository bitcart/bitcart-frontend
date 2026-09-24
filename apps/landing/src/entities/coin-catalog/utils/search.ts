import { bitcartCryptos } from "@bitcart/api-sdk/endpoints"
import { normalizeSearchTerm } from "@bitcart/core/utils"
import { evolve, filter, map, pipe } from "remeda"

import type { CoinCatalogLookupResult } from "../types"

export const coinCatalogEntrySearch = (
  data: bitcartCryptos.PaymentMethodCatalog,
  searchTerm: string,
): CoinCatalogLookupResult => {
  if (searchTerm) {
    const normalizedSearchTerm = normalizeSearchTerm(searchTerm)

    const entries = pipe(
      data.entries,

      filter<bitcartCryptos.PaymentMethodCatalog["entries"], boolean>(
        ({ blockchain, tokens }) =>
          blockchain.metadata.displayName.toLowerCase().includes(normalizedSearchTerm) ||
          blockchain.intrinsicTokenSymbol.toLowerCase().includes(normalizedSearchTerm) ||
          tokens.entries.some((tokenSymbol) =>
            tokenSymbol.toLowerCase().includes(normalizedSearchTerm),
          ),
      ),

      map(
        evolve({
          tokens: (catalogEntries) =>
            bitcartCryptos.tokenCatalogEntrySearch(catalogEntries, searchTerm),
        }),
      ),
    )

    return {
      ...data,
      entries,

      searchCounts: {
        blockchains: entries.length,

        tokens: entries.reduce((acc, { tokens }) => acc + tokens.entries.length, 0),
      },
    }
  } else {
    return { ...data, searchCounts: data.totalCounts }
  }
}
