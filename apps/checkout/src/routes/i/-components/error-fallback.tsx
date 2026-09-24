import { getNormalizedErrorMessage, isNotFoundError } from "@bitcart/api-sdk/utils"
import { Button } from "@bitcart/ui-kit/components"
import { t } from "@lingui/core/macro"
import { AlertCircleIcon } from "lucide-react"
import type React from "react"

import { CheckoutCard } from "./checkout-card"
import { CheckoutHeader } from "./checkout-header"
import { PoweredByFooter } from "./powered-by-footer"

// FIXME: Extract into a Tanstack Kit package, once it exists.
export type ErrorFallbackProps = { retry: () => void; error: unknown }

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ retry, error }) => {
  const isNotFound = isNotFoundError(error)

  return (
    <CheckoutCard>
      <CheckoutHeader />

      <div className="px-8 py-12 text-center">
        <AlertCircleIcon className="mb-4 size-12 text-destructive mx-auto" />

        <p className="text-lg font-semibold">
          {isNotFound ? t`Invoice not found` : t`Failed to load invoice`}
        </p>

        <p className="mt-1 text-muted-foreground text-sm">
          {isNotFound
            ? t`This invoice does not exist, or is no longer available.`
            : getNormalizedErrorMessage(error)}
        </p>

        <Button className="mt-4" onClick={retry}>
          {t`Try Again`}
        </Button>
      </div>

      <PoweredByFooter />
    </CheckoutCard>
  )
}
