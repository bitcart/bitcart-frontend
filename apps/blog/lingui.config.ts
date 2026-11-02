import { PSEUDO_LOCALE_ID, SOURCE_LOCALE_ID } from "@bitcart/core/i18n"
import { defineConfig } from "@lingui/conf"
import { createSwcExtractor } from "@lingui/native-tools"

import { nodeEnv } from "./node-env.ts"

export default defineConfig({
  sourceLocale: SOURCE_LOCALE_ID,

  locales:
    nodeEnv.BITCART_ENV === "production"
      ? [SOURCE_LOCALE_ID]
      : [SOURCE_LOCALE_ID, PSEUDO_LOCALE_ID],

  pseudoLocale: nodeEnv.BITCART_ENV === "production" ? undefined : { locale: PSEUDO_LOCALE_ID },
  compileNamespace: "es",
  extractors: [createSwcExtractor()],

  catalogs: [
    {
      path: "<rootDir>/src/common/i18n/_generated/locales/{locale}",
      include: ["src"],
      exclude: ["src/**/*.d.ts", "src/**/*.spec.{ts,tsx}"],
    },
  ],
})
