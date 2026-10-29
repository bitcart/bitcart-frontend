import type { CheckoutSenderAddressOutcome } from "../model"
import type { WalletNetwork } from "../networks"
import type { WalletPayControl } from "./control-store"
import { toWalletPayFailure } from "./engine/failures"
import type { InjectedWallet, WalletSession, WalletTransfer } from "./types"

type WalletPayTargetBase = {
  methodId: string
  network: WalletNetwork
}

export type WalletPayTarget =
  | (WalletPayTargetBase & {
      phase: "address"
      saveAddress: (address: string) => Promise<CheckoutSenderAddressOutcome>
    })
  | (WalletPayTargetBase & {
      phase: "payment"
      transfer: WalletTransfer
      senderAddress: string | null
    })

type PaymentTarget = Extract<WalletPayTarget, { phase: "payment" }>

export type WalletPayStartOptions = {
  reselectAccount?: boolean
}

const isSameAccount = (account: string, expected: string, { family }: WalletNetwork) =>
  family === "eip155" ? account.toLowerCase() === expected.toLowerCase() : account === expected

const reselectAccount = async (wallet: InjectedWallet) => {
  if (wallet.family === "eip155") {
    await wallet.provider.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    })
  }
}

export const createWalletPayRunner = (control: WalletPayControl) => {
  const { advance, begin, recordSent } = control.actions
  const connectedSessions = new Map<string, WalletSession>()

  let attemptCount = 0

  const run = async (attemptId: string, steps: () => Promise<void>) => {
    try {
      await steps()
    } catch (error) {
      advance(attemptId, { kind: "failed", failure: toWalletPayFailure(error) })
    }
  }

  const pay = async (attemptId: string, session: WalletSession, target: PaymentTarget) => {
    const { senderAddress, transfer, network, methodId } = target

    if (senderAddress !== null && !isSameAccount(session.account, senderAddress, network)) {
      advance(attemptId, { kind: "mismatch", account: session.account, expected: senderAddress })
    } else {
      advance(attemptId, { kind: "checking" })
      await session.checkFunds(transfer)
      advance(attemptId, { kind: "confirming" })
      recordSent(attemptId, methodId, await session.send(transfer))
    }
  }

  return {
    start: (
      wallet: InjectedWallet,
      target: WalletPayTarget,
      options: WalletPayStartOptions = {},
    ) => {
      attemptCount += 1

      const attemptId = String(attemptCount)
      const { id, name, icon, logoId } = wallet

      begin({ id: attemptId, methodId: target.methodId, wallet: { id, name, icon, logoId } })

      void run(attemptId, async () => {
        if (options.reselectAccount) await reselectAccount(wallet)

        const { connectWallet } = await import("./engine")
        const session = await connectWallet(wallet, target.network)

        advance(attemptId, { kind: "checking" })
        await session.ensureNetwork()

        if (target.phase === "payment") {
          await pay(attemptId, session, target)
        } else {
          advance(attemptId, { kind: "savingAddress" })

          if ((await target.saveAddress(session.account)) === "accepted") {
            connectedSessions.set(attemptId, session)
            advance(attemptId, { kind: "awaitingPayment" })
          } else advance(attemptId, { kind: "addressRejected" })
        }
      })
    },

    resume: (attemptId: string, target: PaymentTarget) => {
      const session = connectedSessions.get(attemptId)

      connectedSessions.delete(attemptId)

      if (session) void run(attemptId, () => pay(attemptId, session, target))
    },
  }
}

export type WalletPayRunner = ReturnType<typeof createWalletPayRunner>
