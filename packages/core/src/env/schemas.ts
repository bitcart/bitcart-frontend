import { z } from "zod"

import { RUNTIME_ENV_TAGS } from "./constants"
import type { RuntimeEnvTag } from "./types"

export const runtimeEnvTagSchema: z.ZodType<RuntimeEnvTag, RuntimeEnvTag | undefined> = z
  .enum(RUNTIME_ENV_TAGS)
  .default("development")
