import { BitcartWordmarkIcon } from "@bitcart/ui-kit/icons"
import { defineGetLayoutConfig } from "@bitcart/ui-kit/utils"
import { i18n } from "@lingui/core"

import { APP_LOCALE_IDS } from "#/app.config"
import { BRAND_UMBRELLA_NAME, PROJECT_CANONICAL_NAME } from "#/common/constants"

export const getLayoutConfig = defineGetLayoutConfig(() => ({
  i18n: {
    activeLocale: i18n.locale,
    availableLocales: APP_LOCALE_IDS,
  },

  brand: {
    name: BRAND_UMBRELLA_NAME,
    logoImageSrc: "/logo.png",
    logoIcon: BitcartWordmarkIcon,
  },

  project: {
    canonicalName: PROJECT_CANONICAL_NAME,
  },

  navigation: {
    directory: {
      labeledLinks: [],
    },
  },
}))
