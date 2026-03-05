import { normalizeSearchTerm } from "@bitcart/core/utils"
import { evolve, filter, map, pipe } from "remeda"

import { fungibleTokenCatalogEntrySearch, type AssetCatalog } from "@/common/data/bitcart"

import type { CoinCatalogLookupResult } from "../types"

export const coinCatalogEntrySearch = (
  data: AssetCatalog,
  searchTerm: string,
): CoinCatalogLookupResult => {
  if (searchTerm) {
    const normalizedSearchTerm = normalizeSearchTerm(searchTerm)

    const entries = pipe(
      data.entries,

      filter<AssetCatalog["entries"], boolean>(
        ({ blockchain, fungibleTokens }) =>
          blockchain.metadata.displayName.toLowerCase().includes(normalizedSearchTerm) ||
          blockchain.intrinsicTokenSymbol.toLowerCase().includes(normalizedSearchTerm) ||
          fungibleTokens.entries.some((tokenSymbol) =>
            tokenSymbol.toLowerCase().includes(normalizedSearchTerm),
          ),
      ),

      map(
        evolve({
          fungibleTokens: (entries) => fungibleTokenCatalogEntrySearch(entries, searchTerm),
        }),
      ),
    )

    return {
      ...data,
      entries,

      searchCounts: {
        blockchains: entries.length,

        fungibleTokens: entries.reduce(
          (acc, { fungibleTokens }) => acc + fungibleTokens.entries.length,
          0,
        ),
      },
    }
  } else {
    return { ...data, searchCounts: data.totalCounts }
  }
}
