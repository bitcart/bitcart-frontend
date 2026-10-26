import { getNormalizedErrorMessage, isNotFoundError } from "@bitcart/client-sdk/utils"
import { Button } from "@bitcart/ui-kit/components"
import type { MessageDescriptor } from "@lingui/core"
import { msg } from "@lingui/core/macro"
import { useLingui } from "@lingui/react/macro"
import { useQueryErrorResetBoundary } from "@tanstack/react-query"
import { useParams, useRouter, useSearch, type ErrorComponentProps } from "@tanstack/react-router"
import { AlertCircleIcon } from "lucide-react"
import type React from "react"
import { useCallback, useEffect } from "react"

import { CheckoutCard } from "#/checkout"
import { CheckoutAppConfigContext } from "#/checkout/runtime/context"
import { EMBED_APP_CONFIG, getEmbedHost, isEmbeddedByLoader } from "#/common/integrations/embed"

import { CheckoutHeader } from "./checkout-header"
import { PoweredByFooter } from "./powered-by-footer"

type ErrorSubject = "invoice" | "refund"

const ERROR_MESSAGES: Record<
  ErrorSubject,
  { notFound: MessageDescriptor; notFoundDetail: MessageDescriptor; failed: MessageDescriptor }
> = {
  invoice: {
    notFound: msg`Invoice not found`,
    notFoundDetail: msg`This invoice does not exist, or is no longer available.`,
    failed: msg`Failed to load invoice`,
  },

  refund: {
    notFound: msg`Refund not found`,
    notFoundDetail: msg`This refund does not exist, or is no longer available.`,
    failed: msg`Failed to load refund`,
  },
}

// FIXME: Extract into a Tanstack Kit package, once it exists.
export type ErrorFallbackProps = { subject: ErrorSubject; retry: () => void; error: unknown }

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ subject, retry, error }) => {
  const { t } = useLingui()
  const isNotFound = isNotFoundError(error)
  const messages = ERROR_MESSAGES[subject]

  return (
    <CheckoutCard>
      <CheckoutHeader />

      <div className="px-8 py-12 text-center">
        <AlertCircleIcon className="mb-4 size-12 text-destructive mx-auto" />

        <p className="text-lg font-semibold">
          {isNotFound ? t(messages.notFound) : t(messages.failed)}
        </p>

        <p className="mt-1 text-muted-foreground text-sm">
          {isNotFound ? t(messages.notFoundDetail) : getNormalizedErrorMessage(error)}
        </p>

        <Button className="mt-4" onClick={retry}>
          {t`Try Again`}
        </Button>
      </div>

      <PoweredByFooter />
    </CheckoutCard>
  )
}

const useRouteErrorRetry = (reset: () => void) => {
  const router = useRouter()
  const { reset: resetQueryErrors } = useQueryErrorResetBoundary()

  //* Suspense queries rethrow their cached errors until the query cache is reset with the boundary.
  useEffect(() => {
    resetQueryErrors()
  }, [resetQueryErrors])

  return useCallback(() => {
    reset()
    void router.invalidate()
  }, [reset, router])
}

export const InvoiceErrorFallback = ({ error, reset }: ErrorComponentProps) => {
  const handleRetry = useRouteErrorRetry(reset)
  const { invoiceId } = useParams({ strict: false })
  const isEmbeddedCheckout = isEmbeddedByLoader(useSearch({ strict: false }))

  useEffect(() => {
    if (isEmbeddedCheckout && invoiceId) getEmbedHost().fail(invoiceId, error)
  }, [isEmbeddedCheckout, invoiceId, error])

  const fallback = <ErrorFallback subject="invoice" error={error} retry={handleRetry} />
  if (isEmbeddedCheckout) {
    return <CheckoutAppConfigContext value={EMBED_APP_CONFIG}>{fallback}</CheckoutAppConfigContext>
  } else return fallback
}

export const RefundErrorFallback = ({ error, reset }: ErrorComponentProps) => {
  const handleRetry = useRouteErrorRetry(reset)

  return <ErrorFallback subject="refund" error={error} retry={handleRetry} />
}
