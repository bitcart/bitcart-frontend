import type { LayoutConfig } from "@bitcart/ui-kit/types"
import { type StaticLayoutMetadata } from "@bitcart/vike-kit/metadata"
import { i18n } from "@lingui/core"
import { t } from "@lingui/core/macro"
import { GithubLogoIcon } from "@phosphor-icons/react/dist/csr/GithubLogo"
import { InstagramLogoIcon } from "@phosphor-icons/react/dist/csr/InstagramLogo"
import { LinkedinLogoIcon } from "@phosphor-icons/react/dist/csr/LinkedinLogo"
import { RedditLogoIcon } from "@phosphor-icons/react/dist/csr/RedditLogo"

import { SUPPORTED_LOCALE_IDS } from "@/app.config"
import { BRAND_UMBRELLA_NAME, PROJECT_CANONICAL_NAME } from "@/common/constants"

export const getLayoutMetadata = (): StaticLayoutMetadata => ({
  title: t`Bitcart Directory - Apps, Hosts & Merchants Using Bitcart`,
  description: t`Directory of apps, hosting providers, and merchants using Bitcart for cryptocurrency payments`,

  image: {
    src: "/logo.png",
    alt: "Bitcart logo",
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
    logoImageSrc: "/icon.svg",
    projectCanonicalName: PROJECT_CANONICAL_NAME,
    tagline: t`Discover businesses that accept cryptocurrency payments through Bitcart. Find merchants, restaurants, and services that support crypto transactions.`,
  },

  navigation: {
    navBarDisplayCapacity: { md: 2, lg: 4, xl: 6, "2xl": 7, "3xl": 8 },

    directory: {
      labeledLinks: [
        {
          groupTitle: t`Navigation`,

          items: [
            { label: t`Directory`, href: "/" },
            { label: t`Submit Entry`, href: "/submit" },
            { label: `${t`About`} ${BRAND_UMBRELLA_NAME}`, href: "https://bitcart.ai" },
          ],
        },

        {
          groupTitle: t`Resources`,
          footerOnly: true,

          items: [
            { label: `${t`About`} ${BRAND_UMBRELLA_NAME}`, href: "https://bitcart.ai" },
            { label: t`Documentation`, href: "https://docs.bitcart.ai" },
          ],
        },
      ],

      iconLinks: [
        {
          groupTitle: t`Project links`,
          menuOnly: true,

          items: [
            {
              icon: GithubLogoIcon,
              hint: t`Visit our GitHub repository`,
              href: "https://github.com/bitcart/bitcart-directory",
            },
          ],
        },

        {
          groupTitle: t`Social links`,
          footerOnly: true,

          items: [
            {
              icon: GithubLogoIcon,
              hint: "GitHub",
              href: "https://github.com/bitcart/bitcart",
            },

            {
              icon: LinkedinLogoIcon,
              hint: "LinkedIn",
              href: "https://linkedin.com/company/bitcart",
            },

            {
              icon: InstagramLogoIcon,
              hint: "Instagram",
              href: "https://instagram.com/bitcartcc",
            },

            {
              icon: RedditLogoIcon,
              hint: t`Join our Reddit community`,
              href: "https://www.reddit.com/r/Bitcart",
            },
          ],
        },
      ],
    },
  },
})
