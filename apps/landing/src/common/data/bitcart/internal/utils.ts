import { unique } from "remeda"

import type { AssetCatalog, FungibleTokenSymbol } from "./types"

export const extractFungibleTokenSymbols = (assetCatalog: AssetCatalog): FungibleTokenSymbol[] => {
  return unique(
    assetCatalog.entries
      .map(({ blockchain, fungibleTokens }) => [
        blockchain.intrinsicTokenSymbol,
        ...fungibleTokens.entries,
      ])
      .flat(),
  )
}
