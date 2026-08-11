import { createContext, useContext } from "react"
import { isNullish } from "remeda"

import type { Brand } from "@/common/constants"

export type BrandContextValue = {
  brand: Brand
  setBrand: (brand: Brand) => void
}

export const BrandContext = createContext<BrandContextValue | undefined>(undefined)

export const useBrand = (): BrandContextValue => {
  const value = useContext(BrandContext)

  if (isNullish(value)) {
    throw new Error("`useBrand` must be used within a `BrandProvider`")
  } else return value
}
