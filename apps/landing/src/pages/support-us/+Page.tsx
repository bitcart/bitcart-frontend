import { useLingui } from "@lingui/react/macro"
import { Building, Globe, Heart, Users } from "lucide-react"

import supporters from "@/common/data/bitcart/raw/supporters.json"

import { BenefitsSection } from "./components/benefits-section"
import { CtaSection } from "./components/cta-section"
import { Hero } from "./components/hero"
import { SupportersSection } from "./components/supporters-section"
import { WaysToSupportSection } from "./components/ways-to-support-section"

export default function Page() {
  const { t } = useLingui()

  const supportBenefits = [
    {
      icon: <Building className="size-8 text-accent-foreground" />,
      title: t`Brand Recognition`,
      description: t`Your company logo and information featured on our website and documentation`,
    },

    {
      icon: <Users className="size-8 text-accent-foreground" />,
      title: t`Community Access`,
      description: t`Direct access to our developer community and priority support channels`,
    },

    {
      icon: <Globe className="size-8 text-accent-foreground" />,
      title: t`Technical Partnership`,
      description: t`Collaborate on features and integrations that benefit your business`,
    },

    {
      icon: <Heart className="size-8 text-accent-foreground" />,
      title: t`Open Source Impact`,
      description: t`Support the growth of decentralized payment infrastructure`,
    },
  ]

  const waysToSupport = [
    {
      title: t`Infrastructure Support`,
      description: t`Provide hosting, servers, or cloud resources for Bitcart development and testing`,

      examples: [
        t`Server hosting`,
        t`Cloud infrastructure`,
        t`CDN services`,
        t`Testing environments`,
      ],
    },

    {
      title: t`Development Support`,
      description: t`Contribute developer time, expertise, or funding for specific features`,
      examples: [t`Feature development`, t`Bug fixes`, t`Code reviews`, t`Technical consulting`],
    },

    {
      title: t`Financial Support`,
      description: t`Provide funding for development, maintenance, or community initiatives`,

      examples: [
        t`Development grants`,
        t`Bounty programs`,
        t`Event sponsorship`,
        t`Marketing support`,
      ],
    },

    {
      title: t`Integration Partnership`,
      description: t`Work together to integrate Bitcart with your existing products or services`,

      examples: [
        t`API integrations`,
        t`Plugin development`,
        t`Custom solutions`,
        t`White-label options`,
      ],
    },
  ]

  return (
    <div className="bg-background pt-16 min-h-screen">
      <Hero />
      <SupportersSection data={supporters} />
      <BenefitsSection data={supportBenefits} />
      <WaysToSupportSection data={waysToSupport} />
      <CtaSection />
    </div>
  )
}
