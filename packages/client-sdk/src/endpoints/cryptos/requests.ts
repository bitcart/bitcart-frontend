import type { PaginatedData } from "#/types"

import {
  cryptosGetCryptos,
  cryptosGetSupportedCryptos,
  cryptosGetTokens,
} from "../_internal/generated/cryptos"
import type { BlockchainDisplayName, BlockchainId, TokenSymbol } from "./types"

// TODO: Remove once the API schema expresses the correct type.
export type GetSupportedBlockchainsData = Record<BlockchainId, BlockchainDisplayName>

export const getSupportedBlockchains = () =>
  cryptosGetSupportedCryptos() as Promise<GetSupportedBlockchainsData>

// TODO: Remove once the API schema expresses the correct type.
export type GetEnabledBlockchainsData = PaginatedData<BlockchainId>

export const getEnabledBlockchains = () => cryptosGetCryptos() as Promise<GetEnabledBlockchainsData>

// TODO: Remove once the API schema expresses the correct type.
export type GetBlockchainTokensData = PaginatedData<TokenSymbol>

export const getBlockchainTokens = (blockchainId: BlockchainId) =>
  cryptosGetTokens(blockchainId) as Promise<GetBlockchainTokensData>
