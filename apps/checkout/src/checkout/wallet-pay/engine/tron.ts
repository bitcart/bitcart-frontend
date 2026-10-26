import { fromBaseUnits, toBaseUnits, trimTrailingZeros } from "@bitcart/core/utils"

import type { WalletNetwork } from "#/checkout/networks"

import {
  WalletPayError,
  type InjectedTronWeb,
  type TronProvider,
  type WalletSession,
  type WalletTransfer,
} from "../types"
import { guard } from "./failures"

const TRC20_ABI = [
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },

  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },

  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const

// TODO: remove?
const TRC20_FEE_LIMIT_SUN = 50_000_000

const TRX_DECIMALS = 6

const READY_TIMEOUT_MS = 2000
const READY_POLL_MS = 100

const LEGACY_CODES = { accepted: 200, pending: 4000, rejected: 4001 } as const

const waitFor = async <TValue>(read: () => TValue | null | false): Promise<TValue | null> => {
  for (let waited = 0; waited <= READY_TIMEOUT_MS; waited += READY_POLL_MS) {
    const value = read()

    if (value) return value

    await new Promise((resolve) => setTimeout(resolve, READY_POLL_MS))
  }

  return null
}

const requestAccess = async ({ protocol, request }: TronProvider): Promise<void> => {
  if (protocol === "tip1193" && request) {
    await request({ method: "eth_requestAccounts" })
  } else if (protocol === "legacy" && request) {
    const response = (await request({ method: "tron_requestAccounts" })) as { code?: number } | ""

    if (!response) {
      throw new WalletPayError({ kind: "locked" })
    } else if (response.code === LEGACY_CODES.rejected) {
      throw new WalletPayError({ kind: "rejected" })
    } else if (response.code === LEGACY_CODES.pending) {
      throw new WalletPayError({ kind: "pending" })
    } else if (response.code !== LEGACY_CODES.accepted) {
      throw new WalletPayError({ kind: "error", message: null })
    }
  }
}

const readChainId = async (tronWeb: InjectedTronWeb): Promise<number> => {
  const { blockID } = await tronWeb.trx.getBlockByNumber(0)

  return Number.parseInt(blockID.slice(-8), 16)
}

const toBigInt = (value: unknown): bigint => BigInt(String(value))

const getDecimals = async (tronWeb: InjectedTronWeb, { contract }: WalletTransfer) =>
  contract === null
    ? TRX_DECIMALS
    : Number(toBigInt(await tronWeb.contract(TRC20_ABI, contract).decimals().call()))

const getTransferBalance = async (
  tronWeb: InjectedTronWeb,
  account: string,
  { contract }: WalletTransfer,
): Promise<bigint> =>
  contract === null
    ? BigInt(await tronWeb.trx.getBalance(account))
    : toBigInt(await tronWeb.contract(TRC20_ABI, contract).balanceOf(account).call())

const send = async (tronWeb: InjectedTronWeb, account: string, transfer: WalletTransfer) => {
  const value = toBaseUnits(transfer.amount, await getDecimals(tronWeb, transfer))

  if (transfer.contract === null) {
    const transaction = await tronWeb.transactionBuilder.sendTrx(
      transfer.to,
      Number(value),
      account,
    )

    const signed = await tronWeb.trx.sign(transaction)
    const broadcast = await tronWeb.trx.sendRawTransaction(signed)

    if (!broadcast.result) {
      throw new WalletPayError({ kind: "error", message: null })
    } else return broadcast.txid ?? signed.txID
  } else
    return tronWeb
      .contract(TRC20_ABI, transfer.contract)
      .transfer(transfer.to, value.toString())
      .send({ feeLimit: TRC20_FEE_LIMIT_SUN })
}

export const connectTronWallet = async (
  provider: TronProvider,
  network: WalletNetwork,
): Promise<WalletSession> => {
  const getTronWeb = async () => {
    const tronWeb = await waitFor(provider.getTronWeb)

    if (!tronWeb) {
      throw new WalletPayError({ kind: "locked" })
    } else return tronWeb
  }

  const account = await guard(async () => {
    await requestAccess(provider)

    return waitFor(() => provider.getTronWeb()?.defaultAddress.base58 ?? null)
  })()

  if (!account) {
    throw new WalletPayError({ kind: "locked" })
  } else
    return {
      account,

      ensureNetwork: guard(async () => {
        if ((await readChainId(await getTronWeb())) !== network.chainId) {
          if (provider.protocol === "tip1193" && provider.request) {
            try {
              await provider.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: `0x${network.chainId.toString(16)}` }],
              })
            } catch {
              throw new WalletPayError({ kind: "wrongNetwork" })
            }
          }

          if ((await readChainId(await getTronWeb())) !== network.chainId) {
            throw new WalletPayError({ kind: "wrongNetwork" })
          }
        }
      }),

      checkFunds: guard(async (transfer) => {
        const tronWeb = await getTronWeb()

        const [decimals, balance] = await Promise.all([
          getDecimals(tronWeb, transfer),
          getTransferBalance(tronWeb, account, transfer),
        ])

        if (balance < toBaseUnits(transfer.amount, decimals)) {
          throw new WalletPayError({
            kind: "insufficientAmount",
            balance: trimTrailingZeros(fromBaseUnits(balance, decimals)),
          })
        }
      }),

      send: guard(async (transfer) => send(await getTronWeb(), account, transfer)),
    }
}
