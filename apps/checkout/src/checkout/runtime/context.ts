import type { SocketConnectionHandle } from "@bitcart/core/types"
import { createContext, type ReactNode } from "react"

import type { CheckoutModel } from "../model"

export const CheckoutContext = createContext<CheckoutModel | null>(null)

export const CheckoutConnectionContext = createContext<SocketConnectionHandle | null>(null)

export type CheckoutAppConfig = {
  //* App chrome such as the locale and theme switchers, rendered wherever a template places
  //* `CheckoutControls`.
  controls?: ReactNode
}

export const CheckoutAppConfigContext = createContext<CheckoutAppConfig>({})
