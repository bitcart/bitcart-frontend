import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { Trans, useLingui } from "@lingui/react/macro"
import { ChevronDownIcon, Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { prop } from "remeda"

import { type BlockchainId } from "@/common/data/bitcart"

import type { CoinCatalogLookupResult } from "../types"
import { CoinCatalogEntryIcon } from "./entry-icon"

export type CoinCatalogOverviewProps = {
  data: CoinCatalogLookupResult
}

type AccordionItemId = BlockchainId

export const CoinCatalogOverview: React.FC<CoinCatalogOverviewProps> = ({
  data: { entries: filteredEntries, totalCounts, searchCounts },
}) => {
  const { t } = useLingui()
  const [expandedEntries, setExpandedEntries] = useState<AccordionItemId[]>([])
  const [coinSearchResultCount, setCoinSearchResultCount] = useState(searchCounts.fungibleTokens)

  const searchResultBlockchainIds = useMemo(
    () => filteredEntries.map(prop("blockchain", "id")),
    [filteredEntries],
  )

  useEffect(() => {
    if (searchCounts.fungibleTokens !== coinSearchResultCount) {
      setCoinSearchResultCount(searchCounts.fungibleTokens)

      setExpandedEntries(
        searchCounts.fungibleTokens === totalCounts.fungibleTokens ? [] : searchResultBlockchainIds,
      )
    }
  }, [
    coinSearchResultCount,
    searchCounts.fungibleTokens,
    searchResultBlockchainIds,
    totalCounts.fungibleTokens,
  ])

  return (
    <section className="py-12 bg-secondary sm:py-20">
      <div className="px-4 max-w-7xl lg:px-8 md:px-6 mx-auto">
        <div
          className={cn("sm:py-12 sm:h-77 text-center", {
            hidden: searchCounts.blockchains !== 0,
          })}
          aria-hidden={searchCounts.blockchains !== 0}
        >
          <Search className="text-muted-foreground mb-4 h-12 w-12 mx-auto" />
          <h3 className="text-lg font-semibold mb-2 sm:text-xl">{t`No results found`}</h3>

          <p className="text-sm text-muted-foreground sm:text-base">
            {t`Try adjusting your search terms`}
          </p>
        </div>

        <Accordion
          dir="ltr"
          type="multiple"
          value={expandedEntries}
          onValueChange={setExpandedEntries}
          className={cn("gap-4 sm:gap-6 lg:columns-2 space-y-4 sm:space-y-6 columns-1", {
            hidden: searchCounts.blockchains === 0,
          })}
          aria-hidden={searchCounts.blockchains === 0}
        >
          {filteredEntries.map(({ blockchain, fungibleTokens }) => {
            const isSearchResult = fungibleTokens.entries.length < fungibleTokens.totalCount

            return (
              <AccordionItem
                key={blockchain.id}
                value={blockchain.id}
                className={`
                  rounded-lg bg-background shadow-lg break-inside-avoid overflow-hidden border
                  last:border-b
                `}
              >
                <AccordionTrigger
                  chevronElement={
                    <span
                      className={cn(`flex h-full flex-col items-center justify-center`, {
                        hidden: fungibleTokens.entries.length === 0,
                      })}
                    >
                      <span className="p-1 sm:p-2">
                        <ChevronDownIcon
                          className={`
                            chevron text-muted-foreground size-4
                            sm:size-5
                            pointer-events-none shrink-0 transition-transform duration-200
                          `}
                        />
                      </span>
                    </span>
                  }
                  className={cn("p-4 sm:p-6", {
                    "hover:bg-secondary/50 cursor-pointer": fungibleTokens.entries.length > 0,
                  })}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="min-w-0 space-x-3 sm:space-x-4 flex flex-1 items-center">
                      <div
                        className={`
                          bg-secondary h-12 w-12
                          sm:h-14 sm:w-14
                          flex shrink-0 items-center justify-center rounded-full
                        `}
                      >
                        <CoinCatalogEntryIcon size={32} symbol={blockchain.intrinsicTokenSymbol} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold sm:text-xl truncate">
                          {blockchain.metadata.displayName}
                        </h3>

                        <p className="text-sm text-muted-foreground sm:text-base">
                          {blockchain.intrinsicTokenSymbol}
                        </p>
                      </div>
                    </div>

                    <div className="space-x-2 sm:space-x-4 flex shrink-0 items-center">
                      {fungibleTokens.entries.length > 0 && (
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground sm:text-sm">{t`Tokens`}</div>

                          <div className="text-sm text-accent-foreground font-semibold sm:text-lg">
                            {fungibleTokens.entries.length}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>

                {fungibleTokens.entries.length > 0 && (
                  <AccordionContent className="p-4 sm:p-6 border-t">
                    <h4 className="text-base font-semibold mb-2 sm:text-lg">
                      {isSearchResult
                        ? t`Matching Tokens on ${blockchain.metadata.displayName} (${
                            fungibleTokens.entries.length
                          }/${fungibleTokens.totalCount})`
                        : t`Example Tokens on ${blockchain.metadata.displayName}`}
                    </h4>

                    <p className="text-xs text-muted-foreground mb-3 sm:text-sm sm:mb-4">
                      <Trans>
                        These are just examples. Any ERC-20/BEP-20/TRC-20/CashToken compatible token
                        can be used by entering its contract address.
                      </Trans>
                    </p>

                    <div className="gap-3 md:grid-cols-5 sm:grid-cols-4 grid grid-cols-3">
                      {fungibleTokens.entries.map((tokenSymbol) => {
                        return (
                          <div
                            key={tokenSymbol}
                            className={cn(
                              `
                                rounded-md p-2 group gap-1.5 flex flex-col items-center text-center
                                transition-colors
                              `,

                              {
                                [`
                                  border-accent-foreground/20
                                  hover:border-accent-foreground/80
                                  bg-primary/10 border-2
                                `]: isSearchResult,

                                "bg-secondary hover:bg-accent": !isSearchResult,
                              },
                            )}
                          >
                            <div className="h-8 w-8 flex items-center justify-center">
                              <CoinCatalogEntryIcon symbol={tokenSymbol} size={24} />
                            </div>

                            <span
                              className={cn(
                                "text-xs font-medium leading-tight break-all",

                                {
                                  [`
                                    font-semibold text-accent-foreground
                                    group-hover:text-foreground
                                  `]: isSearchResult,

                                  "group-hover:text-accent-foreground text-muted-foreground":
                                    !isSearchResult,
                                },
                              )}
                            >
                              {tokenSymbol}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </AccordionContent>
                )}
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    </section>
  )
}
