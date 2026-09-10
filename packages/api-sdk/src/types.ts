/**
 * What a generated operation throws once `forceSuccessResponse` is enabled.
 */
export type ApiFailure = Error & {
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
