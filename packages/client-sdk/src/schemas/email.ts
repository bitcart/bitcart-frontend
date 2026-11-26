import { z } from "zod"

/**
 * The schema of every `format: "email"` field, for wiring into the generated schemas
 * by `formatType` in `orval.config.ts`.
 *
 * Its pattern accepts the addresses accepted by the API, such as `a&b@example.com`,
 * rejected by zod's default email pattern.
 */
export const Email = z.email({ pattern: /^[^\s@"]+@[^\s@]+$/u })
