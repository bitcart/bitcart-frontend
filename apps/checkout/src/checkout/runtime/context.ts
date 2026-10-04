import type { SocketConnectionHandle } from "@bitcart/core/types"
import { createContext, type ReactNode } from "react"

import type { CheckoutModel } from "../model"
import type { ExtensionSlotContribution } from "./slot-contributions"

export const CheckoutContext = createContext<CheckoutModel | null>(null)

export type CheckoutCountdown = {
  formatted: string
  secondsLeft: number
  isExpired: boolean
}

//* Kept out of the model: a tick re-renders only the components that show the countdown.
export const CheckoutCountdownContext = createContext<CheckoutCountdown | null>(null)

export const CheckoutConnectionContext = createContext<SocketConnectionHandle | null>(null)

export type CheckoutAppConfig = {
  //* App chrome such as the locale and theme switchers, rendered wherever a template places
  //* `CheckoutControls`.
  controls?: ReactNode

  //! Contributions load once per object: they must be defined once and never recreated on render.
  slots?: readonly ExtensionSlotContribution[]
}

export const CheckoutAppConfigContext = createContext<CheckoutAppConfig>({})
