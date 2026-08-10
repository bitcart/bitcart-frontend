import { PSEUDO_LOCALE_ID, SOURCE_LOCALE_ID } from "@bitcart/core/constants"
import { defineConfig } from "@lingui/conf"

import { SUPPORTED_LOCALE_IDS } from "./constants"
import { nodeEnv } from "./node-env"

export default defineConfig({
  sourceLocale: SOURCE_LOCALE_ID,

  locales:
    nodeEnv.BITCART_ENV === "production"
      ? SUPPORTED_LOCALE_IDS
      : [...SUPPORTED_LOCALE_IDS, PSEUDO_LOCALE_ID],

  pseudoLocale: nodeEnv.BITCART_ENV === "production" ? undefined : PSEUDO_LOCALE_ID,
  compileNamespace: "es",

  catalogs: [
    {
      path: "<rootDir>/src/common/i18n/_generated/locales/{locale}",
      include: ["src", "../../packages/ui-kit/src"],

      // Delete the following line if you encounter TS issues during extraction
      exclude: ["src/**/*.d.ts"],
    },
  ],
})
