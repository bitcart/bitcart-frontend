import { normalizeSearchTerm } from "@bitcart/core/utils"
import { evolve, filter } from "remeda"

import type { TokenCatalog } from "./types"

export const tokenCatalogEntrySearch = (data: TokenCatalog, searchTerm: string): TokenCatalog => {
  if (searchTerm) {
    const normalizedSearchTerm = normalizeSearchTerm(searchTerm)

    return evolve(data, {
      entries: filter<TokenCatalog["entries"], boolean>((tokenSymbol) =>
        tokenSymbol.toLowerCase().includes(normalizedSearchTerm),
      ),
    })
  } else return data
}
