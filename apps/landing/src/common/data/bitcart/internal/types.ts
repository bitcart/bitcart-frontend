export type BlockchainId = string

export type FungibleTokenSymbol = string

export type FungibleTokenCatalogEntry = FungibleTokenSymbol

export type BlockchainDisplayName = string

export type BlockchainMetadata = {
  displayName: BlockchainDisplayName
}

export type BlockchainCatalogEntry = {
  id: BlockchainId
  metadata: BlockchainMetadata

  /**
   * A blockchain's inherent digital currency.
   * Also called a "native token", "protocol token", or "built-in token."
   *
   * Every independent blockchain has its own native crypto that is used to reward
   * miners and validators for adding blocks to the blockchain
   * and as a payment medium for transaction fees.
   *
   * In the case of Bitcoin, its only purpose is a cryptocurrency, and its native symbol is BTC.
   *
   * Ethereum's native crypto is ether (ETH); however, along with NFTs and numerous other
   * smart contract-based tokens, Ethereum hosts countless non-native cryptocurrencies.
   */
  intrinsicTokenSymbol: FungibleTokenSymbol
}

export type BlockchainCatalog = {
  entries: BlockchainCatalogEntry[]
  totalCount: number
}

export type FungibleTokenCatalog = {
  entries: FungibleTokenCatalogEntry[]
  totalCount: number
}

/**
 * An asset catalog entry representing a single blockchain
 * and its fungible tokens explicitly registered on the platform.
 */
export type AssetCatalogEntry = {
  blockchain: BlockchainCatalogEntry
  fungibleTokens: FungibleTokenCatalog
}

/**
 * Lists registered assets for each supported blockchain.
 */
export type AssetCatalog = {
  entries: AssetCatalogEntry[]

  totalCounts: {
    /**
     * The total number of supported blockchains.
     * By extension, this is also the total number of catalog entries.
     *
     * ⚠️ Must not be altered by the consuming code.
     */
    blockchains: number

    /**
     * The total number of fungible tokens explicitly registered on the platform.
     * Does not include intrinsic tokens.
     *
     * ⚠️ Must not be altered by the consuming code.
     */
    fungibleTokens: number
  }
}
