import { Button } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import type { MessageDescriptor } from "@lingui/core"
import { msg } from "@lingui/core/macro"
import { useLingui } from "@lingui/react/macro"
import { PrinterIcon } from "lucide-react"

import type { CheckoutReceiptPrinter } from "../receipt-printer"
import { PRINT_ERROR_COPY, type PrintState } from "../terminal"

const PRINT_BUTTON_LABELS: Record<PrintState["status"], MessageDescriptor> = {
  idle: msg`Print receipt`,
  printing: msg`Printing…`,
  printed: msg`Print again`,
  failed: msg`Print receipt`,
}

const isPrintBlocked = (state: PrintState) =>
  state.status === "printing" ||
  (state.status === "failed" && !PRINT_ERROR_COPY[state.code].retryable)

type PrintReceiptProps = {
  printer: CheckoutReceiptPrinter
  className?: string
}

export const PrintReceiptButton = ({ printer, className }: PrintReceiptProps) => {
  const { t } = useLingui()

  if (!printer.target) {
    return null
  } else
    return (
      <Button
        variant="outline"
        size="sm"
        className={className}
        disabled={isPrintBlocked(printer.state)}
        onClick={printer.print}
      >
        <PrinterIcon />
        {t(PRINT_BUTTON_LABELS[printer.state.status])}
      </Button>
    )
}

export const PrintReceiptFailure = ({ printer: { state }, className }: PrintReceiptProps) => {
  const { t } = useLingui()

  if (state.status !== "failed") {
    return null
  } else {
    const { title, action, showDiagnostic } = PRINT_ERROR_COPY[state.code]

    return (
      <div role="alert" className={cn("mt-4 text-xs", className)}>
        <p className="font-medium text-destructive-foreground">{t(title)}</p>
        <p className="mt-1 text-muted-foreground">{t(action)}</p>

        {showDiagnostic && state.diagnostic && (
          <p className="mt-1 font-mono text-muted-foreground">{state.diagnostic}</p>
        )}
      </div>
    )
  }
}
