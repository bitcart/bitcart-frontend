import { FeatureGallery, type FeatureGalleryItem } from "@bitcart/ui-kit/components"
import { Bitcoin, Bolt, Shield, Zap } from "lucide-react"

const FEATURES: FeatureGalleryItem[] = [
  {
    title:
      "Receive or perform cryptocurrency and token payments as a business or an individual. No fees. No third-party.",

    icon: <Bitcoin className="size-12 text-accent-foreground" />,

    description:
      "Bitcart is using electrum wallet you know and love. Your private key never leaves your PC.",

    actions: [
      { label: "Try Out The Live Demo", href: "https://admin.bitcart.ai", isExternalLink: true },
    ],
  },

  {
    title: "Fast, easy to use and secure",
    icon: <Zap className="size-12 text-accent-foreground" />,

    description:
      "Bitcart is written to be fast and light, working on any kind of servers, or at your home PC",
  },

  {
    title: "Free and fully-open source software. Self-hosted and non-custodial.",
    icon: <Shield className="size-12 text-accent-foreground" />,

    description:
      "You're free to improve and view source code of Bitcart. Your are your own bank, as you host Bitcart yourself.",

    actions: [
      { label: "GitHub", href: "https://github.com/bitcart/bitcart", isExternalLink: true },
    ],
  },

  {
    title: "Lightning network supported out of the box",
    icon: <Bolt className="size-12 text-accent-foreground" />,
    description: "Enable lightning network just by one command!",

    actions: [
      {
        label: "What is Lightning Network?",
        href: "https://lightning.network/",
        isExternalLink: true,
      },

      {
        label: "Lightning Network Guide",
        href: "https://docs.bitcart.ai/guides/lightning",
        isExternalLink: true,
      },
    ],
  },
]

export const DefaultFeatureGalleryExample: React.FC = () => {
  return <FeatureGallery items={FEATURES} />
}
