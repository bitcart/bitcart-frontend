import { fromBaseUnits, toBaseUnits, trimTrailingZeros } from "@bitcart/core/utils"
import { createClient, custom, encodeFunctionData, erc20Abi, type Address } from "viem"
import {
  estimateFeesPerGas,
  estimateGas,
  getBalance,
  getChainId,
  getGasPrice,
  readContract,
  requestAddresses,
  sendTransaction,
  switchChain,
} from "viem/actions"

import { getNativeSymbol, type WalletNetwork } from "#/checkout/networks"

import {
  WalletPayError,
  type Eip1193Provider,
  type WalletSession,
  type WalletTransfer,
} from "../types"
import { guard } from "./failures"

const NATIVE_DECIMALS = 18
const FEE_DIGITS = 2

const roundUpSignificant = (units: bigint, digits: number): bigint => {
  const factor = 10n ** BigInt(Math.max(0, units.toString().length - digits))

  return ((units + factor - 1n) / factor) * factor
}

type EvmClient = ReturnType<typeof createEvmClient>

const createEvmClient = (provider: Eip1193Provider) =>
  createClient({ transport: custom(provider, { retryCount: 0 }) })

const getDecimals = async (client: EvmClient, { contract }: WalletTransfer): Promise<number> =>
  contract === null
    ? NATIVE_DECIMALS
    : readContract(client, {
        address: contract as Address,
        abi: erc20Abi,
        functionName: "decimals",
      })

const toCall = (account: Address, { to, contract }: WalletTransfer, value: bigint) => {
  if (contract === null) {
    return { account, to: to as Address, value, data: undefined }
  } else
    return {
      account,
      to: contract as Address,
      value: undefined,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [to as Address, value],
      }),
    }
}

const getMaxFeePerGas = async (client: EvmClient): Promise<bigint> => {
  try {
    return (await estimateFeesPerGas(client)).maxFeePerGas
  } catch {
    return getGasPrice(client)
  }
}

const getTransferBalance = (client: EvmClient, account: Address, transfer: WalletTransfer) =>
  transfer.contract === null
    ? getBalance(client, { address: account })
    : readContract(client, {
        address: transfer.contract as Address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [account],
      })

const checkFunds = async (client: EvmClient, account: Address, transfer: WalletTransfer) => {
  const [decimals, balance] = await Promise.all([
    getDecimals(client, transfer),
    getTransferBalance(client, account, transfer),
  ])

  const value = toBaseUnits(transfer.amount, decimals)

  if (balance < value) {
    throw new WalletPayError({
      kind: "insufficientAmount",
      balance: trimTrailingZeros(fromBaseUnits(balance, decimals)),
    })
  } else {
    const [gas, maxFeePerGas, nativeBalance] = await Promise.all([
      estimateGas(client, toCall(account, transfer, value)),
      getMaxFeePerGas(client),
      transfer.contract === null ? balance : getBalance(client, { address: account }),
    ])

    const fee = gas * maxFeePerGas
    const nativeSpent = transfer.contract === null ? value : 0n

    if (nativeBalance < nativeSpent + fee) {
      throw new WalletPayError({
        kind: "insufficientFee",
        fee: trimTrailingZeros(fromBaseUnits(roundUpSignificant(fee, FEE_DIGITS), NATIVE_DECIMALS)),
        feeSymbol: getNativeSymbol(transfer.network),
      })
    }
  }
}

const ensureNetwork = async (client: EvmClient, { chainId }: WalletNetwork) => {
  if ((await getChainId(client)) !== chainId) {
    try {
      await switchChain(client, { id: chainId })
    } catch {
      throw new WalletPayError({ kind: "wrongNetwork" })
    }

    if ((await getChainId(client)) !== chainId) {
      throw new WalletPayError({ kind: "wrongNetwork" })
    }
  }
}

export const connectEvmWallet = async (
  provider: Eip1193Provider,
  network: WalletNetwork,
): Promise<WalletSession> => {
  const client = createEvmClient(provider)

  const [account] = await guard(() => requestAddresses(client))()

  if (!account) {
    throw new WalletPayError({ kind: "locked" })
  } else
    return {
      account,
      ensureNetwork: guard(() => ensureNetwork(client, network)),
      checkFunds: guard((transfer) => checkFunds(client, account, transfer)),

      send: guard(async (transfer) => {
        const value = toBaseUnits(transfer.amount, await getDecimals(client, transfer))

        return sendTransaction(client, { ...toCall(account, transfer, value), chain: null })
      }),
    }
}
