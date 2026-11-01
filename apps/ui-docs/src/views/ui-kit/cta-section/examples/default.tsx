import { CtaSection } from "@bitcart/ui-kit/components"
import { ExternalLinkIcon } from "lucide-react"

export const DefaultCtaSectionExample: React.FC = () => {
  return (
    <CtaSection
      title="Ready to Accept These Cryptocurrencies?"
      anchorId="cta-section-example-title"
      description="Start accepting payments in any of these supported cryptocurrencies with zero fees and complete control over your funds."
      actions={{
        primary: {
          label: "Try Live Demo",
          href: "https://admin.bitcart.ai",
          icons: { right: ExternalLinkIcon },
        },

        secondary: {
          label: "View Documentation",
          href: "https://docs.bitcart.ai",
          icons: { right: ExternalLinkIcon },
        },
      }}
      footnote="The live demo runs on testnet and needs no account."
    />
  )
}
