import { z } from "zod"

import { RuntimeEnvTag } from "../types"

const runtimeEnvTags: RuntimeEnvTag[] = ["testing", "development", "production"]

export const runtimeEnvTagSchema: z.ZodType<RuntimeEnvTag, RuntimeEnvTag | undefined> = z
  .enum(runtimeEnvTags)
  .default("development")
