import type { SocketConnectionHandle } from "@bitcart/core/types"
import { useCountdown } from "@bitcart/hooks"
import type { ReactNode } from "react"
import { clamp } from "remeda"

import type { CheckoutModel } from "../model"
import { useWalletPayKit, WalletPayContext, type WalletPayKit } from "../wallet-pay/kit"
import {
  CheckoutAppConfigContext,
  CheckoutConnectionContext,
  CheckoutContext,
  CheckoutCountdownContext,
  type CheckoutAppConfig,
} from "./context"

const EMPTY_APP_CONFIG: CheckoutAppConfig = {}

const EXPIRING_SOON_SECONDS = 300

const CheckoutCountdownProvider = ({
  seconds,
  lifetimeSeconds,
  speed,
  children,
}: {
  seconds: number
  lifetimeSeconds: number
  speed?: number
  children: ReactNode
}) => {
  const countdown = useCountdown(seconds, { speed })

  const progress =
    lifetimeSeconds > 0 ? clamp(1 - countdown.secondsLeft / lifetimeSeconds, { min: 0, max: 1 }) : 1

  const isExpiringSoon =
    countdown.secondsLeft <= Math.min(EXPIRING_SOON_SECONDS, lifetimeSeconds / 2)

  return (
    <CheckoutCountdownContext value={{ ...countdown, progress, isExpiringSoon }}>
      {children}
    </CheckoutCountdownContext>
  )
}

export const CheckoutProvider = ({
  model,
  connection = null,
  appConfig = EMPTY_APP_CONFIG,
  countdownSpeed,
  walletPay,
  children,
}: {
  model: CheckoutModel
  connection?: SocketConnectionHandle | null
  appConfig?: CheckoutAppConfig
  countdownSpeed?: number

  walletPay?: WalletPayKit
  children: ReactNode
}) => {
  const ownWalletPay = useWalletPayKit(model.invoice.id)

  return (
    <CheckoutContext value={model}>
      <CheckoutCountdownProvider
        seconds={model.invoice.timeLeft}
        lifetimeSeconds={model.invoice.expirationSeconds}
        speed={countdownSpeed}
      >
        <CheckoutConnectionContext value={connection}>
          <CheckoutAppConfigContext value={appConfig}>
            <WalletPayContext value={walletPay ?? ownWalletPay}>{children}</WalletPayContext>
          </CheckoutAppConfigContext>
        </CheckoutConnectionContext>
      </CheckoutCountdownProvider>
    </CheckoutContext>
  )
}
