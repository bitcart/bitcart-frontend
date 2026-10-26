import type {
  Eip1193Provider,
  Eip1193Request,
  InjectedTronWeb,
  TronProvider,
} from "../wallet-pay/types"

export const FAKE_EVM_ACCOUNT = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
export const FAKE_TRON_ACCOUNT = "TJRabPrwbZy45sbavfcjinPJC18kjpRTv8"
export const FAKE_TX_HASH = `0x${"ab".repeat(32)}`

const PLENTY = 10n ** 30n

export class FakeProviderError extends Error {
  readonly code: number

  constructor(code: number) {
    super(`Provider error ${code}`)
    this.code = code
  }
}

type Outcome = "accept" | "reject" | "pending" | "fail"

const fail = (outcome: Exclude<Outcome, "accept">) =>
  Promise.reject(new FakeProviderError({ reject: 4001, pending: -32002, fail: -32603 }[outcome]))

const DECIMALS_SELECTOR = "0x313ce567"

const toWord = (value: bigint | number) => `0x${value.toString(16).padStart(64, "0")}`

export type FakeEvmOptions = {
  account?: string
  chainId?: number
  nativeBalance?: bigint
  tokenBalance?: bigint
  tokenDecimals?: number
  gas?: bigint
  gasPrice?: bigint
  connect?: Outcome
  switchChain?: Outcome
  send?: Outcome
}

const toHex = (value: bigint | number) => `0x${value.toString(16)}`

export const createFakeEvmProvider = ({
  account = FAKE_EVM_ACCOUNT,
  chainId: initialChainId = 1,
  nativeBalance = PLENTY,
  tokenBalance = PLENTY,
  tokenDecimals = 6,
  gas = 21_000n,
  gasPrice = 10n ** 9n,
  connect = "accept",
  switchChain = "accept",
  send = "accept",
}: FakeEvmOptions = {}) => {
  let chainId = initialChainId
  const calls: { method: string; params?: unknown }[] = []

  const request: Eip1193Request = ({ method, params }) => {
    calls.push({ method, params })

    const [first] = (params ?? []) as [Record<string, string> | undefined]

    switch (method) {
      case "eth_requestAccounts":
        return connect === "accept" ? Promise.resolve([account]) : fail(connect)

      case "eth_chainId":
        return Promise.resolve(toHex(chainId))

      case "wallet_switchEthereumChain":
        if (switchChain === "accept") {
          chainId = Number(first?.chainId)

          return Promise.resolve(null)
        } else return fail(switchChain)

      case "wallet_requestPermissions":
        return Promise.resolve([])

      case "eth_getBalance":
        return Promise.resolve(toHex(nativeBalance))

      case "eth_call":
        return Promise.resolve(
          toWord(first?.data?.startsWith(DECIMALS_SELECTOR) ? tokenDecimals : tokenBalance),
        )

      case "eth_estimateGas":
        return Promise.resolve(toHex(gas))

      case "eth_getBlockByNumber":
        return Promise.resolve({ number: "0x1", baseFeePerGas: toHex(gasPrice) })

      case "eth_maxPriorityFeePerGas":
        return Promise.resolve("0x0")

      case "eth_gasPrice":
        return Promise.resolve(toHex(gasPrice))

      case "eth_sendTransaction":
        return send === "accept" ? Promise.resolve(FAKE_TX_HASH) : fail(send)

      default:
        return Promise.reject(new FakeProviderError(4200))
    }
  }

  const provider: Eip1193Provider = { request }

  return { provider, calls, getChainId: () => chainId }
}

export type FakeTronOptions = {
  protocol?: TronProvider["protocol"]
  chainId?: number
  trxBalance?: number
  tokenBalance?: unknown
  tokenDecimals?: unknown
  connect?: Outcome | "locked"
  switchChain?: Outcome
  sign?: Outcome
}

const MAINNET_CHAIN_ID = 728126428
const TRON_DECLINED = "Confirmation declined by user"

export const createFakeTronProvider = ({
  protocol = "tip1193",
  chainId: initialChainId = MAINNET_CHAIN_ID,
  trxBalance = 10 ** 12,
  tokenBalance = PLENTY,
  tokenDecimals = 6n,
  connect = "accept",
  switchChain = "accept",
  sign = "accept",
}: FakeTronOptions = {}) => {
  let chainId = initialChainId
  const sent: { kind: "trx" | "trc20"; to: string; amount: string; contract?: string }[] = []

  const signOutcome = () => {
    if (sign === "accept") {
      return Promise.resolve("c0ffee")
    } else if (sign === "reject") {
      return Promise.reject(TRON_DECLINED as unknown as Error)
    } else return fail(sign)
  }

  const tronWeb: InjectedTronWeb = {
    defaultAddress: { base58: protocol === "bare" ? FAKE_TRON_ACCOUNT : false },

    trx: {
      getBlockByNumber: () =>
        Promise.resolve({ blockID: `${"0".repeat(56)}${chainId.toString(16).padStart(8, "0")}` }),

      getBalance: () => Promise.resolve(trxBalance),
      sign: () => signOutcome().then((txID) => ({ txID })),
      sendRawTransaction: () => Promise.resolve({ result: true, txid: "c0ffee" }),
    },

    transactionBuilder: {
      sendTrx: (to, amount) => {
        sent.push({ kind: "trx", to, amount: String(amount) })

        return Promise.resolve({})
      },
    },

    contract: (_abi, contract) => ({
      decimals: () => ({ call: () => Promise.resolve(tokenDecimals) }),
      balanceOf: () => ({ call: () => Promise.resolve(tokenBalance) }),

      transfer: (to, amount) => ({
        send: () => {
          sent.push({ kind: "trc20", to, amount, contract })

          return signOutcome()
        },
      }),
    }),
  }

  const connectOutcome = () => {
    if (protocol === "legacy") {
      const codes = { accept: 200, reject: 4001, pending: 4000, fail: 500, locked: undefined }

      return Promise.resolve(connect === "locked" ? "" : { code: codes[connect] })
    } else if (connect === "accept") {
      return Promise.resolve([FAKE_TRON_ACCOUNT])
    } else return fail(connect === "locked" ? "fail" : connect)
  }

  const request: Eip1193Request = ({ method, params }) => {
    if (method === "eth_requestAccounts" || method === "tron_requestAccounts") {
      return connectOutcome().then((answer) => {
        if (connect === "accept") tronWeb.defaultAddress.base58 = FAKE_TRON_ACCOUNT

        return answer
      })
    } else if (method === "wallet_switchEthereumChain") {
      if (switchChain === "accept") {
        chainId = Number.parseInt((params as [{ chainId: string }])[0].chainId, 16)

        return Promise.resolve(null)
      } else return fail(switchChain)
    } else return Promise.reject(new FakeProviderError(4200))
  }

  const provider: TronProvider = {
    protocol,
    request: protocol === "bare" ? undefined : request,
    getTronWeb: () => tronWeb,
  }

  return { provider, tronWeb, sent, getChainId: () => chainId }
}
