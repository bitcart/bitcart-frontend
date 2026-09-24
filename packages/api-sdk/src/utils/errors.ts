/**
 * Failure helpers for the generated SDK.
 *
 * `forceSuccessResponse` throws on any non-2xx, with the body on `info` and the code on `status`.
 * The body's shape is undocumented beyond `422`, arriving as FastAPI's `{ detail }`, the exception
 * handlers' `{ error, detail }`, auth's `{ message, status }`, or a bare `Internal Server Error`
 * string.
 */

import type { ApiFailureError, ApiValidationIssue } from "#/types"

//* A plain-text API error fits in a sentence. An HTML error page does not.
const MAX_PLAIN_BODY_LENGTH = 200

export const isApiFailure = (error: unknown): error is ApiFailureError =>
  error instanceof Error && typeof (error as ApiFailureError).status === "number"

export const getErrorStatusCode = (error: unknown): number | undefined =>
  isApiFailure(error) ? error.status : undefined

/**
 * Distinguishes a missing or expired token and an insufficient scope from other failures.
 */
export const isAuthError = (error: unknown): boolean => {
  const status = getErrorStatusCode(error)

  return status === 401 || status === 403
}

export const isNotFoundError = (error: unknown): boolean => getErrorStatusCode(error) === 404

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const isValidationIssue = (value: unknown): value is ApiValidationIssue =>
  isRecord(value) && typeof value.msg === "string" && Array.isArray(value.loc)

const describeIssue = (issue: ApiValidationIssue): string => {
  //* `loc` starts with the request part ("body", "query", ...), which is noise in a message.
  const field = issue.loc.slice(1).join(".")

  return field ? `${field}: ${issue.msg}` : issue.msg
}

/**
 * Field-level issues from a 422, or an empty array for any other failure.
 */
export const getValidationIssues = (error: unknown): ApiValidationIssue[] => {
  if (!isApiFailure(error) || !isRecord(error.info)) return []

  const { detail } = error.info

  return Array.isArray(detail) ? detail.filter(isValidationIssue) : []
}

/**
 * Extracts or produces a human-readable message for a failed request.
 */
export const getNormalizedErrorMessage = (error: unknown): string => {
  if (!isApiFailure(error)) return "Request failed"

  const { info, status } = error

  if (typeof info === "string") {
    const text = info.trim()

    if (text.length > 0 && text.length <= MAX_PLAIN_BODY_LENGTH && !text.startsWith("<")) {
      return text
    }
  }

  if (isRecord(info)) {
    const { detail, error: errorLabel, message } = info
    const issues = Array.isArray(detail) ? detail.filter(isValidationIssue).map(describeIssue) : []

    if (issues.length > 0) {
      return issues.join("; ")
    } else if (typeof detail === "string" && detail.length > 0) {
      return typeof errorLabel === "string" ? `${errorLabel}: ${detail}` : detail
    } else if (typeof errorLabel === "string") {
      return errorLabel
    } else if (typeof message === "string") return message
  }

  return `Request failed with status ${status}`
}
