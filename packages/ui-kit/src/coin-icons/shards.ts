//* The indexes are split so one lookup loads a few kilobytes, not every coin web3icons knows: each
//* built chunk lists the hashed file of every icon it can load, which doesn't compress.

export const getSymbolShard = (symbol: string): string => {
  const first = symbol.charAt(0).toUpperCase()

  return /^[A-Z0-9]$/u.test(first) ? first : "_"
}

//* An EVM address's first hex digit after `0x`. TRON's few indexed tokens share one shard.
export const getAddressShard = (address: string): string =>
  address.startsWith("0x") ? address.charAt(2).toLowerCase() : address.charAt(0)

export const normalizeTokenAddress = (network: string, address: string): string =>
  network.startsWith("eip155:") ? address.toLowerCase() : address
