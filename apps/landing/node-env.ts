import { createEnv } from "@t3-oss/env-core"
import dotenv from "dotenv"

import { envConfig } from "./env.config"

dotenv.config({ path: "../../.env", quiet: true })

export const nodeEnv = createEnv({
  clientPrefix: "BITCART_",
  emptyStringAsUndefined: true,
  client: envConfig.clientEnvSchemas,
  shared: envConfig.sharedEnvSchemas,
  runtimeEnv: process.env,
})
