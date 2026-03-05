import { ErrorPageTemplate } from "@bitcart/ui-kit/components"
import type { ErrorDisplayAttributes } from "@bitcart/ui-kit/types"
import { Link } from "@bitcart/vike-kit/navigation"
import { useLingui } from "@lingui/react/macro"
import { useMemo } from "react"
import { reload } from "vike/client/router"
import { usePageContext } from "vike-react/usePageContext"

export function Page() {
  const { t } = useLingui()
  const { abortReason, abortStatusCode, is404 } = usePageContext()

  const errorStatusCode = useMemo(() => {
    if (typeof abortReason === "object" && abortReason?.notAdmin) {
      return 403
    } else {
      return abortStatusCode ?? (is404 ? 404 : 400)
    }
  }, [abortReason, abortStatusCode, is404])

  const errorMeta: Partial<ErrorDisplayAttributes> = useMemo(() => {
    if (typeof abortReason === "object" && abortReason?.notAdmin) {
      return { message: t`You cannot access this page because you are not an administrator.` }
    } else {
      return { message: typeof abortReason === "string" ? abortReason : undefined }
    }
  }, [abortReason, t])

  return (
    <ErrorPageTemplate
      LinkComponent={Link}
      handleRetry={() => reload()}
      statusCode={errorStatusCode}
      message={errorMeta.message}
    >
      <p className="text-sm text-muted-foreground">
        {t`If you believe this is an error, please contact support or try refreshing the page.`}
      </p>
    </ErrorPageTemplate>
  )
}
