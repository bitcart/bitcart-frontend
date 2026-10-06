import { PSEUDO_LOCALE_ID, SOURCE_LOCALE_ID } from "@bitcart/core/i18n"
import { defineConfig } from "@lingui/conf"
import { createSwcExtractor } from "@lingui/native-tools"

import { SUPPORTED_LOCALE_IDS } from "./constants.ts"
import { nodeEnv } from "./node-env.ts"

export default defineConfig({
  sourceLocale: SOURCE_LOCALE_ID,

  locales:
    nodeEnv.BITCART_ENV === "production"
      ? [...SUPPORTED_LOCALE_IDS]
      : [...SUPPORTED_LOCALE_IDS, PSEUDO_LOCALE_ID],

  pseudoLocale: nodeEnv.BITCART_ENV === "production" ? undefined : { locale: PSEUDO_LOCALE_ID },
  compileNamespace: "es",
  extractors: [createSwcExtractor()],

  catalogs: [
    {
      path: "<rootDir>/src/common/i18n/_generated/locales/{locale}",
      include: ["src"],

      // Delete the following line if you encounter TS issues during extraction
      exclude: ["src/**/*.d.ts", "src/templates/**", "src/**/*.spec.{ts,tsx}"],
    },

    {
      path: "<rootDir>/src/templates/{name}/locales/{locale}",
      include: ["src/templates/{name}"],
      exclude: ["src/templates/**/*.spec.{ts,tsx}"],
    },
  ],
})
