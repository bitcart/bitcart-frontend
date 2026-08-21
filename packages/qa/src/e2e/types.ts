import type { PlaywrightTestArgs } from "@playwright/test"

export type E2ETestTemplate = (args: PlaywrightTestArgs) => Promise<void>

/**
 * Parameterized template. The params argument becomes optional when every
 * param has a default, so such templates can be instantiated with a bare call.
 */
export type GenericE2ETestTemplate<TParams extends object> = (
  ...args: Record<never, never> extends TParams ? [params?: TParams] : [params: TParams]
) => E2ETestTemplate
