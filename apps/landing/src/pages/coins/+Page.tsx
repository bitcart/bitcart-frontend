import { Button, CtaSection, type CtaSectionProps } from "@bitcart/ui-kit/components"
import { type PageErrorFallbackProps } from "@bitcart/vike-kit/navigation"
import { useLingui } from "@lingui/react/macro"
import { AlertCircle, ExternalLinkIcon, Loader } from "lucide-react"
import { withFallback } from "vike-react-query"

import { CoinCatalogOverview, useCoinCatalogLookup } from "@/entities/coin-catalog"

import { AdditionalInfoSection } from "./components/additional-info-section"
import { Hero } from "./components/hero"
import { StatsSection } from "./components/stats-section"

function Page() {
  const { t } = useLingui()
  const coinCatalogLookup = useCoinCatalogLookup()

  const callToAction: CtaSectionProps = {
    title: t`Ready to Accept These Cryptocurrencies?`,
    description: t`Start accepting payments in any of these supported cryptocurrencies with zero fees and complete control over your funds.`,

    actions: {
      primary: {
        label: t`Try Live Demo`,
        href: "https://admin.bitcart.ai",
        icons: { right: ExternalLinkIcon },
      },

      secondary: {
        label: t`View Documentation`,
        href: "https://docs.bitcart.ai",
        icons: { right: ExternalLinkIcon },
      },
    },
  }

  return (
    <>
      <Hero
        searchTerm={coinCatalogLookup.searchTerm}
        setSearchTerm={coinCatalogLookup.setSearchTerm}
      />

      <StatsSection />
      <CoinCatalogOverview data={coinCatalogLookup.result} />
      <AdditionalInfoSection />
      <CtaSection {...callToAction} />
    </>
  )
}

const LoadingFallback: React.FC = () => {
  const { t } = useLingui()

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="px-4 text-center">
        <Loader className="size-12 text-primary-text animate-spin mb-4 mx-auto" />
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">{t`Loading Supported Coins`}</h2>

        <p className="text-muted-foreground text-sm sm:text-base">
          {t`Fetching the latest cryptocurrency and token information...`}
        </p>
      </div>
    </div>
  )
}

const ErrorFallback: React.FC<PageErrorFallbackProps> = ({ retry, error }) => {
  const { t } = useLingui()

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="max-w-md px-4 text-center">
        <AlertCircle className="size-12 text-destructive-foreground mb-4 mx-auto" />
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">{t`Error Loading Data`}</h2>
        <p className="text-muted-foreground mb-4 text-sm sm:text-base">{error.message}</p>
        <Button size="lg" onClick={retry}>{t`Try Again`}</Button>
      </div>
    </div>
  )
}

const PageWithFallback = withFallback(Page, LoadingFallback, ErrorFallback)

export default PageWithFallback
