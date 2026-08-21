import { BitcartLogoIcon } from "@bitcart/ui-kit/icons"
import type { LayoutConfig } from "@bitcart/ui-kit/types"
import { i18n } from "@lingui/core"
import { t } from "@lingui/core/macro"
import { GithubLogoIcon } from "@phosphor-icons/react/dist/csr/GithubLogo"

import { APP_LOCALE_IDS } from "@/app.config"
import { BRAND_UMBRELLA_NAME, PROJECT_CANONICAL_NAME } from "@/common/constants"

export const getLayoutConfig = (): LayoutConfig => ({
  i18n: {
    activeLocale: i18n.locale,
    availableLocales: APP_LOCALE_IDS,
  },

  brand: {
    name: BRAND_UMBRELLA_NAME,
    logoIcon: BitcartLogoIcon,
    logoImageSrc: "/logo.svg",
  },

  project: {
    canonicalName: PROJECT_CANONICAL_NAME,
    copyrightSinceYear: 2018,
    description: t`A minimal starting point for building a new Bitcart web application.`,
  },

  navigation: {
    navBarDisplayCapacity: { md: 2, lg: 4, xl: 6, "2xl": 7, "3xl": 8 },

    directory: {
      labeledLinks: [
        {
          groupTitle: t`Navigation`,

          items: [
            { label: t`Home`, href: "/" },

            {
              label: `${t`About`} ${BRAND_UMBRELLA_NAME}`,
              href: "https://bitcart.ai",
              isExternal: true,
            },
          ],
        },
      ],

      iconLinks: [
        {
          groupTitle: t`Project links`,

          items: [
            {
              icon: GithubLogoIcon,
              hint: t`Visit our GitHub repository`,
              href: "https://github.com/bitcart/bitcart-frontend",
              isExternal: true,
            },
          ],
        },
      ],
    },
  },
})
