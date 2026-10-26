import { useLingui } from "@lingui/react/macro"
import { useState } from "react"

import {
  CHECKOUT_METHOD_SELECTOR_TESTID,
  MethodSummary,
  useCheckout,
  useMethodSearch,
} from "#/checkout"

import { Palette } from "./palette"

export const SpotlightSelect = () => {
  const { t } = useLingui()
  const { selectMethod, cancelChange, branding, store } = useCheckout("select")
  const storeName = store.name
  const [query, setQuery] = useState("")
  const results = useMethodSearch(query)

  return (
    <Palette
      query={query}
      onQueryChange={setQuery}
      onEscape={cancelChange}
      searchLabel={t`Search currencies...`}
      listLabel={branding.brand.showsName ? t`Payment methods` : t`Pay ${storeName}`}
      listTestId={CHECKOUT_METHOD_SELECTOR_TESTID}
      emptyMessage={t`No matching currencies`}
      options={results.map((method) => ({
        value: method.id,
        label: method.name,
        onSelect: () => selectMethod(method.id),
        content: <MethodSummary method={method} />,
      }))}
    />
  )
}
