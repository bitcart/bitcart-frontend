import { useRouteErrorRetry } from "@bitcart/tanstack-start-kit/errors"
import { useNotFoundTracking } from "@bitcart/tanstack-start-kit/telemetry"
import { ErrorPageTemplate } from "@bitcart/ui-kit/components"
import type { ErrorComponentProps } from "@tanstack/react-router"

const PAGE_CLASS_NAME = "min-h-[70vh]"

export const NotFoundPage: React.FC = () => {
  useNotFoundTracking()

  return <ErrorPageTemplate statusCode={404} className={PAGE_CLASS_NAME} />
}

export const ErrorPage: React.FC<ErrorComponentProps> = ({ reset }) => {
  const handleRetry = useRouteErrorRetry(reset)

  return (
    <ErrorPageTemplate statusCode={500} handleRetry={handleRetry} className={PAGE_CLASS_NAME} />
  )
}
