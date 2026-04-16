import { cn } from "@bitcart/ui-kit/utils"
import { Grid3X3, Smartphone, Server, Store } from "lucide-react"
import { useMemo } from "react"

import type { CatalogEntryCategoryFilterState } from "../types"

export type CatalogEntryCategoryIconProps = {
  category: CatalogEntryCategoryFilterState
  className?: string
}

export const CatalogEntryCategoryIcon: React.FC<CatalogEntryCategoryIconProps> = ({
  category,
  className,
}) => {
  const elementClassName = useMemo(() => cn("size-4", className), [className])

  switch (category) {
    case "all":
      return <Grid3X3 className={elementClassName} aria-hidden="true" />
    case "app":
      return <Smartphone className={elementClassName} aria-hidden="true" />
    case "host":
      return <Server className={elementClassName} aria-hidden="true" />
    case "merchant":
      return <Store className={elementClassName} aria-hidden="true" />
    default:
      return <Grid3X3 className={elementClassName} aria-hidden="true" />
  }
}
