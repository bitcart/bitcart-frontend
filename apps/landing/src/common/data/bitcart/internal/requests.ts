import { CLIENT_CONFIG } from "./config"
import type { BlockchainDisplayName, BlockchainId, FungibleTokenSymbol } from "./types"

export type GetSupportedBlockchainsData = Record<BlockchainId, BlockchainDisplayName>

export const getSupportedBlockchains = () =>
  fetch(`${CLIENT_CONFIG.baseURL}/cryptos/supported`).then((response) => {
    if (response.ok) {
      return response.json() as unknown as GetSupportedBlockchainsData
    } else {
      throw new Error(
        `Failed to fetch supported blockchains: ${response.status} ${response.statusText}`,
      )
    }
  })

export type GetBlockchainTokensParams = {
  blockchainId: BlockchainId
  blockchainDisplayName?: string
}

export type GetBlockchainTokensData = {
  count: number
  next: null
  previous: null
  result: FungibleTokenSymbol[]
}

export const getBlockchainTokens = ({
  blockchainId,
  blockchainDisplayName,
}: GetBlockchainTokensParams) =>
  fetch(`${CLIENT_CONFIG.baseURL}/cryptos/tokens/${blockchainId}`).then((response) => {
    if (response.ok) {
      return response.json() as unknown as GetBlockchainTokensData
    } else {
      throw new Error(
        `Failed to fetch supported tokens for ${
          blockchainDisplayName ?? blockchainId
        }: ${response.status} ${response.statusText}`,
      )
    }
  })
