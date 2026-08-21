import { z } from "zod"

import type { RuntimeEnvTag } from "../common/types"

const runtimeEnvTags: RuntimeEnvTag[] = ["testing", "development", "production"]

export const runtimeEnvTagSchema: z.ZodType<RuntimeEnvTag, RuntimeEnvTag | undefined> = z
  .enum(runtimeEnvTags)
  .default("development")
