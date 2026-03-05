import { SOURCE_LOCALE_ID } from "@bitcart/core/constants"
import type { LinguiConfig } from "@lingui/conf"

import { SUPPORTED_LOCALE_IDS } from "./src/app.config"

const config: LinguiConfig = {
  sourceLocale: SOURCE_LOCALE_ID,
  locales: SUPPORTED_LOCALE_IDS as unknown as string[],
  compileNamespace: "es",

  catalogs: [
    {
      path: "<rootDir>/src/common/i18n/_generated/locales/{locale}",
      include: ["src", "../../packages/ui-kit/src"],

      // Delete the following line if you encounter TS issues during extraction
      exclude: ["src/**/*.d.ts"],
    },
  ],
}

export default config
