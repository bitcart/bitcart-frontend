import { Button } from "@bitcart/ui-kit/components"
import { Link } from "@bitcart/vike-kit/navigation"
import { useLingui } from "@lingui/react/macro"
import { ExternalLink } from "lucide-react"

export const IntegrationSection: React.FC = () => {
  const { t } = useLingui()

  return (
    <section className="py-12 sm:py-20 from-primary to-primary/80 bg-linear-to-r">
      <div className="max-w-4xl px-4 md:px-6 lg:px-8 mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
          {t`Ready to Accept These Cryptocurrencies?`}
        </h2>

        <p className="text-base sm:text-xl text-purple-100 mb-6 sm:mb-8 leading-relaxed">
          {t`Start accepting payments in any of these supported cryptocurrencies with zero fees and complete control over your funds.`}
        </p>

        <div className="sm:flex-row gap-4 flex flex-col justify-center">
          <Button asChild expandOnHover size="xl" variant="white" className="group elevation-3">
            <Link href="https://admin.bitcart.ai">
              <span>{t`Try Live Demo`}</span>

              <ExternalLink
                className={`w-4 md:w-5 h-4 md:h-5 group-hover:translate-x-1 transition-transform`}
              />
            </Link>
          </Button>

          <Button asChild expandOnHover size="xl" className="group bg-purple-700">
            <Link href="https://docs.bitcart.ai">
              <span>{t`View Documentation`}</span>

              <ExternalLink
                className={`w-4 md:w-5 h-4 md:h-5 group-hover:translate-x-1 transition-transform`}
              />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
