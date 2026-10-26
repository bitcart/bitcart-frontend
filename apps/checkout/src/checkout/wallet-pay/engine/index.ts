import type { WalletNetwork } from "#/checkout/networks"

import type { InjectedWallet, WalletSession } from "../types"
import { connectEvmWallet } from "./evm"
import { connectTronWallet } from "./tron"

export const connectWallet = (
  wallet: InjectedWallet,
  network: WalletNetwork,
): Promise<WalletSession> =>
  wallet.family === "eip155"
    ? connectEvmWallet(wallet.provider, network)
    : connectTronWallet(wallet.provider, network)
