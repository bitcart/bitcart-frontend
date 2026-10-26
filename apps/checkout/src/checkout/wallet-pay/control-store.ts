import { createStore } from "@tanstack/store"

import type { WalletPayFailure } from "./types"

export type WalletChoice = {
  id: string
  name: string | null
  icon: string | null
}

export type WalletPayStep =
  | { kind: "connecting" }
  | { kind: "savingAddress" }
  | { kind: "awaitingPayment" }
  | { kind: "checking" }
  | { kind: "confirming" }
  | { kind: "mismatch"; account: string; expected: string }
  | { kind: "addressRejected" }
  | { kind: "failed"; failure: WalletPayFailure }

export type WalletPayAttempt = {
  id: string
  methodId: string
  wallet: WalletChoice
  step: WalletPayStep
}

export type WalletPayState = {
  isSheetOpen: boolean
  attempt: WalletPayAttempt | null

  sentHashes: Readonly<Record<string, string>>
}

export const INITIAL_WALLET_PAY_STATE: WalletPayState = {
  isSheetOpen: false,
  attempt: null,
  sentHashes: {},
}

export type WalletPayActions = {
  openSheet: () => void
  closeSheet: () => void
  begin: (attempt: Omit<WalletPayAttempt, "step">) => void
  advance: (attemptId: string, step: WalletPayStep) => void
  recordSent: (attemptId: string, methodId: string, hash: string) => void
  dismissAttempt: () => void
  clearSent: (methodId: string) => void
}

export const createWalletPayControl = () =>
  createStore<WalletPayState, WalletPayActions>(INITIAL_WALLET_PAY_STATE, ({ setState }) => {
    const updateAttempt = (attemptId: string, step: WalletPayStep) =>
      setState((state) =>
        state.attempt?.id === attemptId && state.attempt.step !== step
          ? { ...state, attempt: { ...state.attempt, step } }
          : state,
      )

    return {
      openSheet: () =>
        setState((state) => (state.isSheetOpen ? state : { ...state, isSheetOpen: true })),

      closeSheet: () =>
        setState((state) =>
          state.isSheetOpen || state.attempt
            ? { ...state, isSheetOpen: false, attempt: null }
            : state,
        ),

      begin: (attempt) =>
        setState((state) => ({
          ...state,
          isSheetOpen: true,
          attempt: { ...attempt, step: { kind: "connecting" } },
        })),

      advance: updateAttempt,

      recordSent: (attemptId, methodId, hash) =>
        setState((state) => {
          const isShown = state.attempt?.id === attemptId

          return {
            isSheetOpen: isShown ? false : state.isSheetOpen,
            attempt: isShown ? null : state.attempt,
            sentHashes: { ...state.sentHashes, [methodId]: hash },
          }
        }),

      dismissAttempt: () =>
        setState((state) => (state.attempt ? { ...state, attempt: null } : state)),

      clearSent: (methodId) =>
        setState((state) => {
          if (state.sentHashes[methodId] === undefined) {
            return state
          } else {
            const { [methodId]: _cleared, ...sentHashes } = state.sentHashes

            return { ...state, sentHashes }
          }
        }),
    }
  })

export type WalletPayControl = ReturnType<typeof createWalletPayControl>
