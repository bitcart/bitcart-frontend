import type { z } from "zod"

export type RuntimeEnvTag = "testing" | "development" | "production"

export type EnvConfig = {
  clientEnvSchemas: Record<string, z.ZodType>
  sharedEnvSchemas: Record<string, z.ZodType>
}

export type InferEnv<Config extends EnvConfig> = {
  [Key in keyof Config["clientEnvSchemas"]]: z.output<Config["clientEnvSchemas"][Key]>
} & {
  [Key in keyof Config["sharedEnvSchemas"]]: z.output<Config["sharedEnvSchemas"][Key]>
}
