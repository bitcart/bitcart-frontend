import { BitcartLogoIcon } from "@bitcart/ui-kit/icons"
import { defineGetLayoutConfig } from "@bitcart/ui-kit/utils"
import type { I18n } from "@lingui/core"
import { msg } from "@lingui/core/macro"
import { GithubLogoIcon } from "@phosphor-icons/react/dist/csr/GithubLogo"
import { InstagramLogoIcon } from "@phosphor-icons/react/dist/csr/InstagramLogo"
import { LinkedinLogoIcon } from "@phosphor-icons/react/dist/csr/LinkedinLogo"
import { RedditLogoIcon } from "@phosphor-icons/react/dist/csr/RedditLogo"

import { APP_LOCALE_IDS } from "@/app.config"
import { BRAND_UMBRELLA_NAME, PROJECT_CANONICAL_NAME } from "@/common/constants"

export const getLayoutConfig = defineGetLayoutConfig((i18n: I18n) => ({
  i18n: {
    activeLocale: i18n.locale,
    availableLocales: APP_LOCALE_IDS,
  },

  brand: {
    name: BRAND_UMBRELLA_NAME,
    tagline: i18n.t(msg`Open-source cryptocurrency payment processor`),
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
          groupTitle: i18n.t(msg`Navigation`),

          items: [
            { label: i18n.t(msg`Features`), href: "/#features", globalPriority: 1 },
            {
              label: i18n.t(msg`Supported Coins`),
              shortLabel: i18n.t(msg`Coins`),
              href: "/coins",
              globalPriority: 2,
            },
            { label: i18n.t(msg`Community`), href: "/#community", globalPriority: 5 },
          ],
        },

        {
          groupTitle: i18n.t(msg`Resources`),

          items: [
            {
              label: i18n.t(msg`Docs`),
              href: "https://docs.bitcart.ai",
              isExternal: true,
              globalPriority: 3,
            },
            {
              label: i18n.t(msg`Blog`),
              href: "https://blog.bitcart.ai",
              isExternal: true,
              globalPriority: 4,
            },
            {
              label: i18n.t(msg`Easy Launch`),
              href: "https://configurator.bitcart.ai",
              isExternal: true,
              globalPriority: 6,
            },
            {
              label: i18n.t(msg`Merchant Directory`),
              href: "https://directory.bitcart.ai",
              isExternal: true,
              globalPriority: 7,
            },
            {
              label: i18n.t(msg`Roadmap`),
              href: "https://feature.bitcart.ai",
              isExternal: true,
              globalPriority: 8,
            },
          ],
        },
      ],

      iconLinks: [
        {
          groupTitle: i18n.t(msg`Project links`),

          items: [
            {
              icon: GithubLogoIcon,
              hint: i18n.t(msg`Visit our GitHub repository`),
              href: "https://github.com/bitcart/bitcart",
              isExternal: true,
            },
          ],
        },

        {
          groupTitle: i18n.t(msg`Social links`),
          footerOnly: true,

          items: [
            {
              icon: LinkedinLogoIcon,
              hint: i18n.t(msg`Follow us on LinkedIn`),
              href: "https://linkedin.com/company/bitcart",
              isExternal: true,
            },
            {
              icon: InstagramLogoIcon,
              hint: i18n.t(msg`Follow us on Instagram`),
              href: "https://instagram.com/bitcartcc",
              isExternal: true,
            },
            {
              icon: RedditLogoIcon,
              hint: i18n.t(msg`Join our Reddit community`),
              href: "https://www.reddit.com/r/Bitcart",
              isExternal: true,
            },
          ],
        },
      ],
    },
  },
}))
