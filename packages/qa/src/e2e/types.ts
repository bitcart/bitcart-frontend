import type { PlaywrightTestArgs } from "@playwright/test"

export type E2ETestTemplate = (args: PlaywrightTestArgs) => Promise<void>

export type GenericE2ETestTemplate<TParams extends object> = (params: TParams) => E2ETestTemplate
