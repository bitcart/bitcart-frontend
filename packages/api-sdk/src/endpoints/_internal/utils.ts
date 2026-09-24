import type { ApiFailureError } from "#/types"
import { getNormalizedErrorMessage } from "#/utils"

const parseResponseBody = (response: Response, body: string | null): unknown => {
  if (!body) return {}

  const contentType = (response.headers.get("content-type") ?? "").toLowerCase()

  if (!contentType.includes("json")) return body

  try {
    return JSON.parse(body)
  } catch {
    //! A JSON content type is no guarantee: a gateway labels its own error page after the upstream.
    return body
  }
}

/**
 * Builds the error every generated operation throws on a non-2xx response.
 *
 * Orval's own failure branch throws a message-less `Error` and parses every body as JSON: a
 * plain-text 500 or a proxy's HTML 502 threw a `SyntaxError` before `status` was assigned.
 * `scripts/postprocess.ts` rewrites that branch into a call to `createApiFailureError`.
 */
export const createApiFailureError = (response: Response, body: string | null): ApiFailureError => {
  const failure: ApiFailureError = new Error()

  failure.info = parseResponseBody(response, body)
  failure.status = response.status
  failure.message = getNormalizedErrorMessage(failure)

  return failure
}
