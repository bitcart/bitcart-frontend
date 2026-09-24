import type { TokenSymbol } from "#/endpoints/cryptos/types"

export type TokenCatalogEntry = TokenSymbol

export type TokenCatalog = {
  entries: TokenCatalogEntry[]
  totalCount: number
}
