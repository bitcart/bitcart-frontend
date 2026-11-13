/// <reference types="vite/client" />

import type { InferEnv } from "@bitcart/core/env"

import type { envConfig } from "../env.config"

declare global {
  interface ImportMetaEnv extends InferEnv<typeof envConfig> {}
}
