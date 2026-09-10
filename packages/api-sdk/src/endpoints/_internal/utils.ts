import type { ApiFailure } from "#/types"
import { getApiErrorMessage } from "#/utils"

// FIXME: Revisit on every new Orval release, until this workaround can finally be discarded.
//! Dropping the envelope at the codegen level (`includeHttpResponseReturnType: false`)
//! is broken in Orval 8.24.
/**
 * Extracts payload from `data.data`, applying a consumer-provided `select` if present.
 */
export const stripPayloadEnvelope =
  <TSource, TData = TSource>(select?: (data: TSource) => TData) =>
  ({ data }: { data: unknown }) =>
    select ? select(data as TSource) : (data as unknown as TData)

const parseFailureBody = (response: Response, body: string | null): unknown => {
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
 * `scripts/postprocess.ts` rewrites that branch into a call to `createApiFailure`.
 */
export const createApiFailure = (response: Response, body: string | null): ApiFailure => {
  const failure: ApiFailure = new Error()

  failure.info = parseFailureBody(response, body)
  failure.status = response.status

  //* A logger, an error overlay or a generic boundary reads only `message`, never `info`.
  failure.message = getApiErrorMessage(failure)

  return failure
}
