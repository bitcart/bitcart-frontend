import { Badge } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { cva, type VariantProps } from "class-variance-authority"

import type { CatalogEntryBadgeVariant } from "../types"

const catalogEntryVariants: Record<CatalogEntryBadgeVariant, string> = {
  app: "bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400",
  host: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  merchant: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  sponsor: "bg-accent text-accent-foreground",
  official: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
}

const catalogEntryBadgeVariants = cva("", {
  variants: {
    variant: catalogEntryVariants,
  },
})

export type CatalogEntryBadgeProps = VariantProps<typeof catalogEntryBadgeVariants> & {
  children: React.ReactNode
}

export const CatalogEntryBadge: React.FC<CatalogEntryBadgeProps> = ({ variant, children }) => (
  <Badge variant="plain" className={cn(catalogEntryBadgeVariants({ variant }))}>
    {children}
  </Badge>
)
