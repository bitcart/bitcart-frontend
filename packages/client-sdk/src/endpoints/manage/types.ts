import type { PublicPolicyResponseOutput } from "#/schemas"

/**
 * `GET /manage/policies` returns the public policies to everyone but server admins, which is how
 * checkout always reads it.
 */
export type Policies = PublicPolicyResponseOutput
