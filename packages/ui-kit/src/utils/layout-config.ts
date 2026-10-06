import type { LayoutConfig } from "@/types"

//* FIXME: Explore the possible solutions for eliminating the need for a config factory
/**
 * Identity helper that constrains a layout configuration factory to the {@link LayoutConfig}
 * schema at the definition site, so host applications get the same type checking and
 * autocompletion without importing the type itself.
 *
 * The factory is returned untouched, preserving its parameters, the `getLayoutConfig` call
 * convention, and the narrower literal types the wrapped factory infers on its own.
 *
 * A factory producing localized values must take everything it reads as parameters, e.g. the
 * `i18n` instance from `useLingui()`, rather than reading the global `i18n` instance: React
 * Compiler memoizes the call on its arguments, so a parameterless factory runs only once.
 */
export const defineGetLayoutConfig = <T extends LayoutConfig, TArgs extends unknown[] = []>(
  getConfig: (...args: TArgs) => T,
): ((...args: TArgs) => T) => getConfig
