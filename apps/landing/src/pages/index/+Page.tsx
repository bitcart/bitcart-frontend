import { FeatureGallery, type FeatureGalleryItem } from "@bitcart/ui-kit/components"
import { useLingui } from "@lingui/react/macro"
import { Bitcoin, Bolt, Code, Coins, Key, Puzzle, Server, Shield, Store, Zap } from "lucide-react"
import { useEffect } from "react"

import { AboutSection } from "./components/about-section"
import { CommunitySection } from "./components/community-section"
import { Hero } from "./components/hero"

export default function Page() {
  const { t } = useLingui()

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://admin.bitcart.ai/modal/bitcart.js"
    script.async = true
    document.head.appendChild(script)

    return () => {
      const existingScript = document.querySelector(
        'script[src="https://admin.bitcart.ai/modal/bitcart.js"]',
      )

      if (existingScript) {
        document.head.removeChild(existingScript)
      }
    }
  }, [])

  const features: FeatureGalleryItem[] = [
    {
      title: t`Receive or perform cryptocurrency and token payments as a business or an individual. No fees. No third-party.`,

      icon: <Bitcoin className="size-12 text-accent-foreground" />,

      description: t`Bitcart is using electrum wallet you know and love. Your private key never leaves your PC.`,

      actions: [
        { label: t`Try Out The Live Demo`, href: "https://admin.bitcart.ai", isExternalLink: true },
      ],
    },

    {
      title: t`Fast, easy to use and secure`,
      icon: <Zap className="size-12 text-accent-foreground" />,

      description: t`Bitcart is written to be fast and light, working on any kind of servers, or at your home PC`,
    },

    {
      title: t`Your private keys are never required to use Bitcart`,
      icon: <Key className="size-12 text-accent-foreground" />,

      description: t`Your keys - your bitcoin! You can use your public key, or just a set of addresses to watch for`,
    },

    {
      title: t`Ready to use admin panel and store for your business`,
      icon: <Store className="size-12 text-accent-foreground" />,

      description: t`Bitcart provides optional, but easy to install and use admin panel for full management of your products and checkout and ready store. Just fill in your products in admin panel and start getting your first customers!`,

      actions: [
        { label: t`Bitcart Admin Demo`, href: "https://admin.bitcart.ai", isExternalLink: true },
        { label: t`Bitcart Store Demo`, href: "https://store.bitcart.ai", isExternalLink: true },
        { label: t`Merchant API Demo`, href: "https://api.bitcart.ai", isExternalLink: true },
      ],
    },

    {
      title: t`Free and fully-open source software. Self-hosted and non-custodial.`,
      icon: <Shield className="size-12 text-accent-foreground" />,

      description: t`You're free to improve and view source code of Bitcart. Your are your own bank, as you host Bitcart yourself.`,

      actions: [
        { label: `GitHub`, href: "https://github.com/bitcart/bitcart", isExternalLink: true },
      ],
    },

    {
      title: t`Lightning network supported out of the box`,
      icon: <Bolt className="size-12 text-accent-foreground" />,
      description: t`Enable lightning network just by one command!`,

      actions: [
        {
          label: t`What is Lightning Network?`,
          href: "https://lightning.network/",
          isExternalLink: true,
        },
        {
          label: t`Lightning Network Guide`,
          href: "https://docs.bitcart.ai/guides/lightning",
          isExternalLink: true,
        },
      ],
    },

    {
      title: t`Easy to deploy on any kind of server, via GUI or a few CLI commands`,
      icon: <Server className="size-12 text-accent-foreground" />,

      description: t`It is possible to install Bitcart right from your phone, without any technical skills! Or just use easy to configure and use docker installation!`,

      actions: [
        {
          label: t`Bitcart Configurator`,
          href: "https://configurator.bitcart.ai",
          isExternalLink: true,
        },
        {
          label: t`Deployment Guides`,
          href: "https://docs.bitcart.ai/deployment/deployment",
          isExternalLink: true,
        },
      ],
    },

    {
      title: t`Supporting multiple coins, APIs remain the same`,
      icon: <Coins className="size-12 text-accent-foreground" />,

      description: t`A variety of different coins is available, and you can use any of them in the same way. Enabling new coin in docker installation is a matter of one command.`,

      actions: [{ label: t`Supported Coins List`, href: "/coins" }],
    },

    {
      title: t`Powerful SDK libraries to create apps of any kind`,
      icon: <Code className="size-12 text-accent-foreground" />,

      description: t`Powerful python SDK is available. Or just connect to Bitcart daemon from any programming language You can even create a blockchain explorer, atomic swaps bot, or a wallet with it!`,

      actions: [
        { label: t`Python SDK`, href: "https://sdk.bitcart.ai", isExternalLink: true },

        {
          label: t`Atomic Tipbot`,
          href: "https://github.com/bitcart/bitcart-sdk/tree/master/examples/atomic_tipbot",
          isExternalLink: true,
        },
        {
          label: t`Examples of Usage`,
          href: "https://github.com/bitcart/bitcart-sdk/tree/master/examples",
          isExternalLink: true,
        },
      ],
    },

    {
      title: t`Modular and extensible`,
      icon: <Puzzle className="size-12 text-accent-foreground" />,
      description: t`Bitcart is composed of different independent components, you can pick only the ones you need`,

      actions: [
        {
          label: t`Bitcart Components Diagram`,
          href: "https://raw.githubusercontent.com/bitcart/bitcart-docs/master/.gitbook/assets/bitcart_structure.png",
          isExternalLink: true,
        },
        {
          label: t`Architecture`,
          href: "https://docs.bitcart.ai/development/architecture",
          isExternalLink: true,
        },
      ],
    },
  ]

  return (
    <>
      <Hero />

      <div className="max-lg:pb-20 bg-background">
        <div className="max-w-7xl px-4 md:px-6 lg:px-8 mx-auto">
          <div className="lg:grid-cols-2 lg:gap-16 grid grid-cols-1 items-center">
            <AboutSection className="max-lg:pt-20 lg:py-20" />
            <CommunitySection className="max-lg:pt-20 lg:py-20 lg:h-full lg:justify-center" />
          </div>
        </div>
      </div>

      <section id="features" aria-labelledby="features-heading" className="py-20 bg-secondary">
        <div className="max-w-7xl px-4 md:px-6 lg:px-8 mx-auto">
          <h2 id="features-heading" className="text-4xl font-bold mb-16 text-center">
            {t`Features`}
          </h2>

          <FeatureGallery items={features} />
        </div>
      </section>
    </>
  )
}
