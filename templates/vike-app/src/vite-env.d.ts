/// <reference types="vite/client" />

import type { envConfig } from "../env.config"

declare global {
  //! This app declares no client-side variables. Once it does, widen the union with
  //! `| keyof (typeof envConfig)["clientEnvSchemas"]`.
  type EnvVariableKey = keyof (typeof envConfig)["sharedEnvSchemas"]

  interface ImportMetaEnv extends Record<EnvVariableKey, string | undefined> {}
}
