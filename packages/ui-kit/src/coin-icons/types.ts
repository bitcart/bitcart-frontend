import type { IconComponentProps } from "@web3icons/react"
import type { ComponentType } from "react"

export type CoinIconComponent = ComponentType<IconComponentProps>

export type CoinIconModule = { default: CoinIconComponent }

export type CoinIconShard = { iconLoadersBySymbol: Record<string, () => Promise<CoinIconModule>> }

export type CoinIconAddressShard = { symbolsByAddress: Record<string, string> }
