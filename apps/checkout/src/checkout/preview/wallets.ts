import type { CheckoutPreviewWallet } from "@bitcart/qa"

import type { Eip1193Request, InjectedTronWeb } from "../wallet-pay/types"

const EVM_ACCOUNT = "0x9F2c4E8a1B3d5f7091A2b3C4d5E6F708192a3B4c"
const TRON_ACCOUNT = "TJRabPrwbZy45sbavfcjinPJC18kjpRTv8"
const ANSWER_DELAY_MS = 600
const CONFIRM_DELAY_MS = 1500
const PLENTY = 10n ** 30n
const GAS_PRICE = 10n ** 9n
const NATIVE_GAS = 21_000n
const TOKEN_GAS = 65_000n
const TOKEN_DECIMALS = 6n
const DECIMALS_SELECTOR = "0x313ce567"

const EVM_HOME_CHAIN = 1
const EVM_WRONG_CHAIN = 137
const TRON_MAINNET = 728126428
const TRON_NILE = 3448148188

const icon = (color: string, letter: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="${color}"/><text x="24" y="32" font-family="sans-serif" font-size="22" font-weight="700" fill="#fff" text-anchor="middle">${letter}</text></svg>`,
  )}`

const PREVIEW_WALLETS = [
  { uuid: "preview-wallet", name: "Preview Wallet", icon: icon("#7c3aed", "P") },
  { uuid: "preview-wallet-2", name: "Second Wallet", icon: icon("#0f766e", "S") },
]

class ProviderError extends Error {
  readonly code: number

  constructor(code: number, message: string) {
    super(message)
    this.code = code
  }
}

const later = <TValue>(value: () => TValue, delay = ANSWER_DELAY_MS) =>
  new Promise<TValue>((resolve) => setTimeout(() => resolve(value()), delay))

const failLater = (reason: unknown, delay = ANSWER_DELAY_MS) =>
  new Promise<never>((_resolve, reject) => setTimeout(() => reject(reason as Error), delay))

const toHex = (value: bigint | number) => `0x${value.toString(16)}`
const toWord = (value: bigint) => `0x${value.toString(16).padStart(64, "0")}`
const randomHash = () => toWord(BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) * 7919n)

type Balances = { native: bigint; token: bigint }

const getBalances = (scenario: CheckoutPreviewWallet): Balances => {
  if (scenario === "low-balance") {
    return { native: 0n, token: 0n }
  } else if (scenario === "no-gas") {
    return { native: 0n, token: PLENTY }
  } else return { native: PLENTY, token: PLENTY }
}

const createEvmRequest = (scenario: CheckoutPreviewWallet): Eip1193Request => {
  let chainId = scenario === "wrong-network" ? EVM_WRONG_CHAIN : EVM_HOME_CHAIN
  const balances = getBalances(scenario)

  return ({ method, params }) => {
    const [first] = (params ?? []) as [Record<string, string> | undefined]

    switch (method) {
      case "eth_requestAccounts":
        return scenario === "busy"
          ? failLater(new ProviderError(-32002, "A request is already pending"))
          : later(() => [EVM_ACCOUNT])

      case "eth_accounts":
        return later(() => [EVM_ACCOUNT], 0)

      case "eth_chainId":
        return later(() => toHex(chainId), 0)

      case "wallet_switchEthereumChain":
        if (scenario === "wrong-network") {
          return failLater(new ProviderError(4001, "User rejected"))
        } else
          return later(() => {
            chainId = Number(first?.chainId)

            return null
          })

      case "wallet_requestPermissions":
        return later(() => [])

      case "eth_estimateGas":
        return later(() => toHex(first?.data ? TOKEN_GAS : NATIVE_GAS), 0)

      case "eth_getBalance":
        return later(() => toHex(balances.native), 0)

      case "eth_call":
        return later(
          () =>
            toWord(first?.data?.startsWith(DECIMALS_SELECTOR) ? TOKEN_DECIMALS : balances.token),
          0,
        )

      case "eth_getBlockByNumber":
        return later(() => ({ number: "0x1", baseFeePerGas: toHex(GAS_PRICE) }), 0)

      case "eth_maxPriorityFeePerGas":
      case "eth_gasPrice":
        return later(() => toHex(GAS_PRICE), 0)

      case "eth_sendTransaction":
        if (scenario === "rejects") {
          return failLater(new ProviderError(4001, "User rejected the request"), CONFIRM_DELAY_MS)
        } else if (scenario === "fails") {
          return failLater(new ProviderError(-32603, "execution reverted"), CONFIRM_DELAY_MS)
        } else return later(randomHash, CONFIRM_DELAY_MS)

      default:
        return failLater(new ProviderError(4200, `${method} is not supported`), 0)
    }
  }
}

