import type { TrailingParams } from "@bitcart/core/types"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { useCallback } from "react"
import { entries, keys } from "remeda"

import {
  useCryptosGetSupportedCryptos,
  useCryptosGetSupportedCryptosSuspense,
  useCryptosGetTokens,
  useCryptosGetTokensSuspense,
} from "../_internal/generated/cryptos"
import {
  blockchainCatalogEntrySearch,
  paymentMethodCatalogQuery,
  tokenCatalogEntrySearch,
  type BlockchainCatalog,
  type TokenCatalog,
} from "./models"
import type { GetBlockchainTokensData, GetSupportedBlockchainsData } from "./requests"
import type { BlockchainId } from "./types"

/**
 * Normalizes {@link GetSupportedBlockchainsData} into a catalog matching the search term.
 */
const useBlockchainCatalogFormat = (searchTerm: string) =>
  useCallback(
    (data: unknown): BlockchainCatalog => {
      const supportedBlockchains = data as GetSupportedBlockchainsData

      return blockchainCatalogEntrySearch(
        {
          entries: entries(supportedBlockchains).map(([key, displayName]) => ({
            id: key,
            metadata: { displayName },
            intrinsicTokenSymbol: key.toUpperCase(),
          })),

          totalCount: keys(supportedBlockchains).length,
        },

        searchTerm,
      )
    },

    [searchTerm],
  )

/**
 * Normalizes {@link GetBlockchainTokensData} into a catalog matching the search term.
 */
const useTokenCatalogFormat = (searchTerm: string) =>
  useCallback(
    (data: unknown): TokenCatalog => {
      const { count, result } = data as GetBlockchainTokensData

      return tokenCatalogEntrySearch({ entries: result, totalCount: count }, searchTerm)
    },

    [searchTerm],
  )

export type UseBlockchainCatalogParams = {
  searchTerm?: string
}

export const useBlockchainCatalog = ({ searchTerm = "" }: UseBlockchainCatalogParams = {}) =>
  useSupportedBlockchains<BlockchainCatalog>({
    query: { select: useBlockchainCatalogFormat(searchTerm) },
  })

export const useBlockchainCatalogSuspense = ({
  searchTerm = "",
}: UseBlockchainCatalogParams = {}) =>
  useSupportedBlockchainsSuspense<BlockchainCatalog>({
    query: { select: useBlockchainCatalogFormat(searchTerm) },
  })

export const useBlockchainTokens = <TData = GetBlockchainTokensData>(
  blockchainId: BlockchainId,
  ...params: TrailingParams<Parameters<typeof useCryptosGetTokens<TData>>>
) => useCryptosGetTokens<TData>(blockchainId, ...params)

export const useBlockchainTokensSuspense = <TData = GetBlockchainTokensData>(
  blockchainId: BlockchainId,
  ...params: TrailingParams<Parameters<typeof useCryptosGetTokensSuspense<TData>>>
) => useCryptosGetTokensSuspense<TData>(blockchainId, ...params)

export const usePaymentMethodCatalog = () => useQuery(paymentMethodCatalogQuery())

export const usePaymentMethodCatalogSuspense = () => useSuspenseQuery(paymentMethodCatalogQuery())

export const useSupportedBlockchains = <TData = GetSupportedBlockchainsData>(
  ...params: Parameters<typeof useCryptosGetSupportedCryptos<TData>>
) => useCryptosGetSupportedCryptos<TData>(...params)

export const useSupportedBlockchainsSuspense = <TData = GetSupportedBlockchainsData>(
  ...params: Parameters<typeof useCryptosGetSupportedCryptosSuspense<TData>>
) => useCryptosGetSupportedCryptosSuspense<TData>(...params)

export type UseTokenCatalogParams = {
  blockchainId: BlockchainId
  searchTerm?: string
}

export const useTokenCatalog = ({ blockchainId, searchTerm = "" }: UseTokenCatalogParams) =>
  useBlockchainTokens<TokenCatalog>(blockchainId, {
    query: { select: useTokenCatalogFormat(searchTerm) },
  })

export const useTokenCatalogSuspense = ({ blockchainId, searchTerm = "" }: UseTokenCatalogParams) =>
  useBlockchainTokensSuspense<TokenCatalog>(blockchainId, {
    query: { select: useTokenCatalogFormat(searchTerm) },
  })
