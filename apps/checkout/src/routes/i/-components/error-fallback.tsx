import { getApiErrorMessage, isNotFoundError } from "@bitcart/api-sdk/utils"
import { Button } from "@bitcart/ui-kit/components"
import { t } from "@lingui/core/macro"
import { AlertCircleIcon } from "lucide-react"

import { CheckoutCard } from "./checkout-card"
import { CheckoutHeader } from "./checkout-header"
import { PoweredByFooter } from "./powered-by-footer"

export const ErrorFallback = ({ retry, error }: { retry: () => void; error: unknown }) => {
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
            : getApiErrorMessage(error)}
        </p>

        <Button className="mt-4" onClick={retry}>
          {t`Try Again`}
        </Button>
      </div>

      <PoweredByFooter />
    </CheckoutCard>
  )
}
