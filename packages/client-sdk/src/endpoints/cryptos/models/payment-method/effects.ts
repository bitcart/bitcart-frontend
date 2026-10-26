import { entries, prop, unique } from "remeda"

import { getBlockchainTokens, getSupportedBlockchains } from "#/endpoints/cryptos/requests"
import type { TokenSymbol } from "#/endpoints/cryptos/types"

import type { BlockchainCatalogEntry } from "../blockchain-catalog"
import type { PaymentMethodCatalog, PaymentMethodCatalogEntry } from "./types"

export const getPaymentMethodCatalog = (): Promise<PaymentMethodCatalog> =>
  getSupportedBlockchains()
    .then((supportedBlockchainsResponse) =>
      Promise.allSettled(
        entries(supportedBlockchainsResponse).map(([key, displayName]) => {
          const blockchain: BlockchainCatalogEntry = {
            id: key,
            metadata: { displayName },
            intrinsicTokenSymbol: key.toUpperCase(),
          }

          return getBlockchainTokens(blockchain.id)
            .then(({ count, result }) => ({
              blockchain,

              tokens: {
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

              return { blockchain, tokens: { entries: [], totalCount: 0 } }
            })
        }),
      ),
    )
    .then((results) => {
      const catalogEntries = (results as PromiseFulfilledResult<PaymentMethodCatalogEntry>[]).map(
        prop("value"),
      )

      const totalCounts = {
        blockchains: catalogEntries.length,
        tokens: catalogEntries.reduce((total, { tokens }) => total + tokens.totalCount, 0),
      }

      return { entries: catalogEntries, totalCounts }
    })
    .catch((err) => {
      console.error("Failed to fetch supported blockchains:", err)

      return { entries: [], totalCounts: { blockchains: 0, tokens: 0 } }
    })

export const selectPaymentTokenSymbols = (
  paymentMethodCatalog: PaymentMethodCatalog,
): TokenSymbol[] => {
  return unique(
    paymentMethodCatalog.entries
      .map(({ blockchain, tokens }) => [blockchain.intrinsicTokenSymbol, ...tokens.entries])
      .flat(),
  )
}
