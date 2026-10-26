import { useMediaQuery } from "@bitcart/hooks"
import { useSelector } from "@tanstack/react-store"
import { shallow } from "@tanstack/store"
import { createContext, use, useState } from "react"

import { useCheckout } from "../hooks"
import { parseWalletNetwork, type WalletNetwork } from "../networks"
import { createWalletPayControl, type WalletPayState } from "./control-store"
import { createWalletDiscovery, selectInjectedWallets } from "./discovery"
import { createWalletPayRunner, type WalletPayTarget } from "./runner"
import type { InjectedWallet } from "./types"

export const createWalletPayKit = () => {
  const control = createWalletPayControl()

  return { discovery: createWalletDiscovery(), control, runner: createWalletPayRunner(control) }
}

export type WalletPayKit = ReturnType<typeof createWalletPayKit>

export const WalletPayContext = createContext<WalletPayKit | null>(null)

export const useWalletPayKit = (invoiceId: string): WalletPayKit => {
  const [kit, setKit] = useState(createWalletPayKit)
  const [lastInvoiceId, setLastInvoiceId] = useState(invoiceId)

  if (lastInvoiceId !== invoiceId) {
    setLastInvoiceId(invoiceId)
    setKit(createWalletPayKit())
  }

  return kit
}

export const useWalletPay = (): WalletPayKit => {
  const kit = use(WalletPayContext)

  if (!kit) {
    throw new Error("useWalletPay must be called inside a CheckoutProvider")
  } else return kit
}

export const useWalletPayState = <TSelected>(select: (state: WalletPayState) => TSelected) =>
  useSelector(useWalletPay().control, select)

const NO_WALLETS: InjectedWallet[] = []

export const useInjectedWallets = (network: WalletNetwork | null): InjectedWallet[] =>
  useSelector(
    useWalletPay().discovery,
    (state) => (network ? selectInjectedWallets(state, network.family) : NO_WALLETS),
    { compare: shallow },
  )

export const useWalletPayTarget = (): WalletPayTarget | null => {
  const model = useCheckout()

  if (model.phase === "address") {
    const network = parseWalletNetwork(model.method.network)

    return network
      ? { phase: "address", methodId: model.method.id, network, saveAddress: model.submitAddress }
      : null
  } else if (model.phase === "payment" && !model.invoice.isAnyAmount) {
    const { payment } = model
    const network = parseWalletNetwork(payment.network)

    return network
      ? {
          phase: "payment",
          methodId: payment.id,
          network,
          senderAddress: payment.senderAddress,

          transfer: {
            network,
            to: payment.address,
            amount: payment.amount,
            contract: payment.contract,
            symbol: payment.symbol,
          },
        }
      : null
  } else return null
}

export const useIsTouchDevice = (): boolean => useMediaQuery("(pointer: coarse)")
