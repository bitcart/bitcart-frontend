import { LinkButton, SearchField } from "@bitcart/ui-kit/components"
import { Trans, useLingui } from "@lingui/react/macro"
import { Plus } from "lucide-react"

import { CatalogFilter, CatalogOverview, useCatalogLookup } from "@/entities/catalog"

export default function Page() {
  const { t } = useLingui()
  const catalogLookup = useCatalogLookup()

  return (
    <div
      className={`
        pt-20 gap-8
        lg:gap-10
        max-w-7xl px-4
        md:px-6
        lg:px-8
        pb-10 relative mx-auto flex w-full flex-col
      `}
    >
      {/* Header Section */}
      <div className="pt-6 text-center">
        <h1 className="text-4xl font-bold mb-4">Bitcart Directory</h1>

        <p className="text-muted-foreground text-xl mb-8 max-w-3xl mx-auto">
          <Trans>
            Discover apps, hosting providers, and merchants using Bitcart for cryptocurrency
            payments. Join the growing ecosystem of businesses accepting Bitcoin and other
            cryptocurrencies.
          </Trans>
        </p>

        <div className="md:flex-row gap-4 py-4 flex flex-col items-center justify-center">
          <div className="max-w-lg lg:max-w-md w-full">
            <SearchField
              value={catalogLookup.searchTerm}
              onChange={catalogLookup.setSearchTerm}
              placeholder={t`Search entries...`}
            />
          </div>

          <div className="gap-3 max-md:w-full max-w-lg lg:max-w-md max-md:justify-between flex">
            <CatalogFilter state={catalogLookup.filters} controls={catalogLookup.filterControls} />

            <LinkButton href="/submit" size="lg">
              <Plus className="size-5" aria-hidden="true" />
              <span>{t`Submit New Entry`}</span>
            </LinkButton>
          </div>
        </div>
      </div>

      <CatalogOverview
        data={catalogLookup.result}
        filters={catalogLookup.filters}
        filterControls={catalogLookup.filterControls}
        className="mx-auto"
      />
    </div>
  )
}
