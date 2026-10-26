export type WalletFamily = "eip155" | "tron"

export type WalletNetwork = {
  family: WalletFamily
  chainId: number
}

const CAIP2_PATTERN = /^(eip155|tron):(\d+)$/u

export const parseWalletNetwork = (caip2: string | null): WalletNetwork | null => {
  const match = caip2 ? CAIP2_PATTERN.exec(caip2) : null

  if (match) {
    return { family: match[1] as WalletFamily, chainId: Number(match[2]) }
  } else return null
}

const NETWORK_NAMES: Record<WalletFamily, Partial<Record<number, string>>> = {
  eip155: {
    1: "Ethereum",
    11155111: "Sepolia",
    56: "BNB Smart Chain",
    97: "BNB Smart Chain Testnet",
    137: "Polygon",
    80002: "Polygon Amoy",
  },

  tron: {
    728126428: "TRON",
    2494104990: "TRON Shasta",
    3448148188: "TRON Nile",
  },
}

export const getNetworkName = ({ family, chainId }: WalletNetwork): string | null =>
  NETWORK_NAMES[family][chainId] ?? null

const NATIVE_SYMBOLS: Record<WalletFamily, Partial<Record<number, string>>> = {
  eip155: { 56: "BNB", 97: "tBNB", 137: "POL", 80002: "POL" },
  tron: {},
}

const DEFAULT_NATIVE_SYMBOLS: Record<WalletFamily, string> = { eip155: "ETH", tron: "TRX" }

export const getNativeSymbol = ({ family, chainId }: WalletNetwork): string =>
  NATIVE_SYMBOLS[family][chainId] ?? DEFAULT_NATIVE_SYMBOLS[family]

const NETWORK_BADGES: Record<WalletFamily, Partial<Record<number, string>>> = {
  eip155: {
    1: "ETH",
    11155111: "Sepolia",
    56: "BSC",
    97: "BSC Testnet",
    137: "POL",
    80002: "Amoy",
  },

  tron: { 728126428: "TRX", 2494104990: "Shasta", 3448148188: "Nile" },
}

export type NetworkLabels = { badge: string; name: string | null }

export const getNetworkLabels = (caip2: string | null): NetworkLabels | null => {
  const network = parseWalletNetwork(caip2)

  if (network === null) {
    return null
  } else {
    const { family, chainId } = network

    return {
      badge: NETWORK_BADGES[family][chainId] ?? String(chainId),
      name: getNetworkName(network),
    }
  }
}

export const getMethodNetwork = ({
  network,
  chainId,
}: {
  network: string | null
  chainId: number | null
}): string | null => network ?? (chainId === null ? null : `eip155:${chainId}`)