const createTronWallet = (scenario: CheckoutPreviewWallet) => {
  let chainId = scenario === "wrong-network" ? TRON_NILE : TRON_MAINNET
  const balances = getBalances(scenario)

  const confirm = () => {
    if (scenario === "rejects") {
      return failLater("Confirmation declined by user", CONFIRM_DELAY_MS)
    } else if (scenario === "fails") {
      return failLater(new Error("REVERT opcode executed"), CONFIRM_DELAY_MS)
    } else return later(() => randomHash().slice(2), CONFIRM_DELAY_MS)
  }

  const tronWeb: InjectedTronWeb = {
    defaultAddress: { base58: false },

    trx: {
      getBlockByNumber: () =>
        later(() => ({ blockID: `${"0".repeat(56)}${chainId.toString(16)}` }), 0),

      getBalance: () => later(() => (balances.native > 0n ? 10 ** 12 : 0), 0),
      sign: () => confirm().then((txID) => ({ txID })),
      sendRawTransaction: () => later(() => ({ result: true }), 0),
    },

    transactionBuilder: { sendTrx: () => later(() => ({}), 0) },

    contract: () => ({
      decimals: () => ({ call: () => later(() => TOKEN_DECIMALS, 0) }),
      balanceOf: () => ({ call: () => later(() => balances.token, 0) }),
      transfer: () => ({ send: confirm }),
    }),
  }

  const request: Eip1193Request = ({ method, params }) => {
    if (method === "eth_requestAccounts") {
      return scenario === "busy"
        ? failLater(new ProviderError(-32002, "A request is already pending"))
        : later(() => {
            tronWeb.defaultAddress.base58 = TRON_ACCOUNT

            return [TRON_ACCOUNT]
          })
    } else if (method === "wallet_switchEthereumChain") {
      if (scenario === "wrong-network") {
        return failLater(new ProviderError(4001, "User rejected"))
      } else
        return later(() => {
          chainId = Number((params as [{ chainId: string }])[0].chainId)

          return null
        })
    } else return failLater(new ProviderError(4200, `${method} is not supported`), 0)
  }

  return { request, tronWeb }
}

export const installPreviewWallets = (scenario: CheckoutPreviewWallet): (() => void) => {
  const wallets = PREVIEW_WALLETS.slice(0, scenario === "two" ? 2 : 1)

  const announcements = wallets.flatMap((info) => [
    {
      event: "eip6963",
      detail: {
        info: { ...info, rdns: "dev.preview" },
        provider: { request: createEvmRequest(scenario) },
      },
    },
    {
      event: "TIP6963",
      detail: { info: { ...info, rdns: "dev.preview" }, provider: createTronWallet(scenario) },
    },
  ])

  const announce = () => {
    for (const { event, detail } of announcements) {
      window.dispatchEvent(
        new CustomEvent(`${event}:announceProvider`, { detail: Object.freeze(detail) }),
      )
    }
  }

  window.addEventListener("eip6963:requestProvider", announce)
  window.addEventListener("TIP6963:requestProvider", announce)
  announce()

  return () => {
    window.removeEventListener("eip6963:requestProvider", announce)
    window.removeEventListener("TIP6963:requestProvider", announce)
  }
}
