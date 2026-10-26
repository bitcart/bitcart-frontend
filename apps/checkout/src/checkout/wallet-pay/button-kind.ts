import { useCheckout } from "../hooks"
import type { CheckoutModel } from "../model"
import { parseWalletNetwork } from "../networks"
import {
  useInjectedWallets,
  useIsTouchDevice,
  useWalletPay,
  useWalletPayState,
  useWalletPayTarget,
} from "./kit"
import type { WalletPayTarget } from "./runner"
import type { InjectedWallet } from "./types"

export const getWalletMethod = (model: CheckoutModel) => {
  if (model.phase === "payment") {
    return model.payment
  } else if (model.phase === "address") {
    return model.method
  } else return null
}

export type WalletButtonKind =
  | { kind: "none" }
  | { kind: "sent"; hash: string }
  | { kind: "direct"; wallet: InjectedWallet; target: WalletPayTarget }
  | { kind: "sheet" }
  | { kind: "link"; href: string }

export const useWalletButtonKind = (): WalletButtonKind => {
  const model = useCheckout()
  const method = getWalletMethod(model)
  const target = useWalletPayTarget()
  const injected = useInjectedWallets(target?.network ?? null)
  const isTouchDevice = useIsTouchDevice()
  const sentHash = useWalletPayState(({ sentHashes }) => (method ? sentHashes[method.id] : null))
  const [directWallet] = isTouchDevice && injected.length === 1 ? injected : []

  if (model.environment.terminal || !method) {
    return { kind: "none" }
  } else if (sentHash && model.phase === "payment") {
    return { kind: "sent", hash: sentHash }
  } else if (directWallet && target) {
    return { kind: "direct", wallet: directWallet, target }
  } else if (model.phase === "payment") {
    return parseWalletNetwork(method.network)
      ? { kind: "sheet" }
      : { kind: "link", href: model.payment.paymentUrl }
  } else {
    return injected.length > 0 || method.walletLinks.length > 0
      ? { kind: "sheet" }
      : { kind: "none" }
  }
}

export const useWalletAction = (): (() => void) | null => {
  const button = useWalletButtonKind()
  const { control, runner } = useWalletPay()

  switch (button.kind) {
    case "none":
    case "sent":
      return null

    case "direct":
      return () => runner.start(button.wallet, button.target)

    case "sheet":
      return control.actions.openSheet

    case "link":
      return () => window.location.assign(button.href)
  }
}
