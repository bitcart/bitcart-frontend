import { cn } from "@bitcart/ui-kit/utils"
import { Store, ShoppingBag, Wrench, Coffee, Download, MoreHorizontal } from "lucide-react"
import { useMemo } from "react"

export type CatalogEntrySubcategoryIconProps = {
  subcategoryId: string
  className?: string
}

export const CatalogEntrySubcategoryIcon: React.FC<CatalogEntrySubcategoryIconProps> = ({
  subcategoryId,
  className,
}) => {
  const elementClassName = useMemo(() => cn("size-4", className), [className])

  switch (subcategoryId) {
    case "retail":
      return <ShoppingBag className={elementClassName} />
    case "services":
      return <Wrench className={elementClassName} />
    case "food":
      return <Coffee className={elementClassName} />
    case "digital":
      return <Download className={elementClassName} />
    case "other":
      return <MoreHorizontal className={elementClassName} />
    default:
      return <Store className={elementClassName} />
  }
}
