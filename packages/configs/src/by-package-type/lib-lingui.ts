import { defineConfig, type LinguiConfig } from "@lingui/conf"
import { createSwcExtractor } from "@lingui/native-tools"

/**
 * Lingui config for a library package that owns its catalogs. They hold every supported locale
 * plus the pseudo locale in every environment, since a package builds the same output for all of
 * them, and live in `src/i18n/_generated/locales`, gitignored like the apps' catalogs.
 */
export const defineLibLinguiConfig = ({
  sourceLocale,
  locales,
  pseudoLocale,
}: {
  sourceLocale: string
  locales: readonly string[]
  pseudoLocale: string
}): LinguiConfig =>
  defineConfig({
    sourceLocale,
    locales: [...locales, pseudoLocale],
    pseudoLocale: { locale: pseudoLocale },
    extractors: [createSwcExtractor()],

    catalogs: [
      {
        path: "<rootDir>/src/i18n/_generated/locales/{locale}",
        include: ["<rootDir>/src"],
        exclude: ["<rootDir>/src/**/*.d.ts", "<rootDir>/src/**/*.spec.{ts,tsx}"],
      },
    ],
  })
