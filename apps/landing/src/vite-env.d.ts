/// <reference types="vite/client" />

import type { envConfig } from "../env.config"

declare global {
  type EnvVariableKey =
    | keyof (typeof envConfig)["clientEnvSchemas"]
    | keyof (typeof envConfig)["sharedEnvSchemas"]

  interface ImportMetaEnv extends Record<EnvVariableKey, string | undefined> {}
}
