import type { BlockchainCatalogEntry } from "../blockchain-catalog"
import type { TokenCatalog } from "../token-catalog"

/**
 * A payment method catalog entry representing a single blockchain
 * and its fungible tokens explicitly registered on the platform.
 */
export type PaymentMethodCatalogEntry = {
  blockchain: BlockchainCatalogEntry
  tokens: TokenCatalog
}

/**
 * Lists registered payment methods for each supported blockchain.
 */
export type PaymentMethodCatalog = {
  entries: PaymentMethodCatalogEntry[]

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
    tokens: number
  }
}
