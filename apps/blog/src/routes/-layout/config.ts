import { SOURCE_LOCALE_ID } from "@bitcart/core/i18n"
import { BitcartLogoIcon } from "@bitcart/ui-kit/icons"
import { defineGetLayoutConfig } from "@bitcart/ui-kit/utils"
import type { I18n } from "@lingui/core"
import { msg } from "@lingui/core/macro"
import { GithubLogoIcon } from "@phosphor-icons/react/dist/csr/GithubLogo"
import { InstagramLogoIcon } from "@phosphor-icons/react/dist/csr/InstagramLogo"
import { LinkedinLogoIcon } from "@phosphor-icons/react/dist/csr/LinkedinLogo"
import { RedditLogoIcon } from "@phosphor-icons/react/dist/csr/RedditLogo"

import { BLOG_NAME, BLOG_TAGLINE, BRAND_NAME } from "#/common/constants"
import { CATEGORIES, type CategoryKey } from "#/common/content/taxonomy"
import { getCategoryHref } from "#/common/navigation"

export const getLayoutConfig = defineGetLayoutConfig(
  (i18n: I18n, categories: readonly CategoryKey[]) => ({
    i18n: {
      activeLocale: i18n.locale,
      availableLocales: [SOURCE_LOCALE_ID],
    },

    brand: {
      name: BRAND_NAME,
      tagline: i18n.t(BLOG_TAGLINE),
      logoIcon: BitcartLogoIcon,
      logoImageSrc: "/logo.svg",
    },

    project: {
      canonicalName: BLOG_NAME,
      copyrightSinceYear: 2018,
    },

    navigation: {
      navBarDisplayCapacity: { md: 3, lg: 5, xl: 5, "2xl": 5, "3xl": 5 },

      directory: {
        labeledLinks: [
          {
            groupTitle: i18n.t(msg`Categories`),

            items: categories.map((category, index) => ({
              label: CATEGORIES[category].label,
              href: getCategoryHref(category),
              globalPriority: index + 1,
            })),
          },

          {
            groupTitle: BRAND_NAME,

            items: [
              {
                label: i18n.t(msg`About ${BRAND_NAME}`),
                href: "https://bitcart.ai",
                isExternal: true,
                globalPriority: categories.length + 1,
              },

              {
                label: i18n.t(msg`Docs`),
                href: "https://docs.bitcart.ai",
                isExternal: true,
                globalPriority: categories.length + 2,
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
  }),
)
