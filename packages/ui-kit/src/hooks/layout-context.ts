import { useContext } from "react"
import { isNullish } from "remeda"

import { LayoutContext, type LayoutContextValue } from "@/contexts/layout"

export const useLayoutContext = (): LayoutContextValue => {
  const value = useContext(LayoutContext)

  if (isNullish(value)) {
    throw new Error("`useLayoutContext` must be used within a `LayoutContextProvider`")
  } else return value
}
