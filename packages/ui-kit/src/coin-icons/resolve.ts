import { iconShardLoaders } from "./generated/icons.generated"
import { addressShardLoadersByNetwork } from "./generated/networks.generated"
import { getAddressShard, getSymbolShard, normalizeTokenAddress } from "./shards"
import type { CoinIconComponent } from "./types"

export type CoinIconQuery = {
  symbol: string
  contract: string | null
  network: string | null
}

const resolvedIcons = new Map<string, Promise<CoinIconComponent | null>>()

const findIconSymbol = async ({
  symbol,
  contract,
  network,
}: CoinIconQuery): Promise<string | null> => {
  if (contract === null) {
    return symbol.toUpperCase()
  } else {
    const address = network === null ? contract : normalizeTokenAddress(network, contract)
    const shards = network === null ? undefined : addressShardLoadersByNetwork[network]
    const loadShard = shards?.[getAddressShard(address)]

    //! A token is matched by its contract only: a ticker alone could name any other token.
    return loadShard === undefined ? null : ((await loadShard()).symbolsByAddress[address] ?? null)
  }
}

const loadIcon = async (iconSymbol: string): Promise<CoinIconComponent | null> => {
  const loadShard = iconShardLoaders[getSymbolShard(iconSymbol)]

  const loadModule =
    loadShard === undefined ? undefined : (await loadShard()).iconLoadersBySymbol[iconSymbol]

  return loadModule === undefined ? null : (await loadModule()).default
}

/**
 * The icon of a coin, or of a token by its contract on its network, or null when none is known.
 * Each query resolves once; a failed load resolves to null, and a later query tries again.
 */
export const resolveCoinIcon = (query: CoinIconQuery): Promise<CoinIconComponent | null> => {
  const contract =
    query.contract === null || query.network === null
      ? query.contract
      : normalizeTokenAddress(query.network, query.contract)

  const key = [query.symbol.toUpperCase(), contract, query.network].join(":")
  const cached = resolvedIcons.get(key)

  if (cached === undefined) {
    const resolved = findIconSymbol(query)
      .then((iconSymbol) => (iconSymbol === null ? null : loadIcon(iconSymbol)))
      .catch(() => {
        resolvedIcons.delete(key)

        return null
      })

    resolvedIcons.set(key, resolved)

    return resolved
  } else return cached
}
