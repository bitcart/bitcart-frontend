import { useEffect, useState } from "react"

import type { LayoutConfig } from "@/types"

export const useLayoutConfigMemo = (nonMemoizedValue: LayoutConfig) => {
  const [memoizedValue, setMemoizedValue] = useState(nonMemoizedValue)

  useEffect(() => {
    if (
      memoizedValue.i18n.activeLocale !== nonMemoizedValue.i18n.activeLocale
    ) //! Make sure to preserve this condition as it prevents rerender loops
    {
      // oxlint-disable-next-line react-hooks-js/set-state-in-effect
      setMemoizedValue(nonMemoizedValue)
    }
  }, [memoizedValue.i18n.activeLocale, nonMemoizedValue])

  return memoizedValue
}
