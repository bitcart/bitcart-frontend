import type { SocketConnectionHandle } from "@bitcart/core/types"
import { useCountdown } from "@bitcart/hooks"
import type { ReactNode } from "react"

import type { CheckoutModel } from "../model"
import {
  CheckoutAppConfigContext,
  CheckoutConnectionContext,
  CheckoutContext,
  CheckoutCountdownContext,
  type CheckoutAppConfig,
} from "./context"

const EMPTY_APP_CONFIG: CheckoutAppConfig = {}

const CheckoutCountdownProvider = ({
  seconds,
  children,
}: {
  seconds: number
  children: ReactNode
}) => {
  const countdown = useCountdown(seconds)

  return <CheckoutCountdownContext value={countdown}>{children}</CheckoutCountdownContext>
}

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
    <CheckoutCountdownProvider seconds={model.invoice.timeLeft}>
      <CheckoutConnectionContext value={connection}>
        <CheckoutAppConfigContext value={appConfig}>{children}</CheckoutAppConfigContext>
      </CheckoutConnectionContext>
    </CheckoutCountdownProvider>
  </CheckoutContext>
)
