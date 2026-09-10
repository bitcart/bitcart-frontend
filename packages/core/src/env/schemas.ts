import { z } from "zod"

import type { RuntimeEnvTag } from "../common/types"
import { RUNTIME_ENV_TAGS } from "./constants"

export const runtimeEnvTagSchema: z.ZodType<RuntimeEnvTag, RuntimeEnvTag | undefined> = z
  .enum(RUNTIME_ENV_TAGS)
  .default("development")
