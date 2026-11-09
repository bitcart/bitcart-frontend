import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const EVM_ADDRESS = /^0x[0-9a-f]{40}$/u
const TRON_ADDRESS = /^T[1-9A-HJ-NP-Za-km-z]{33}$/u

export type CoinIconNetwork = {
  network: string
  web3iconsPlatform: string
  trustWalletFolder: string
  address: RegExp
}

//* Checkouts identify a network by its CAIP-2 id, web3icons by its CoinGecko platform id, and
//* Trust Wallet's registry by its folder under `blockchains`. A normalized address must match
//* `address`.
export const COIN_ICON_NETWORKS: CoinIconNetwork[] = [
  {
    network: "eip155:1",
    web3iconsPlatform: "ethereum",
    trustWalletFolder: "ethereum",
    address: EVM_ADDRESS,
  },

  {
    network: "eip155:56",
    web3iconsPlatform: "binance-smart-chain",
    trustWalletFolder: "smartchain",
    address: EVM_ADDRESS,
  },

  {
    network: "eip155:137",
    web3iconsPlatform: "polygon-pos",
    trustWalletFolder: "polygon",
    address: EVM_ADDRESS,
  },

  {
    network: "tron:728126428",
    web3iconsPlatform: "tron",
    trustWalletFolder: "tron",
    address: TRON_ADDRESS,
  },
]

export type TrustWalletToken = {
  symbol: string
  name: string
  coingeckoId?: string
}

//* Active tokens only, by network and normalized address.
export type TrustWalletTokens = {
  commit: string
  tokensByNetwork: Record<string, Record<string, TrustWalletToken>>
}

export const TRUST_WALLET_TOKENS_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "data/trust-wallet-tokens.gen.json",
)
