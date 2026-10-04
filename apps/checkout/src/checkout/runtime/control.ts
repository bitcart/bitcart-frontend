import { useDocumentThemeMode } from "@bitcart/ui-kit/hooks"
import { useSelector } from "@tanstack/react-store"
import { useMemo, useState } from "react"

import {
  deriveCheckoutModel,
  type CheckoutModel,
  type CheckoutModelOptions,
  type CheckoutSource,
} from "../model"
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

export const useCheckoutModel = (
  source: CheckoutSource,
  { selection, control }: CheckoutModelOptions & { control: CheckoutControl },
): CheckoutModel => {
  const ui = useSelector(control)
  const mode = useDocumentThemeMode()

  return useMemo(
    () => deriveCheckoutModel(source, ui, control.actions, { selection, mode }),
    [source, ui, control, selection, mode],
  )
}
