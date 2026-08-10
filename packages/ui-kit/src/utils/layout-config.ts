import type { LayoutConfig } from "@/types"

//* FIXME: Explore the possible solutions for eliminating the need for a config factory
/**
 * Identity helper that constrains a layout configuration factory to the {@link LayoutConfig}
 * schema at the definition site, so host applications get the same type checking and
 * autocompletion without importing the type itself.
 *
 * The factory is returned untouched, preserving the `getLayoutConfig` call convention as well
 * as the narrower literal types the wrapped factory infers on its own.
 */
export const defineGetLayoutConfig = <T extends LayoutConfig>(getConfig: () => T): (() => T) =>
  getConfig
