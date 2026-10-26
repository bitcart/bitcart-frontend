import type { WalletNetwork } from "../networks"

export type Eip1193Request = (args: { method: string; params?: unknown }) => Promise<unknown>

export type Eip1193Provider = { request: Eip1193Request }

export type InjectedTronWeb = {
  defaultAddress: { base58: string | false }
  trx: {
    getBlockByNumber: (block: number) => Promise<{ blockID: string }>
    getBalance: (address: string) => Promise<number>
    sign: (transaction: unknown) => Promise<{ txID: string }>
    sendRawTransaction: (signed: unknown) => Promise<{ result?: boolean; txid?: string }>
  }
  transactionBuilder: {
    sendTrx: (to: string, amount: number, from: string) => Promise<unknown>
  }
  contract: (
    abi: readonly unknown[],
    address: string,
  ) => {
    decimals: () => { call: () => Promise<unknown> }
    balanceOf: (owner: string) => { call: () => Promise<unknown> }
    transfer: (to: string, amount: string) => { send: (options: object) => Promise<string> }
  }
}

export type TronProtocol = "tip1193" | "legacy" | "bare"

export type TronProvider = {
  protocol: TronProtocol
  request?: Eip1193Request
  getTronWeb: () => InjectedTronWeb | null
}

export type InjectedWallet =
  | {
      family: "eip155"
      id: string
      name: string | null
      icon: string | null
      provider: Eip1193Provider
    }
  | { family: "tron"; id: string; name: string | null; icon: string | null; provider: TronProvider }

export type WalletTransfer = {
  network: WalletNetwork
  to: string
  amount: string
  contract: string | null
  symbol: string
}

export type WalletPayFailure =
  | { kind: "rejected" }
  | { kind: "pending" }
  | { kind: "locked" }
  | { kind: "wrongNetwork" }
  | { kind: "insufficientAmount"; balance: string }
  | { kind: "insufficientFee"; fee: string; feeSymbol: string }
  | { kind: "error"; message: string | null }

export class WalletPayError extends Error {
  readonly failure: WalletPayFailure

  constructor(failure: WalletPayFailure) {
    super(failure.kind)
    this.name = "WalletPayError"
    this.failure = failure
  }
}

export type WalletSession = {
  account: string
  ensureNetwork: () => Promise<void>
  checkFunds: (transfer: WalletTransfer) => Promise<void>
  send: (transfer: WalletTransfer) => Promise<string>
}
