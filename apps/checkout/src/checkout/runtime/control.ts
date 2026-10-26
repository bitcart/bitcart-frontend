import type { bitcartInvoices } from "@bitcart/client-sdk/endpoints"
import { useDocumentThemeMode } from "@bitcart/ui-kit/hooks"
import { useSelector } from "@tanstack/react-store"
import { useMemo, useState } from "react"

import {
  deriveCheckoutModel,
  type CheckoutModel,
  type CheckoutModelOptions,
  type CheckoutSource,
} from "../model"
import { useTerminalEnv } from "../terminal"
import { createCheckoutControl, type CheckoutControl } from "./control-store"

/** A control bound to one invoice: switching to another invoice starts from a fresh one. */
export const useCheckoutControl = (invoiceId: string): CheckoutControl => {
  const [control, setControl] = useState(createCheckoutControl)
  const [lastInvoiceId, setLastInvoiceId] = useState(invoiceId)

  //* Adjusted at render time to prevent a render with the previous invoice's choice.
  if (lastInvoiceId !== invoiceId) {
    setLastInvoiceId(invoiceId)
    setControl(createCheckoutControl())
  }

  return control
}

const useOpenedOnComplete = ({ id, status }: bitcartInvoices.Invoice): boolean => {
  const current = { invoiceId: id, isComplete: status === "complete" }
  const [opened, setOpened] = useState(current)

  if (opened.invoiceId !== id) {
    setOpened(current)

    return current.isComplete
  } else return opened.isComplete
}

export const useCheckoutModel = (
  source: CheckoutSource,
  { selection, control }: CheckoutModelOptions & { control: CheckoutControl },
): CheckoutModel => {
  const ui = useSelector(control)
  const mode = useDocumentThemeMode()
  const terminal = useTerminalEnv() !== null
  const openedOnComplete = useOpenedOnComplete(source.invoice)

  return useMemo(
    () =>
      deriveCheckoutModel(source, ui, control.actions, {
        selection,
        mode,
        terminal,
        openedOnComplete,
      }),
    [source, ui, control, selection, mode, terminal, openedOnComplete],
  )
}
