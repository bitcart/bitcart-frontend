import type { CheckoutModel } from "../model"

type RequiredContentWarningParams = {
  templateId: string
  phase: CheckoutModel["phase"]
  missing: string
}

const REQUIRED_CONTENT_WARNING_PATTERN = /^Checkout template ".*" is missing required content/

export const formatRequiredContentWarning = ({
  templateId,
  phase,
  missing,
}: RequiredContentWarningParams) =>
  `Checkout template "${templateId}" is missing required content in the "${phase}" phase: ${missing}`

export const isRequiredContentWarning = (message: unknown) =>
  typeof message === "string" && REQUIRED_CONTENT_WARNING_PATTERN.test(message)
