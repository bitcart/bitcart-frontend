import type { SocketConnectionHandle } from "@bitcart/core/types"
import { use } from "react"

import { useCheckoutModel, type CheckoutSource } from "../model"
import type { CheckoutAppConfig } from "./context"
import { CheckoutProvider } from "./provider"
import type { CheckoutTemplateRegistry } from "./registry"
import { CheckoutShell } from "./shell"
import { TemplateBoundary } from "./template-boundary"

type CheckoutViewProps = {
  source: CheckoutSource
  connection: SocketConnectionHandle | null
  registry: CheckoutTemplateRegistry
  templateId: string
  appConfig?: CheckoutAppConfig
}

const CheckoutTemplateView = ({
  source,
  connection,
  registry,
  templateId,
  appConfig,
}: CheckoutViewProps) => {
  const template = use(registry.load(templateId))
  const model = useCheckoutModel(source, { selection: template.selection })

  return (
    <CheckoutProvider model={model} connection={connection} appConfig={appConfig}>
      <CheckoutShell screens={template} />
    </CheckoutProvider>
  )
}

export const CheckoutView = (props: CheckoutViewProps) => {
  const { registry, templateId } = props

  if (templateId === registry.defaultId) {
    return <CheckoutTemplateView {...props} />
  } else
    return (
      <TemplateBoundary
        key={templateId}
        templateId={templateId}
        fallback={<CheckoutTemplateView {...props} templateId={registry.defaultId} />}
      >
        <CheckoutTemplateView {...props} />
      </TemplateBoundary>
    )
}
