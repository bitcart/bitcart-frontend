import type { CheckoutPreviewStatus } from "@bitcart/qa"
import { useMemo, useState } from "react"

import type { CheckoutSource } from "../model"
import type { CheckoutAppConfig } from "../runtime/context"
import type { CheckoutTemplateRegistry } from "../runtime/registry"
import { CheckoutView } from "../runtime/view"
import type { CheckoutPalette } from "../theme/palette"
import { CHECKOUT_PREVIEW_SCENARIOS } from "./scenarios"

type CheckoutPreviewProps = {
  registry: CheckoutTemplateRegistry
  templateId: string
  status: CheckoutPreviewStatus
  palette?: CheckoutPalette | null
  appConfig?: CheckoutAppConfig
}

const ScenarioView = ({
  registry,
  templateId,
  status,
  palette,
  appConfig,
}: CheckoutPreviewProps) => {
  const scenario = CHECKOUT_PREVIEW_SCENARIOS[status]
  const [invoice, setInvoice] = useState(scenario.invoice)

  const source = useMemo<CheckoutSource>(
    () => ({
      ...scenario,
      invoice,
      appearance: palette ? { palette } : undefined,

      submitCustomerDetails: (update) => {
        setInvoice((current) => ({ ...current, ...update }))

        return Promise.resolve()
      },
    }),
    [scenario, invoice, palette],
  )

  return (
    <CheckoutView
      source={source}
      connection={null}
      registry={registry}
      templateId={templateId}
      appConfig={appConfig}
    />
  )
}

export const CheckoutPreview = (props: CheckoutPreviewProps) => (
  <ScenarioView key={props.status} {...props} />
)
