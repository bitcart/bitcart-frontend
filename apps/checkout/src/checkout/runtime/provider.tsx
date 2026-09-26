import type { SocketConnectionHandle } from "@bitcart/core/types"
import type { ReactNode } from "react"

import type { CheckoutModel } from "../model"
import {
  CheckoutAppConfigContext,
  CheckoutConnectionContext,
  CheckoutContext,
  type CheckoutAppConfig,
} from "./context"

const EMPTY_APP_CONFIG: CheckoutAppConfig = {}

export const CheckoutProvider = ({
  model,
  connection = null,
  appConfig = EMPTY_APP_CONFIG,
  children,
}: {
  model: CheckoutModel
  connection?: SocketConnectionHandle | null
  appConfig?: CheckoutAppConfig
  children: ReactNode
}) => (
  <CheckoutContext value={model}>
    <CheckoutConnectionContext value={connection}>
      <CheckoutAppConfigContext value={appConfig}>{children}</CheckoutAppConfigContext>
    </CheckoutConnectionContext>
  </CheckoutContext>
)
