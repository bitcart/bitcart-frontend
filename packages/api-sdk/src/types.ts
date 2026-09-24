/**
 * What a generated operation throws once `forceSuccessResponse` is enabled.
 */
export type ApiFailureError = Error & {
  /** The parsed response body. */
  info?: unknown
  status?: number
}

/**
 * A single field-level failure from FastAPI's request validation.
 */
export type ApiValidationIssue = {
  loc: (string | number)[]
  msg: string
  type: string
}

// FIXME: Remove once schema exposes the pagination model.
/**
 * The envelope returned by every list endpoint.
 *
 * `next` and `previous` hold the URL of the adjacent page, or null at either end of the range.
 * Both stay null where the endpoint returns a whole collection in one response.
 */
export type PaginatedData<TResult> = {
  count: number
  next: string | null
  previous: string | null
  result: TResult[]
}
