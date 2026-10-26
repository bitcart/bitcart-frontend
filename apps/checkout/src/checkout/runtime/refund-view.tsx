import type { CheckoutSource } from "../model"
import type { CheckoutRefundPage } from "../refund/page"
import { CheckoutRefundScreen } from "../refund/screen"
import type { CheckoutAppConfig } from "./context"
import { useCheckoutControl, useCheckoutModel } from "./control"
import { CheckoutProvider } from "./provider"
import { CheckoutThemeScope } from "./theme-scope"

type CheckoutRefundViewProps = {
  source: CheckoutSource
  page: CheckoutRefundPage
  appConfig?: CheckoutAppConfig
}

export const CheckoutRefundView = ({ source, page, appConfig }: CheckoutRefundViewProps) => {
  const control = useCheckoutControl(source.invoice.id)
  const model = useCheckoutModel(source, { selection: "preselect", control })

  return (
    <CheckoutProvider model={model} appConfig={appConfig}>
      <CheckoutThemeScope scopeId="refund" palettes={[model.branding.palette]}>
        <CheckoutRefundScreen page={page} />
      </CheckoutThemeScope>
    </CheckoutProvider>
  )
}
