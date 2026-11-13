import { existsSync } from "node:fs"

import { toViteEnvConfig } from "@bitcart/core/env"
import { createEnv } from "@t3-oss/env-core"

import { envConfig } from "./env.config.ts"

for (const file of [".env", "../../.env"]) if (existsSync(file)) process.loadEnvFile(file)

export const nodeEnv = createEnv({
  clientPrefix: "BITCART_",
  emptyStringAsUndefined: true,
  client: envConfig.clientEnvSchemas,
  shared: envConfig.sharedEnvSchemas,
  runtimeEnv: process.env,
})

export const NODE_ENV_VITE_CONFIG = toViteEnvConfig(envConfig, nodeEnv)
