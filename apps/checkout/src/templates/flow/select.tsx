import { ScrollArea, SearchField } from "@bitcart/ui-kit/components"
import { useLingui } from "@lingui/react/macro"
import { useState } from "react"

import {
  CHECKOUT_METHOD_SELECTOR_TESTID,
  MethodSummary,
  useCheckout,
  useMethodSearch,
} from "#/checkout"

import { FlowCard } from "./card"

const SEARCHABLE_FROM = 7

export const FlowSelect = () => {
  const { t } = useLingui()
  const { methods, selectMethod } = useCheckout("select")
  const [query, setQuery] = useState("")
  const results = useMethodSearch(query)

  return (
    <FlowCard>
      <div className="px-5 py-5">
        <p className="mb-3 text-sm font-semibold">{t`Choose how to pay`}</p>

        <div className="space-y-2" data-testid={CHECKOUT_METHOD_SELECTOR_TESTID}>
          {methods.length >= SEARCHABLE_FROM && (
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder={t`Search coin or network`}
            />
          )}

          <ScrollArea scrollFade scrollbarGutter className="max-h-80">
            <div className="space-y-1">
              {results.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => selectMethod(method.id)}
                  className="gap-3 rounded-xl px-3 py-2 hover:bg-muted flex w-full cursor-pointer items-center text-left"
                >
                  <MethodSummary method={method} />
                </button>
              ))}

              {results.length === 0 && (
                <p className="py-6 text-sm text-muted-foreground text-center">
                  {t`No matching method`}
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </FlowCard>
  )
}
