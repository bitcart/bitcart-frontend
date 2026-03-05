import { Button } from "@bitcart/ui-kit/components"
import { useLingui } from "@lingui/react/macro"
import { AlertCircle, Loader } from "lucide-react"
import { withFallback } from "vike-react-query"

import { CoinCatalogOverview, useCoinCatalogLookup } from "@/entities/coin-catalog"

import { AdditionalInfoSection } from "./components/additional-info-section"
import { Hero } from "./components/hero"
import { IntegrationSection } from "./components/integration-section"
import { StatsSection } from "./components/stats-section"

const LoadingFallback = () => {
  const { t } = useLingui()

  return (
    <div className="bg-background pt-16 flex min-h-screen items-center justify-center">
      <div className="px-4 text-center">
        <Loader className="w-12 h-12 text-accent-foreground animate-spin mb-4 mx-auto" />
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">{t`Loading Supported Coins`}</h2>

        <p className="text-muted-foreground text-sm sm:text-base">
          {t`Fetching the latest cryptocurrency and token information...`}
        </p>
      </div>
    </div>
  )
}

const ErrorFallback = ({ retry, error }: { retry: () => void; error: { message: string } }) => {
  const { t } = useLingui()

  return (
    <div className="bg-background pt-16 flex min-h-screen items-center justify-center">
      <div className="max-w-md px-4 text-center">
        <AlertCircle className="w-12 h-12 text-destructive-foreground mb-4 mx-auto" />
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">{t`Error Loading Data`}</h2>
        <p className="text-muted-foreground mb-4 text-sm sm:text-base">{error.message}</p>
        <Button size="lg" onClick={() => retry()}>{t`Try Again`}</Button>
      </div>
    </div>
  )
}

function Page() {
  const coinCatalogLookup = useCoinCatalogLookup()

  return (
    <div className="bg-background pt-16 min-h-screen">
      <Hero
        searchTerm={coinCatalogLookup.searchTerm}
        setSearchTerm={coinCatalogLookup.setSearchTerm}
      />

      <StatsSection />
      <CoinCatalogOverview data={coinCatalogLookup.result} />
      <AdditionalInfoSection />
      <IntegrationSection />
    </div>
  )
}

const PageWithFallback = withFallback(Page, LoadingFallback, ErrorFallback)

export default PageWithFallback
