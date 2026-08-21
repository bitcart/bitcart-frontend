import { BitcartLogoIcon } from "@bitcart/ui-kit/icons"
import { defineGetLayoutConfig } from "@bitcart/ui-kit/utils"
import { i18n } from "@lingui/core"
import { t } from "@lingui/core/macro"
import { GithubLogoIcon } from "@phosphor-icons/react/dist/csr/GithubLogo"
import { InstagramLogoIcon } from "@phosphor-icons/react/dist/csr/InstagramLogo"
import { LinkedinLogoIcon } from "@phosphor-icons/react/dist/csr/LinkedinLogo"
import { RedditLogoIcon } from "@phosphor-icons/react/dist/csr/RedditLogo"

import { APP_LOCALE_IDS } from "@/app.config"
import { BRAND_UMBRELLA_NAME, PROJECT_CANONICAL_NAME } from "@/common/constants"

export const getLayoutConfig = defineGetLayoutConfig(() => ({
  i18n: {
    activeLocale: i18n.locale,
    availableLocales: APP_LOCALE_IDS,
  },

  brand: {
    name: BRAND_UMBRELLA_NAME,
    tagline: t`Open-source cryptocurrency payment processor`,
    logoIcon: BitcartLogoIcon,
    logoImageSrc: "/logo.svg",
  },

  project: {
    canonicalName: PROJECT_CANONICAL_NAME,
    copyrightSinceYear: 2018,
  },

  navigation: {
    navBarDisplayCapacity: { md: 2, lg: 4, xl: 6, "2xl": 7, "3xl": 8 },

    directory: {
      labeledLinks: [
        {
          groupTitle: t`Navigation`,

          items: [
            { label: t`Features`, href: "/#features", globalPriority: 1 },
            { label: t`Supported Coins`, shortLabel: t`Coins`, href: "/coins", globalPriority: 2 },
            { label: t`Community`, href: "/#community", globalPriority: 5 },
          ],
        },

        {
          groupTitle: t`Resources`,

          items: [
            {
              label: t`Docs`,
              href: "https://docs.bitcart.ai",
              isExternal: true,
              globalPriority: 3,
            },
            {
              label: t`Blog`,
              href: "https://blog.bitcart.ai",
              isExternal: true,
              globalPriority: 4,
            },
            {
              label: t`Easy Launch`,
              href: "https://configurator.bitcart.ai",
              isExternal: true,
              globalPriority: 6,
            },
            {
              label: t`Merchant Directory`,
              href: "https://directory.bitcart.ai",
              isExternal: true,
              globalPriority: 7,
            },
            {
              label: t`Roadmap`,
              href: "https://feature.bitcart.ai",
              isExternal: true,
              globalPriority: 8,
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
              href: "https://github.com/bitcart/bitcart",
              isExternal: true,
            },
          ],
        },

        {
          groupTitle: t`Social links`,
          footerOnly: true,

          items: [
            {
              icon: LinkedinLogoIcon,
              hint: t`Follow us on LinkedIn`,
              href: "https://linkedin.com/company/bitcart",
              isExternal: true,
            },
            {
              icon: InstagramLogoIcon,
              hint: t`Follow us on Instagram`,
              href: "https://instagram.com/bitcartcc",
              isExternal: true,
            },
            {
              icon: RedditLogoIcon,
              hint: t`Join our Reddit community`,
              href: "https://www.reddit.com/r/Bitcart",
              isExternal: true,
            },
          ],
        },
      ],
    },
  },
}))
