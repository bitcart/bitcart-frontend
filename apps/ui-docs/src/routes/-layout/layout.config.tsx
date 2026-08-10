import { defineGetLayoutConfig } from "@bitcart/ui-kit/utils"
import type { BaseLayoutProps } from "@fumadocs/base-ui/layouts/shared"

import { APP_CANONICAL_NAME } from "@/common/constants"

export const getBaseLayoutProps = (): BaseLayoutProps => {
  return {
    nav: {
      // JSX supported
      title: APP_CANONICAL_NAME,
    },

    //* Replaced by ThemeSelector: the built-in switch only cycles light/dark/system
    //* and would write theme keys the brand-aware theming can't interpret.
    themeSwitch: { enabled: false },
  }
}

export const getStoryLayoutConfig = defineGetLayoutConfig(() => ({
  i18n: {
    activeLocale: "en",
    availableLocales: ["en"],
  },

  brand: {
    name: "Bitcart",
    logoImageSrc: "/favicon.svg",
    logoImageAltText: "Bitcart logo",
    projectCanonicalName: "bitcart",
  },

  navigation: {
    navBarDisplayCapacity: { md: 2, lg: 4, xl: 6, "2xl": 7, "3xl": 8 },
    directory: { labeledLinks: [] },
  },
}))
