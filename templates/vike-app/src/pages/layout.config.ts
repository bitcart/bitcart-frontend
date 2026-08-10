import { BitcartLogoIcon } from "@bitcart/ui-kit/icons"
import type { LayoutConfig } from "@bitcart/ui-kit/types"
import { type StaticLayoutMetadata } from "@bitcart/vike-kit/metadata"
import { i18n } from "@lingui/core"
import { t } from "@lingui/core/macro"
import { GithubLogoIcon } from "@phosphor-icons/react/dist/csr/GithubLogo"

import { SUPPORTED_LOCALE_IDS } from "@/app.config"
import { BRAND_UMBRELLA_NAME, PROJECT_CANONICAL_NAME } from "@/common/constants"

export const getLayoutMetadata = (): StaticLayoutMetadata => ({
  title: t`Bitcart Vike Example - Minimal App Boilerplate`,

  description: t`Minimal Vike application boilerplate with the shared Bitcart app shell, internationalization, and theming`,

  image: {
    src: "/logo.png",
    alt: `${BRAND_UMBRELLA_NAME} ${t`logo`}`,
    width: "600",
    height: "532",
  },

  author: "MrNaif2018",
})

export const getLayoutConfig = (): LayoutConfig => ({
  i18n: {
    activeLocale: i18n.locale,
    availableLocales: SUPPORTED_LOCALE_IDS,
  },

  brand: {
    name: BRAND_UMBRELLA_NAME,
    copyrightSinceYear: 2018,
    logoIcon: BitcartLogoIcon,
    logoImageSrc: "/logo.svg",
    logoImageAltText: `${BRAND_UMBRELLA_NAME} ${t`logo`}`,
    projectCanonicalName: PROJECT_CANONICAL_NAME,
    tagline: t`A minimal starting point for building a new Bitcart web application.`,
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
