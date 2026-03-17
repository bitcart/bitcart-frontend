import { Badge, Button } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { Trans, useLingui } from "@lingui/react/macro"
import { X } from "lucide-react"

import type { CatalogLookup, CatalogLookupResult } from "../types"
import { CatalogEntryCard } from "./card"

export type CatalogOverviewProps = Pick<CatalogLookup, "filters" | "filterControls"> & {
  data: CatalogLookupResult
  className?: string
}

export const CatalogOverview: React.FC<CatalogOverviewProps> = ({
  data: { entries: filteredEntries },
  filters: { category, subcategory },
  filterControls,
  className,
}) => {
  const { t } = useLingui()

  return (
    <div className={cn("gap-6 flex w-full flex-col", className)}>
      {category !== "all" && (
        <div className="gap-2 flex flex-wrap items-center">
          <span className="text-muted-foreground text-sm font-medium pr-3">
            {t`Active filters:`}
          </span>

          <div className="gap-3 flex">
            <Badge variant="default">
              <span className="capitalize">{category}</span>

              <Button
                onClick={filterControls.handleCategoryReset}
                size="icon-sm"
                variant="ghost"
                className="p-1 size-a hover:bg-primary-foreground/20 rounded-full"
              >
                <X />
              </Button>
            </Badge>

            {subcategory && (
              <Badge variant="secondary">
                <span className="capitalize">{subcategory}</span>

                <Button
                  onClick={filterControls.handleSubcategoryReset}
                  size="icon-sm"
                  variant="ghost"
                  className="p-0.25 size-a hover:bg-secondary-foreground/20 rounded-full"
                >
                  <X />
                </Button>
              </Badge>
            )}
          </div>

          <Button variant="link" size="sm" onClick={filterControls.handleFiltersReset}>
            {t`Clear all`}
          </Button>
        </div>
      )}

      {filteredEntries.length === 0 ? (
        <div
          className="
            py-12 h-70
            md:h-110
            gap-2 flex flex-col items-center justify-center text-center
          "
        >
          <p className="text-muted-foreground text-lg">
            {t`No entries found matching your criteria.`}
          </p>

          <p className="text-muted-foreground/70">
            {t`Try adjusting your filters or search query.`}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              <span className="capitalize">{category === "all" ? t`All Entries` : category}</span>

              {subcategory && (
                <span>
                  <span>{` - `}</span>
                  <span className="capitalize">{subcategory}</span>
                </span>
              )}
            </h2>

            <span className="text-muted-foreground">
              <Trans>{filteredEntries.length} entries</Trans>
            </span>
          </div>

          <div className="md:grid-cols-2 lg:grid-cols-3 gap-6 grid grid-cols-1">
            {filteredEntries.map((entry) => (
              <CatalogEntryCard key={entry.id} data={entry} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
