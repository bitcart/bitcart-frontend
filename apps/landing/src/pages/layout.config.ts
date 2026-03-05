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
  title: t`Bitcart - Non-Custodial Crypto Payments Processor`,
  description: t`Your self-hosted, open-source cryptocurrency all-in-one solution. Accept crypto and stablecoins payments and develop custom apps with ease`,

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
    tagline: t`Open-source cryptocurrency payment processor`,
  },

  navigation: {
    navBarDisplayCapacity: { md: 2, lg: 4, xl: 6, "2xl": 7, "3xl": 8 },

    directory: {
      labeledLinks: [
        {
          groupTitle: t`Navigation`,

          items: [
            { label: t`Features`, href: "/#features", globalPosition: 1 },
            { label: t`Supported Coins`, shortLabel: t`Coins`, href: "/coins", globalPosition: 2 },
            { label: t`Community`, href: "/#community", globalPosition: 5 },
          ],
        },

        {
          groupTitle: t`Resources`,

          items: [
            { label: t`Docs`, href: "https://docs.bitcart.ai", globalPosition: 3 },
            { label: t`Blog`, href: "https://blog.bitcart.ai", globalPosition: 4 },
            { label: t`Easy Launch`, href: "https://configurator.bitcart.ai", globalPosition: 6 },
            {
              label: t`Merchant Directory`,
              href: "https://directory.bitcart.ai",
              globalPosition: 7,
            },
            { label: t`Roadmap`, href: "https://feature.bitcart.ai", globalPosition: 8 },
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
            },

            {
              icon: InstagramLogoIcon,
              hint: t`Follow us on Instagram`,
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
