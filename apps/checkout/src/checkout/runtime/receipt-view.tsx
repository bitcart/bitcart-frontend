import type { ReactNode } from "react"

import type { CheckoutSource } from "../model"
import { CheckoutReceiptScreen } from "../screens/receipt-screen"
import type { CheckoutAppConfig } from "./context"
import { useCheckoutControl, useCheckoutModel } from "./control"
import { CheckoutProvider } from "./provider"
import { CheckoutThemeScope } from "./theme-scope"

type CheckoutReceiptViewProps = {
  source: CheckoutSource
  appConfig?: CheckoutAppConfig
  unavailable: ReactNode
}

export const CheckoutReceiptView = ({
  source,
  appConfig,
  unavailable,
}: CheckoutReceiptViewProps) => {
  const control = useCheckoutControl(source.invoice.id)
  const model = useCheckoutModel(source, { selection: "preselect", control })

  if (model.phase === "status" && model.receipt) {
    return (
      <CheckoutProvider model={model} appConfig={appConfig}>
        <CheckoutThemeScope scopeId="receipt" palettes={[model.branding.palette]}>
          <CheckoutReceiptScreen receipt={model.receipt} />
        </CheckoutThemeScope>
      </CheckoutProvider>
    )
  } else return unavailable
}
