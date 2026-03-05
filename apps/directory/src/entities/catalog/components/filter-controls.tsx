import { cn } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react/macro"
import { useCallback } from "react"

import { directoryClient, directoryHooks } from "@/common/data/bitcart/directory"

import type { CatalogEntryCategoryFilterState, CatalogLookup } from "../types"
import { CatalogEntryCategoryIcon } from "./category-icon"
import { CatalogFilterOption } from "./filter-option"
import { CatalogEntrySubcategoryIcon } from "./subcategory-icon"

export type CatalogFilterControlsProps = {
  filterState: CatalogLookup["filters"]
  handlers: CatalogLookup["filterControls"]
  className?: string
}

export const CatalogFilterControls = ({
  filterState,
  handlers: { handleCategorySelect, handleSubcategorySelect, handleSubcategoryReset },
  className,
}: CatalogFilterControlsProps) => {
  const { t } = useLingui()
  const { data: catalog } = directoryHooks.useCatalog()
  const directoryCategories = directoryClient.getCategories()

  const getCategorySize = useCallback(
    (category: CatalogEntryCategoryFilterState) =>
      catalog.entries.filter((entry) => entry.category === category).length,

    [catalog],
  )

  const getSubcategorySize = useCallback(
    (subcategoryId: string) =>
      catalog.entries.filter(
        ({ category, subcategory }) => category === "merchant" && subcategory === subcategoryId,
      ).length,

    [catalog],
  )

  const handleCategoryClick = useCallback(
    (category: CatalogEntryCategoryFilterState) => {
      handleCategorySelect(category)
      handleSubcategorySelect(undefined)
    },

    [handleCategorySelect, handleSubcategorySelect],
  )

  return (
    <div className={cn("gap-6 flex flex-col", className)}>
      <div className="gap-4 flex flex-col">
        <h3 className="text-muted-foreground text-sm font-medium tracking-wide px-3 uppercase">
          {t`Categories`}
        </h3>

        <div className="gap-2 flex flex-col">
          <CatalogFilterOption
            isActive={filterState.category === "all"}
            icon={<CatalogEntryCategoryIcon category="all" />}
            label={t`All`}
            badgeLabel={catalog.entries.length}
            onClick={() => handleCategoryClick("all")}
          />

          {directoryCategories.map((category) => (
            <CatalogFilterOption
              key={category.id}
              isActive={filterState.category === category.id}
              icon={
                <CatalogEntryCategoryIcon
                  category={category.id as CatalogEntryCategoryFilterState}
                />
              }
              label={category.name}
              badgeLabel={getCategorySize(category.id as CatalogEntryCategoryFilterState)}
              onClick={() => handleCategoryClick(category.id as CatalogEntryCategoryFilterState)}
            />
          ))}
        </div>
      </div>

      {/* Subcategories for merchants */}
      {filterState.category === "merchant" && (
        <div className="gap-4 flex flex-col">
          <h3 className="text-muted-foreground text-sm font-medium tracking-wide px-3 uppercase">
            {t`Merchant Types`}
          </h3>

          <div className="gap-2 flex flex-col">
            <CatalogFilterOption
              isActive={filterState.subcategory === undefined}
              icon={<CatalogEntrySubcategoryIcon subcategoryId="all" />}
              label={t`All Merchants`}
              badgeLabel={getCategorySize("merchant")}
              onClick={handleSubcategoryReset}
            />

            {directoryCategories
              .find((cat) => cat.id === "merchant")
              ?.subcategories?.map((subcategory) => (
                <CatalogFilterOption
                  key={subcategory.id}
                  isActive={filterState.subcategory === subcategory.id}
                  icon={<CatalogEntrySubcategoryIcon subcategoryId={subcategory.id} />}
                  label={subcategory.name}
                  badgeLabel={getSubcategorySize(subcategory.id)}
                  onClick={() => handleSubcategorySelect(subcategory.id)}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
