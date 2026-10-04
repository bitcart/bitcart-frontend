import type { SocketConnectionHandle } from "@bitcart/core/types"
import { use } from "react"

import type { CheckoutModel } from "./model"
import {
  CheckoutAppConfigContext,
  CheckoutConnectionContext,
  CheckoutContext,
  CheckoutCountdownContext,
  type CheckoutAppConfig,
  type CheckoutCountdown,
} from "./runtime/context"

type CheckoutPhase = CheckoutModel["phase"]

export function useCheckout(): CheckoutModel

export function useCheckout<TPhase extends CheckoutPhase>(
  phase: TPhase,
): Extract<CheckoutModel, { phase: TPhase }>

export function useCheckout(phase?: CheckoutPhase): CheckoutModel {
  const model = use(CheckoutContext)

  if (!model) {
    throw new Error("useCheckout must be called inside a CheckoutProvider")
  } else if (phase && model.phase !== phase) {
    throw new Error(`useCheckout("${phase}") was called while the checkout is in "${model.phase}"`)
  } else return model
}

export const useCheckoutCountdown = (): CheckoutCountdown => {
  const countdown = use(CheckoutCountdownContext)

  if (!countdown) {
    throw new Error("useCheckoutCountdown must be called inside a CheckoutProvider")
  } else return countdown
}

export const useCheckoutConnection = (): SocketConnectionHandle | null =>
  use(CheckoutConnectionContext)

export const useCheckoutAppConfig = (): CheckoutAppConfig => use(CheckoutAppConfigContext)
