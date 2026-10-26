import { useLingui } from "@lingui/react"

import { useAmountFormat, useFormattingLocale } from "./amount-format"
import { useCheckout } from "./hooks"
import { getPrintedReceipt } from "./printed-receipt"
import { usePrinter, type PrintState } from "./terminal"

export type CheckoutReceiptPrinter = {
  target: "terminal" | "browser" | null
  state: PrintState
  print: () => void
}

export const useReceiptPrinter = (): CheckoutReceiptPrinter => {
  const { i18n } = useLingui()
  const format = useAmountFormat()
  const locale = useFormattingLocale()
  const model = useCheckout("status")
  const printer = usePrinter()
  const { receipt, environment } = model

  const getTarget = (): CheckoutReceiptPrinter["target"] => {
    if (!receipt) {
      return null
    } else if (printer.isAvailable) {
      return "terminal"
    } else if (environment.terminal) {
      return null
    } else return "browser"
  }

  const print = () => {
    if (receipt && printer.isAvailable) {
      void printer.print(
        getPrintedReceipt(model, receipt, { i18n, format, locale, origin: window.location.origin }),
      )
    } else window.print()
  }

  return { target: getTarget(), state: printer.state, print }
}
