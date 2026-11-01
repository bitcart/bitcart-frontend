import type { Extractor } from "unocss"

/**
 * Extracts the variant chains with quoted attribute values dropped by the built-in extractors.
 *
 * The built-in pattern for quoted values fits only some selector shapes: without this extractor,
 * `[&:has([data-slot='x']:focus-visible)]:ring-2` and `*:[&:not([data-x='1'])]:p-1` generate no
 * CSS. Tokens split on whitespace, double quotes and backticks, keeping single quotes intact.
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
