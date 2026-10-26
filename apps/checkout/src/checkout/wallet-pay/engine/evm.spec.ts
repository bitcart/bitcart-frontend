import { decodeFunctionData, erc20Abi } from "viem"
import { describe, expect, test } from "vitest"

import {
  createFakeEvmProvider,
  FAKE_EVM_ACCOUNT,
  FAKE_TX_HASH,
  type FakeEvmOptions,
} from "#/checkout/testing/fake-wallets"

import { WalletPayError, type WalletPayFailure, type WalletTransfer } from "../types"
import { connectEvmWallet } from "./evm"

const ETHEREUM = { family: "eip155", chainId: 1 } as const
const MERCHANT = "0x5a3b9c2d7e1f4a6b8c0d2e4f6a8b0c2d4e6f8a0b"
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7"

const ETH_TRANSFER: WalletTransfer = {
  network: ETHEREUM,
  to: MERCHANT,
  amount: "0.5",
  contract: null,
  symbol: "eth",
}

const USDT_TRANSFER: WalletTransfer = {
  ...ETH_TRANSFER,
  amount: "25.000000",
  contract: USDT,
  symbol: "usdt",
}

const connect = (options: FakeEvmOptions = {}) => {
  const fake = createFakeEvmProvider(options)

  return { fake, session: connectEvmWallet(fake.provider, ETHEREUM) }
}

const failureOf = async (promise: Promise<unknown>): Promise<WalletPayFailure> => {
  const error: unknown = await promise.then(
    () => null,
    (reason: unknown) => reason,
  )

  if (error instanceof WalletPayError) {
    return error.failure
  } else throw new Error(`Expected a WalletPayError, got ${String(error)}`)
}

describe("connectEvmWallet", () => {
  test("connects the wallet's first account", async () => {
    expect((await connect().session).account.toLowerCase()).toBe(FAKE_EVM_ACCOUNT.toLowerCase())
  })

  test.each([
    ["reject", { kind: "rejected" }],
    ["pending", { kind: "pending" }],
  ] as const)("reads a %sed connection as a failure", async (outcome, failure) => {
    expect(await failureOf(connect({ connect: outcome }).session)).toStrictEqual(failure)
  })

  describe("network", () => {
    test("stays on the invoice's network", async () => {
      const { fake, session } = connect()

      await (await session).ensureNetwork()

      expect(fake.calls.map(({ method }) => method)).not.toContain("wallet_switchEthereumChain")
    })

    test("asks the wallet to switch from another network", async () => {
      const { fake, session } = connect({ chainId: 137 })

      await (await session).ensureNetwork()

      expect(fake.getChainId()).toBe(1)
    })

    test("explains the network when the wallet won't switch", async () => {
      const { session } = connect({ chainId: 137, switchChain: "reject" })

      expect(await failureOf((await session).ensureNetwork())).toStrictEqual({
        kind: "wrongNetwork",
      })
    })
  })

  describe("funds", () => {
    test("accepts a balance covering the amount and the fee", async () => {
      await expect((await connect().session).checkFunds(ETH_TRANSFER)).resolves.toBeUndefined()
    })

    test("reports the balance short of the amount, without trailing zeros", async () => {
      const { session } = connect({ nativeBalance: 10n ** 17n })

      expect(await failureOf((await session).checkFunds(ETH_TRANSFER))).toStrictEqual({
        kind: "insufficientAmount",
        balance: "0.1",
      })
    })

    test("reports the fee a balance covering only the amount can't pay, rounded up", async () => {
      const { session } = connect({
        nativeBalance: 5n * 10n ** 17n,
        gas: 21_000n,
        gasPrice: 1_234_567_890n,
      })

      expect(await failureOf((await session).checkFunds(ETH_TRANSFER))).toStrictEqual({
        kind: "insufficientFee",
        fee: "0.000032",
        feeSymbol: "ETH",
      })
    })

    test("checks a token's own balance in its own decimals", async () => {
      const { session } = connect({ tokenBalance: 24_990_000n })

      expect(await failureOf((await session).checkFunds(USDT_TRANSFER))).toStrictEqual({
        kind: "insufficientAmount",
        balance: "24.99",
      })
    })

    test("asks for the network fee in the native coin on a token payment", async () => {
      const { session } = connect({ nativeBalance: 0n, gas: 65_000n })

      expect(await failureOf((await session).checkFunds(USDT_TRANSFER))).toMatchObject({
        kind: "insufficientFee",
        feeSymbol: "ETH",
      })
    })
  })

  describe("sending", () => {
    const sentTransaction = (calls: { method: string; params?: unknown }[]) => {
      const call = calls.find(({ method }) => method === "eth_sendTransaction")
      const [transaction] = (call?.params ?? [{}]) as [Record<string, string>]

      return transaction
    }

    test("sends the amount in wei to the payment address", async () => {
      const { fake, session } = connect()

      expect(await (await session).send(ETH_TRANSFER)).toBe(FAKE_TX_HASH)

      const sent = sentTransaction(fake.calls)

      expect(sent.to?.toLowerCase()).toBe(MERCHANT)
      expect(BigInt(sent.value ?? "0x0")).toBe(5n * 10n ** 17n)
    })

    test("calls the token's transfer with the amount in its own units", async () => {
      const { fake, session } = connect()

      await (await session).send(USDT_TRANSFER)

      const sent = sentTransaction(fake.calls)
      const call = decodeFunctionData({ abi: erc20Abi, data: sent.data as `0x${string}` })

      expect(sent.to?.toLowerCase()).toBe(USDT.toLowerCase())
      expect(call.functionName).toBe("transfer")
      expect(call.args).toStrictEqual([expect.stringMatching(/^0x5a3b9c/iu), 25_000_000n])
    })

    test("sends a token with 18 decimals in its own units", async () => {
      const { fake, session } = connect({ tokenDecimals: 18 })

      await (await session).send({ ...USDT_TRANSFER, amount: "25" })

      const sent = sentTransaction(fake.calls)
      const call = decodeFunctionData({ abi: erc20Abi, data: sent.data as `0x${string}` })

      expect(call.args[1]).toBe(25n * 10n ** 18n)
    })

    test("reads a declined payment as rejected", async () => {
      const { session } = connect({ send: "reject" })

      expect(await failureOf((await session).send(ETH_TRANSFER))).toStrictEqual({
        kind: "rejected",
      })
    })

    test("keeps the wallet's message for any other failure", async () => {
      const { session } = connect({ send: "fail" })
      const failure = await failureOf((await session).send(ETH_TRANSFER))

      expect(failure.kind).toBe("error")
    })
  })
})
