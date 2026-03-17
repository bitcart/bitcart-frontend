import type { Extractor } from "unocss"

/**
 * Extractor for complex variant chains containing characters that UnoCSS's
 * built-in extractor skips (stops at `*`, `(`, `)` etc.), e.g.:
 *   [&_svg:not([class*='text-'])]:text-muted-foreground
 *   [&[data-variant=destructive]_svg]:text-destructive-foreground
 *
 * Tokens are split on whitespace, double quotes, and backticks — NOT single
 * quotes, since those appear inside attribute selectors like [class*='text-'].
 * Tokens must look like variant chains: contain `:`, start with a class-name
 * character, end with a word character, and contain at least one of `*`/`(`/`)`/`=`
 * (characters the built-in extractor's `[\w&:[\]-]` char class stops at).
 */
export const extractorNestedArbitraryVariants: Extractor = {
  name: "nested-arbitrary-variants",

  extract: ({ code }) =>
    [...code.matchAll(/[^\s"`]+/g)].reduce((results, { 0: token }) => {
      if (
        token.includes(":") &&
        /[*()=]/.test(token) &&
        /^[-\w[&*!@]/.test(token) &&
        /\w$/.test(token)
      ) {
        results.add(token)
      }

      return results
    }, new Set<string>()),
}
