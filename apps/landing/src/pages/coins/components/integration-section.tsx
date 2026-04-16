import { LinkButton } from "@bitcart/ui-kit/components"
import { useLingui } from "@lingui/react/macro"
import { ExternalLink } from "lucide-react"

export const IntegrationSection: React.FC = () => {
  const { t } = useLingui()

  return (
    <section
      aria-labelledby="integration-heading"
      className="py-12 sm:py-20 from-primary to-primary/80 bg-linear-to-r"
    >
      <div className="max-w-4xl px-4 md:px-6 lg:px-8 mx-auto text-center">
        <h2
          id="integration-heading"
          className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4 sm:mb-6"
        >
          {t`Ready to Accept These Cryptocurrencies?`}
        </h2>

        <p className="text-base sm:text-xl text-purple-100 mb-6 sm:mb-8 leading-relaxed">
          {t`Start accepting payments in any of these supported cryptocurrencies with zero fees and complete control over your funds.`}
        </p>

        <div className="sm:flex-row gap-4 flex flex-col justify-center">
          <LinkButton
            href="https://admin.bitcart.ai"
            isExternalLink
            expandOnHover
            size="xl"
            variant="white"
            className="group elevation-3"
          >
            <span>{t`Try Live Demo`}</span>
            <ExternalLink className="group-hover:translate-x-1 transition-transform" />
          </LinkButton>

          <LinkButton
            href="https://docs.bitcart.ai"
            isExternalLink
            expandOnHover
            size="xl"
            className="group bg-purple-700"
          >
            <span>{t`View Documentation`}</span>
            <ExternalLink className="group-hover:translate-x-1 transition-transform" />
          </LinkButton>
        </div>
      </div>
    </section>
  )
}
