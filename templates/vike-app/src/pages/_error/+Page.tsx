import { ErrorPageTemplate } from "@bitcart/ui-kit/components"
import { useLingui } from "@lingui/react/macro"
import { useMemo } from "react"
import { usePageContext } from "vike-react/usePageContext"
import { reload } from "vike/client/router"

export function Page() {
  const { t } = useLingui()
  const { abortReason, abortStatusCode, is404 } = usePageContext()

  const errorStatusCode = useMemo(
    () => abortStatusCode ?? (is404 ? 404 : 400),
    [abortStatusCode, is404],
  )

  const errorMessage = useMemo(
    () => (typeof abortReason === "string" ? abortReason : undefined),
    [abortReason],
  )

  return (
    <ErrorPageTemplate handleRetry={reload} statusCode={errorStatusCode} message={errorMessage}>
      <p className="text-sm text-muted-foreground">
        {is404
          ? t`If you believe this is a problem on our side, please contact support.`
          : t`Please try refreshing the page or contact support if the problem persists.`}
      </p>
    </ErrorPageTemplate>
  )
}
