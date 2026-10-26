import { beforeAll, describe, expect, test, vi } from "vitest"

import {
  createFakeEvmProvider,
  FAKE_EVM_ACCOUNT,
  FAKE_TX_HASH,
  type FakeEvmOptions,
} from "../testing/fake-wallets"
import { createWalletPayControl } from "./control-store"
import { createWalletPayRunner, type WalletPayTarget } from "./runner"
import type { InjectedWallet } from "./types"

const ETHEREUM = { family: "eip155", chainId: 1 } as const

type PaymentTarget = Extract<WalletPayTarget, { phase: "payment" }>

const paymentTarget = (senderAddress: string | null = null): WalletPayTarget => ({
  phase: "payment",
  methodId: "method-eth",
  network: ETHEREUM,
  senderAddress,

  transfer: {
    network: ETHEREUM,
    to: "0x5a3b9c2d7e1f4a6b8c0d2e4f6a8b0c2d4e6f8a0b",
    amount: "0.5",
    contract: null,
    symbol: "eth",
  },
})

const setup = (options: FakeEvmOptions = {}) => {
  const fake = createFakeEvmProvider(options)
  const control = createWalletPayControl()
  const runner = createWalletPayRunner(control)

  const wallet: InjectedWallet = {
    family: "eip155",
    id: "eip155:test",
    name: "Test Wallet",
    icon: null,
    provider: fake.provider,
  }

  return { fake, control, runner, wallet }
}

beforeAll(async () => {
  await import("./engine")
})

describe("createWalletPayRunner", () => {
  test("records a sent payment and closes the sheet", async () => {
    const { control, runner, wallet } = setup()

    runner.start(wallet, paymentTarget())

    expect(control.state.attempt?.step).toStrictEqual({ kind: "connecting" })
    expect(control.state.isSheetOpen).toBe(true)

    await vi.waitFor(() =>
      expect(control.state.sentHashes).toStrictEqual({ "method-eth": FAKE_TX_HASH }),
    )

    expect(control.state.attempt).toBeNull()
    expect(control.state.isSheetOpen).toBe(false)
  })

  test("blocks an account other than the saved sender address", async () => {
    const { fake, control, runner, wallet } = setup()
    const expected = "0x0000000000000000000000000000000000000001"

    runner.start(wallet, paymentTarget(expected))

    await vi.waitFor(() =>
      expect(control.state.attempt?.step).toStrictEqual({
        kind: "mismatch",
        account: FAKE_EVM_ACCOUNT,
        expected,
      }),
    )

    expect(fake.calls.map(({ method }) => method)).not.toContain("eth_sendTransaction")
  })

  test("takes the saved sender address in any checksum casing", async () => {
    const { control, runner, wallet } = setup()

    runner.start(wallet, paymentTarget(FAKE_EVM_ACCOUNT.toLowerCase()))

    await vi.waitFor(() => expect(control.state.sentHashes["method-eth"]).toBe(FAKE_TX_HASH))
  })

  test("shows a declined payment as the attempt's failure", async () => {
    const { control, runner, wallet } = setup({ send: "reject" })

    runner.start(wallet, paymentTarget())

    await vi.waitFor(() =>
      expect(control.state.attempt?.step).toStrictEqual({
        kind: "failed",
        failure: { kind: "rejected" },
      }),
    )
  })

  test("asks the wallet for another account before connecting, when asked to", async () => {
    const { fake, runner, wallet } = setup()

    runner.start(wallet, paymentTarget(), { reselectAccount: true })

    await vi.waitFor(() =>
      expect(fake.calls.slice(0, 2).map(({ method }) => method)).toStrictEqual([
        "wallet_requestPermissions",
        "eth_requestAccounts",
      ]),
    )
  })

  test("keeps a payment the wallet sent after the buyer moved on, without reopening the sheet", async () => {
    const { control, runner, wallet } = setup()

    runner.start(wallet, paymentTarget())
    control.actions.closeSheet()

    await vi.waitFor(() => expect(control.state.sentHashes["method-eth"]).toBe(FAKE_TX_HASH))

    expect(control.state.isSheetOpen).toBe(false)
    expect(control.state.attempt).toBeNull()
  })

  describe("in the address phase", () => {
    const addressTarget = (outcome: "accepted" | "rejected") => {
      const saveAddress = vi.fn(() => Promise.resolve(outcome))

      const target: WalletPayTarget = {
        phase: "address",
        methodId: "method-eth",
        network: ETHEREUM,
        saveAddress,
      }

      return { target, saveAddress }
    }

    test("saves the wallet's account, then pays once, however often it's resumed", async () => {
      const { fake, control, runner, wallet } = setup()
      const { target, saveAddress } = addressTarget("accepted")
      const payment = paymentTarget(FAKE_EVM_ACCOUNT) as PaymentTarget

      runner.start(wallet, target)

      await vi.waitFor(() =>
        expect(control.state.attempt?.step).toStrictEqual({ kind: "awaitingPayment" }),
      )

      expect(saveAddress).toHaveBeenCalledWith(FAKE_EVM_ACCOUNT)

      const attemptId = control.state.attempt?.id ?? ""

      runner.resume(attemptId, payment)
      runner.resume(attemptId, payment)

      await vi.waitFor(() => expect(control.state.sentHashes["method-eth"]).toBe(FAKE_TX_HASH))

      expect(fake.calls.filter(({ method }) => method === "eth_sendTransaction")).toHaveLength(1)
    })

    test("reports an address the store rejected", async () => {
      const { control, runner, wallet } = setup()

      runner.start(wallet, addressTarget("rejected").target)

      await vi.waitFor(() =>
        expect(control.state.attempt?.step).toStrictEqual({ kind: "addressRejected" }),
      )
    })
  })
})
