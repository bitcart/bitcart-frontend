export { type infer as FromSchema } from "zod"

/**
 * [POSIX locale id format](https://en.wikipedia.org/wiki/Locale_(computer_software)#POSIX_platforms)
 * in the particular `language_TERRITORY` form [as required by Open Graph](https://ogp.me/#optional)
 */
export type PosixLocaleId<TSupportedLocaleId extends string> = `${TSupportedLocaleId}_${string}`

export type RuntimeEnvTag = "development" | "production"
