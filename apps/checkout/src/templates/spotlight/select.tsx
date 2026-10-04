import { cn } from "@bitcart/ui-kit/utils"
import { t } from "@lingui/core/macro"
import { useState } from "react"

import { CHECKOUT_METHOD_SELECTOR_TESTID, useCheckout, useMethodSearch } from "#/checkout"

import { Palette } from "./palette"

export const SpotlightSelect = () => {
  const { selectMethod, cancelChange } = useCheckout("select")
  const [query, setQuery] = useState("")
  const results = useMethodSearch(query)

  return (
    <Palette
      query={query}
      onQueryChange={setQuery}
      onEscape={cancelChange}
      placeholder={t`Search currencies...`}
      listLabel={t`Payment methods`}
      listTestId={CHECKOUT_METHOD_SELECTOR_TESTID}
      emptyMessage={t`No matching currencies`}
      options={results.map((method) => ({
        value: method.id,
        label: method.name,
        onSelect: () => selectMethod(method.id),

        content: (
          <>
            <div
              className={cn(`
                size-8 text-xs font-bold rounded-lg bg-muted text-muted-foreground flex shrink-0
                items-center justify-center uppercase
              `)}
            >
              {method.symbol.slice(0, 2)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">{method.name}</div>

              <div className="text-muted-foreground font-mono truncate text-[11px]">
                {method.amount} · {method.rateStr}
              </div>
            </div>
          </>
        ),
      }))}
    />
  )
}
