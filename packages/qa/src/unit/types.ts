import type { TestContext } from "vitest"

export type UnitTestTemplate = (context: TestContext) => void | Promise<void>

/**
 * Parameterized template. The params argument becomes optional when every
 * param has a default, so such templates can be instantiated with a bare call.
 */
export type GenericUnitTestTemplate<TParams extends object> = (
  ...args: Record<never, never> extends TParams ? [params?: TParams] : [params: TParams]
) => UnitTestTemplate
