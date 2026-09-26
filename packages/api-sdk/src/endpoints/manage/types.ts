import type { PolicyOutput } from "#/schemas"

/**
 * `GET /manage/policies` strips the secret fields for anonymous callers, which is how checkout
 * always reads it.
 */
export type Policies = Omit<PolicyOutput, "captcha_secretkey" | "email_settings">
