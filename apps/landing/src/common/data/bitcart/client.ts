import { entries, keys, prop } from "remeda"

import { blockchainCatalogEntrySearch, fungibleTokenCatalogEntrySearch } from "./internal/filters"
import {
  getBlockchainTokens,
  getSupportedBlockchains,
  type GetBlockchainTokensParams,
} from "./internal/requests"
import type {
  AssetCatalog,
  AssetCatalogEntry,
  BlockchainCatalog,
  BlockchainCatalogEntry,
  FungibleTokenCatalog,
} from "./internal/types"
import { extractFungibleTokenSymbols } from "./internal/utils"

export type GetBlockchainCatalogParams = {
  searchTerm?: string
}

export const getBlockchainCatalog = (
  { searchTerm = "" }: GetBlockchainCatalogParams | undefined = { searchTerm: "" },
): Promise<BlockchainCatalog> =>
  getSupportedBlockchains()
    .then((supportedBlockchainsResponse) => ({
      entries: entries(supportedBlockchainsResponse).map(([key, displayName]) => ({
        id: key,
        metadata: { displayName },
        intrinsicTokenSymbol: key.toUpperCase(),
      })),

      totalCount: keys(supportedBlockchainsResponse).length,
    }))
    .then((catalog) => blockchainCatalogEntrySearch(catalog, searchTerm))

export type GetFungibleTokenCatalogParams = GetBlockchainTokensParams & {
  searchTerm?: string
}

export const getFungibleTokenCatalog = ({
  blockchainId,
  blockchainDisplayName,
  searchTerm = "",
}: GetFungibleTokenCatalogParams): Promise<FungibleTokenCatalog> =>
  getBlockchainTokens({ blockchainId, blockchainDisplayName })
    .then(({ count, result }) => ({ entries: result, totalCount: count }))
    .then((catalog) => fungibleTokenCatalogEntrySearch(catalog, searchTerm))

export const getAssetCatalog = (): Promise<AssetCatalog> =>
  getSupportedBlockchains()
    .then((supportedBlockchainsResponse) =>
      Promise.allSettled(
        entries(supportedBlockchainsResponse).map(([key, displayName]) => {
          const blockchain: BlockchainCatalogEntry = {
            id: key,
            metadata: { displayName },
            intrinsicTokenSymbol: key.toUpperCase(),
          }

          return getBlockchainTokens({
            blockchainId: blockchain.id,
            blockchainDisplayName: displayName,
          })
            .then(({ count, result }) => ({
              blockchain,
              fungibleTokens: {
                entries: result.map((symbol) => symbol.toUpperCase()),
                totalCount: count,
              },
            }))
            .catch((err) => {
              if (err instanceof Error) {
                console.error(err)
              } else {
                console.error(
                  `Failed to fetch supported tokens for ${blockchain.metadata.displayName}:`,
                  err,
                )
              }

              return { blockchain, fungibleTokens: { entries: [], totalCount: 0 } }
            })
        }),
      ),
    )
    .then((results) => {
      const entries = (results as PromiseFulfilledResult<AssetCatalogEntry>[]).map(prop("value"))

      const totalCounts = {
        blockchains: entries.length,

        fungibleTokens: entries.reduce(
          (total, { fungibleTokens }) => total + fungibleTokens.totalCount,
          0,
        ),
      }

      return { entries, totalCounts }
    })
    .catch((err) => {
      console.error("Failed to fetch supported blockchains:", err)

      return { entries: [], totalCounts: { blockchains: 0, fungibleTokens: 0 } }
    })

export const getSupportedFungibleTokenSymbols = () =>
  getAssetCatalog().then(extractFungibleTokenSymbols)
