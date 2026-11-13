import type { EnvConfig } from "./types"

/**
 * Builds the Vite `define` config from validated environment variables. The output maps
 * `import.meta.env.<KEY>` to its validated value (as a JSON string, or the literal `undefined`),
 * bypassing the need for client code to bundle Zod and repeat the validation routine.
 */
export const toViteEnvConfig = (
  { clientEnvSchemas, sharedEnvSchemas }: EnvConfig,
  env: Record<string, unknown>,
): Record<string, string> =>
  Object.fromEntries(
    Object.keys({ ...clientEnvSchemas, ...sharedEnvSchemas }).map((key) => [
      `import.meta.env.${key}`,
      JSON.stringify(env[key]) ?? "undefined",
    ]),
  )
