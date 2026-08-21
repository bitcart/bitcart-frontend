import { defineGetLayoutConfig } from "@bitcart/ui-kit/utils"

import { APP_CANONICAL_NAME } from "@/common/constants"

export const getStoryLayoutConfig = defineGetLayoutConfig(() => ({
  i18n: {
    activeLocale: "en",
    availableLocales: ["en"],
  },

  brand: {
    name: "Bitcart",
    logoImageSrc: "/favicon.svg",
  },

  project: {
    canonicalName: APP_CANONICAL_NAME,
  },

  navigation: {
    navBarDisplayCapacity: { md: 2, lg: 4, xl: 6, "2xl": 7, "3xl": 8 },
    directory: { labeledLinks: [] },
  },
}))
