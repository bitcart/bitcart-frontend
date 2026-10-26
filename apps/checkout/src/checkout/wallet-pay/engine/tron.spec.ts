import { describe, expect, test } from "vitest"

import {
  createFakeTronProvider,
  FAKE_TRON_ACCOUNT,
  type FakeTronOptions,
} from "#/checkout/testing/fake-wallets"

import { WalletPayError, type WalletPayFailure, type WalletTransfer } from "../types"
import { connectTronWallet } from "./tron"

const TRON = { family: "tron", chainId: 728126428 } as const
const MERCHANT = "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf"
const USDT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"

const TRX_TRANSFER: WalletTransfer = {
  network: TRON,
  to: MERCHANT,
  amount: "208.333333",
  contract: null,
  symbol: "trx",
}

const USDT_TRANSFER: WalletTransfer = { ...TRX_TRANSFER, amount: "25.000000", contract: USDT }

const connect = (options: FakeTronOptions = {}) => {
  const fake = createFakeTronProvider(options)

  return { fake, session: connectTronWallet(fake.provider, TRON) }
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

describe("connectTronWallet", () => {
  test.each(["tip1193", "legacy", "bare"] as const)(
    "connects the account of a %s wallet",
    async (protocol) => {
      expect((await connect({ protocol }).session).account).toBe(FAKE_TRON_ACCOUNT)
    },
  )

  test.each([
    ["tip1193", "reject", { kind: "rejected" }],
    ["tip1193", "pending", { kind: "pending" }],
    ["legacy", "reject", { kind: "rejected" }],
    ["legacy", "pending", { kind: "pending" }],
    ["legacy", "locked", { kind: "locked" }],
  ] as const)(
    "reads a %s wallet's %s connection as a failure",
    async (protocol, outcome, failure) => {
      expect(await failureOf(connect({ protocol, connect: outcome }).session)).toStrictEqual(
        failure,
      )
    },
  )

  describe("network", () => {
    test("reads the network from the genesis block, and stays on it", async () => {
      await expect((await connect().session).ensureNetwork()).resolves.toBeUndefined()
    })

    test("asks a wallet on Nile to switch to the invoice's network", async () => {
      const { fake, session } = connect({ chainId: 3448148188 })

      await (await session).ensureNetwork()

      expect(fake.getChainId()).toBe(TRON.chainId)
    })

    test("explains the network to a wallet that can't switch", async () => {
      const { session } = connect({ protocol: "legacy", chainId: 3448148188 })

      expect(await failureOf((await session).ensureNetwork())).toStrictEqual({
        kind: "wrongNetwork",
      })
    })
  })

  describe("funds", () => {
    test("reports a TRX balance in sun short of the amount", async () => {
      const { session } = connect({ trxBalance: 100_500_000 })

      expect(await failureOf((await session).checkFunds(TRX_TRANSFER))).toStrictEqual({
        kind: "insufficientAmount",
        balance: "100.5",
      })
    })

    test.each([
      ["a bigint", 24_000_000n],
      ["an array holding the value", [24_000_000n]],
      ["a TronWeb 5 BigNumber", { toString: () => "24000000", _isBigNumber: true }],
    ])("reads a token balance returned as %s", async (_shape, tokenBalance) => {
      const { session } = connect({ tokenBalance })

      expect(await failureOf((await session).checkFunds(USDT_TRANSFER))).toStrictEqual({
        kind: "insufficientAmount",
        balance: "24",
      })
    })

    test("reads an 18-decimal token balance without losing digits", async () => {
      const { session } = connect({
        tokenBalance: 123_456_789_012_345_678_901n,
        tokenDecimals: [18n],
      })

      const transfer = { ...USDT_TRANSFER, amount: "1000" }

      expect(await failureOf((await session).checkFunds(transfer))).toStrictEqual({
        kind: "insufficientAmount",
        balance: "123.456789012345678901",
      })
    })
  })

  describe("sending", () => {
    test("builds, signs and broadcasts a TRX transfer in sun", async () => {
      const { fake, session } = connect()

      expect(await (await session).send(TRX_TRANSFER)).toBe("c0ffee")
      expect(fake.sent).toStrictEqual([{ kind: "trx", to: MERCHANT, amount: "208333333" }])
    })

    test("calls the token's transfer with the amount in its own units", async () => {
      const { fake, session } = connect()

      await (await session).send(USDT_TRANSFER)

      expect(fake.sent).toStrictEqual([
        { kind: "trc20", to: MERCHANT, amount: "25000000", contract: USDT },
      ])
    })

    test("sends a token in its own decimals", async () => {
      const { fake, session } = connect({ tokenDecimals: 18n })

      await (await session).send({ ...USDT_TRANSFER, amount: "25" })

      expect(fake.sent[0]?.amount).toBe((25n * 10n ** 18n).toString())
    })

    test("reads TronLink's declined signature as rejected", async () => {
      const { session } = connect({ sign: "reject" })

      expect(await failureOf((await session).send(TRX_TRANSFER))).toStrictEqual({
        kind: "rejected",
      })
    })
  })
})
