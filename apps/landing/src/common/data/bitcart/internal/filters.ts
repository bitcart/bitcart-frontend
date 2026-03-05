import { normalizeSearchTerm } from "@bitcart/core/utils"
import { evolve, filter } from "remeda"

import type { BlockchainCatalog, BlockchainCatalogEntry, FungibleTokenCatalog } from "./types"

export const blockchainCatalogEntrySearch = (
  data: BlockchainCatalog,
  searchTerm: string,
): BlockchainCatalog => {
  if (searchTerm) {
    const normalizedSearchTerm = normalizeSearchTerm(searchTerm)

    return evolve(data, {
      entries: filter<BlockchainCatalog["entries"], boolean>(
        ({ metadata, intrinsicTokenSymbol }: BlockchainCatalogEntry) =>
          metadata.displayName.toLowerCase().includes(normalizedSearchTerm) ||
          intrinsicTokenSymbol.toLowerCase().includes(normalizedSearchTerm),
      ),
    })
  } else return data
}

export const fungibleTokenCatalogEntrySearch = (
  data: FungibleTokenCatalog,
  searchTerm: string,
): FungibleTokenCatalog => {
  if (searchTerm) {
    const normalizedSearchTerm = normalizeSearchTerm(searchTerm)

    return evolve(data, {
      entries: filter<FungibleTokenCatalog["entries"], boolean>((tokenSymbol) =>
        tokenSymbol.toLowerCase().includes(normalizedSearchTerm),
      ),
    })
  } else return data
}
