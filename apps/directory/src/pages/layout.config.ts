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
    logoIcon: BitcartLogoIcon,
    logoImageSrc: "/logo.svg",
  },

  project: {
    canonicalName: PROJECT_CANONICAL_NAME,
    copyrightSinceYear: 2018,

    description: i18n.t(
      msg`Discover businesses that accept cryptocurrency payments through Bitcart. Find merchants, restaurants, and services that support crypto transactions.`,
    ),
  },

  navigation: {
    navBarDisplayCapacity: { md: 2, lg: 4, xl: 6, "2xl": 7, "3xl": 8 },

    directory: {
      labeledLinks: [
        {
          groupTitle: i18n.t(msg`Navigation`),

          items: [
            { label: i18n.t(msg`Directory`), href: "/" },
            { label: i18n.t(msg`Submit Entry`), href: "/submit" },

            {
              label: `${i18n.t(msg`About`)} ${BRAND_UMBRELLA_NAME}`,
              href: "https://bitcart.ai",
              isExternal: true,
            },
          ],
        },

        {
          groupTitle: i18n.t(msg`Resources`),
          footerOnly: true,

          items: [
            {
              label: `${i18n.t(msg`About`)} ${BRAND_UMBRELLA_NAME}`,
              href: "https://bitcart.ai",
              isExternal: true,
            },

            {
              label: i18n.t(msg`Documentation`),
              href: "https://docs.bitcart.ai",
              isExternal: true,
            },
          ],
        },
      ],

      iconLinks: [
        {
          groupTitle: i18n.t(msg`Project links`),
          menuOnly: true,

          items: [
            {
              icon: GithubLogoIcon,
              hint: i18n.t(msg`Visit our GitHub repository`),
              href: "https://github.com/bitcart/bitcart-directory",
              isExternal: true,
            },
          ],
        },

        {
          groupTitle: i18n.t(msg`Social links`),
          footerOnly: true,

          items: [
            {
              icon: GithubLogoIcon,
              hint: "GitHub",
              href: "https://github.com/bitcart/bitcart",
              isExternal: true,
            },
            {
              icon: LinkedinLogoIcon,
              hint: "LinkedIn",
              href: "https://linkedin.com/company/bitcart",
              isExternal: true,
            },
            {
              icon: InstagramLogoIcon,
              hint: "Instagram",
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
