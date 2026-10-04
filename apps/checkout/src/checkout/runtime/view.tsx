import type { SocketConnectionHandle } from "@bitcart/core/types"
import { useLingui } from "@lingui/react"
import { use, useEffect, useEffectEvent } from "react"

import type { CheckoutModel, CheckoutSource } from "../model"
import type { CheckoutAppConfig } from "./context"
import { useCheckoutControl, useCheckoutModel } from "./control"
import type { CheckoutControl } from "./control-store"
import { ErrorBoundary } from "./error-boundary"
import { CheckoutProvider } from "./provider"
import type { CheckoutTemplateRegistry } from "./registry"
import { CheckoutShell } from "./shell"

type CheckoutViewProps = {
  source: CheckoutSource
  connection: SocketConnectionHandle | null
  registry: CheckoutTemplateRegistry
  templateId: string
  appConfig?: CheckoutAppConfig
  control?: CheckoutControl
  onModelChange?: (model: CheckoutModel) => void
}

type CheckoutTemplateViewProps = Omit<CheckoutViewProps, "control"> & {
  control: CheckoutControl
}

const CheckoutTemplateView = ({
  source,
  connection,
  registry,
  templateId,
  appConfig,
  control,
  onModelChange,
}: CheckoutTemplateViewProps) => {
  const { i18n } = useLingui()
  const template = use(registry.load(templateId))

  //* Suspends only while the active locale's catalog is missing. A preloaded catalog renders
  //* without a loading state; a failed one renders the source messages.
  if (!registry.isCatalogSettled(templateId, i18n.locale)) {
    use(registry.settleCatalog(templateId, i18n.locale))
  }

  const model = useCheckoutModel(source, { selection: template.selection, control })
  const emitModelChange = useEffectEvent((changed: CheckoutModel) => onModelChange?.(changed))

  useEffect(() => {
    emitModelChange(model)
  }, [model])

  return (
    <CheckoutProvider model={model} connection={connection} appConfig={appConfig}>
      <CheckoutShell templateId={templateId} template={template} />
    </CheckoutProvider>
  )
}

//! The UI state lives above the error boundary, so a fallback or a template switch keeps it.
export const CheckoutView = ({ control, ...props }: CheckoutViewProps) => {
  const ownControl = useCheckoutControl(props.source.invoice.id)
  const viewProps = { ...props, control: control ?? ownControl }
  const { registry, templateId } = props

  if (templateId === registry.defaultId) {
    return <CheckoutTemplateView {...viewProps} />
  } else
    return (
      <ErrorBoundary
        key={templateId}
        errorMessage={`Checkout template "${templateId}" crashed, falling back to the default`}
        fallback={<CheckoutTemplateView {...viewProps} templateId={registry.defaultId} />}
      >
        <CheckoutTemplateView {...viewProps} />
      </ErrorBoundary>
    )
}
