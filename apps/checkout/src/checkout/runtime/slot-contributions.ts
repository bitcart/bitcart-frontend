import type { bitcartInvoices } from "@bitcart/api-sdk/endpoints"
import type { ComponentType } from "react"

import type {
  CheckoutInvoiceSummary,
  CheckoutModel,
  CheckoutPayment,
  CheckoutStoreSummary,
} from "../model"

type ExtensionSlotBaseContext = {
  phase: CheckoutModel["phase"]
  invoice: CheckoutInvoiceSummary
  store: CheckoutStoreSummary
}

export type SlotContextMap = {
  "checkout:header-extra": ExtensionSlotBaseContext
  "checkout:payment-extra": ExtensionSlotBaseContext & { payment: CheckoutPayment }
  "checkout:status-extra": ExtensionSlotBaseContext & {
    status: bitcartInvoices.InvoiceTerminalStatus
  }
  "checkout:footer-extra": ExtensionSlotBaseContext
}

export type ExtensionSlotName = keyof SlotContextMap

export type ExtensionSlotContribution<TName extends ExtensionSlotName = ExtensionSlotName> = {
  [Name in TName]: {
    pluginId: string
    slot: Name

    //* Lower orders render first; contributions of equal order follow their plugin ids.
    order?: number

    //* Decides from the slot context whether to render; a ruled-out contribution never loads.
    when?: (context: SlotContextMap[Name]) => boolean

    load: () => Promise<{ default: ComponentType<{ context: SlotContextMap[Name] }> }>
  }
}[TName]

export const defineExtensionSlotContribution = <TName extends ExtensionSlotName>(
  contribution: ExtensionSlotContribution<TName>,
): ExtensionSlotContribution<TName> => contribution

const compareIds = (a: string, b: string) => (a < b ? -1 : Number(a > b))

export const compareContributions = (a: ExtensionSlotContribution, b: ExtensionSlotContribution) =>
  (a.order ?? 0) - (b.order ?? 0) || compareIds(a.pluginId, b.pluginId)

export const getSlotContext = <TName extends ExtensionSlotName>(
  name: TName,
  model: CheckoutModel,
): SlotContextMap[TName] => {
  const base = { phase: model.phase, invoice: model.invoice, store: model.store }

  const misplaced = () =>
    new Error(`The "${name}" slot was placed while the checkout is in "${model.phase}"`)

  if (name === "checkout:payment-extra") {
    if (model.phase !== "payment") {
      throw misplaced()
    } else return { ...base, payment: model.payment } as SlotContextMap[TName]
  } else if (name === "checkout:status-extra") {
    if (model.phase !== "status") {
      throw misplaced()
    } else return { ...base, status: model.status } as SlotContextMap[TName]
  } else return base as SlotContextMap[TName]
}

export const isWanted = (contribution: ExtensionSlotContribution, context: unknown): boolean => {
  try {
    //* The caller pairs each contribution with the context of its own slot.
    return contribution.when?.(context as never) ?? true
  } catch (error) {
    console.error(
      `Extension slot contribution "${contribution.pluginId}" to "${contribution.slot}" failed its predicate`,
      error,
    )

    return false
  }
}
