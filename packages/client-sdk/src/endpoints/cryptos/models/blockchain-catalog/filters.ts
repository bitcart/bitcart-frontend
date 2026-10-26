import { normalizeSearchTerm } from "@bitcart/core/utils"
import { evolve, filter } from "remeda"

import type { BlockchainCatalog, BlockchainCatalogEntry } from "./types"

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
