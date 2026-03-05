import { useEffect, useState } from "react"

import type { LayoutConfig } from "@/types"

export const useLayoutConfigMemo = (nonMemoizedValue: LayoutConfig) => {
  const [memoizedValue, setMemoizedValue] = useState(nonMemoizedValue)

  useEffect(() => {
    if (
      //! Make sure to preserve this condition as it prevents rerender loops
      memoizedValue.i18n.activeLocale !== nonMemoizedValue.i18n.activeLocale
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMemoizedValue(nonMemoizedValue)
    }
  }, [memoizedValue.i18n.activeLocale, nonMemoizedValue])

  return memoizedValue
}
