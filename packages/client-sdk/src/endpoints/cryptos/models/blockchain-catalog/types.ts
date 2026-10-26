import type { BlockchainDisplayName, BlockchainId, TokenSymbol } from "#/endpoints/cryptos/types"

export type BlockchainCatalogEntry = {
  id: BlockchainId

  metadata: {
    displayName: BlockchainDisplayName
  }

  /**
   * A blockchain's inherent digital currency.
   * AKA "native token", "protocol token", or "built-in token."
   */
  intrinsicTokenSymbol: TokenSymbol
}

export type BlockchainCatalog = {
  entries: BlockchainCatalogEntry[]
  totalCount: number
}
