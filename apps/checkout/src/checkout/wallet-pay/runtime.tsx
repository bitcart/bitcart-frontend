import { useEffect, useEffectEvent, useRef } from "react"

import { useCheckout } from "../hooks"
import { WalletSheet } from "../parts/wallet-sheet"
import { watchInjectedWallets } from "./discovery"
import { useWalletPay, useWalletPayState, useWalletPayTarget } from "./kit"

const WALLET_PHASES = new Set(["address", "payment"])

export const WalletPayRuntime = () => {
  const model = useCheckout()
  const { discovery, control, runner } = useWalletPay()
  const target = useWalletPayTarget()
  const attempt = useWalletPayState((state) => state.attempt)
  const paid = model.phase === "payment" ? (model.payment.partial?.paid ?? null) : null
  const lastPaidRef = useRef(paid)

  useEffect(() => watchInjectedWallets(discovery), [discovery])

  const resumeAttempt = useEffectEvent(() => {
    if (
      attempt?.step.kind === "awaitingPayment" &&
      target?.phase === "payment" &&
      target.methodId === attempt.methodId
    ) {
      runner.resume(attempt.id, target)
    }
  })

  useEffect(() => resumeAttempt(), [attempt?.step.kind, model.phase])

  useEffect(() => {
    if (!WALLET_PHASES.has(model.phase)) control.actions.closeSheet()
  }, [control, model.phase])

  const clearSentPayment = useEffectEvent(() => {
    if (model.phase === "payment") control.actions.clearSent(model.payment.id)
  })

  useEffect(() => {
    if (lastPaidRef.current !== paid) {
      lastPaidRef.current = paid
      clearSentPayment()
    }
  }, [paid])

  return <WalletSheet />
}
