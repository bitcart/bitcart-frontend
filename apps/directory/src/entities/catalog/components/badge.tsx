import { Badge } from "@bitcart/ui-kit/components"
import type { WithChildren } from "@bitcart/ui-kit/types"
import { cn } from "@bitcart/ui-kit/utils"
import { cva, type VariantProps } from "class-variance-authority"

import type { CatalogEntryBadgeVariant } from "../types"

const catalogEntryVariants: Record<CatalogEntryBadgeVariant, string> = {
  app: "border-pending/40 text-pending",
  host: "border-success/40 text-success",
  merchant: "border-warning/40 text-warning",
  sponsor: "bg-accent text-accent-foreground",
  official: "border-primary/40 text-primary-text",
}

const catalogEntryBadgeVariants = cva("", {
  variants: {
    variant: catalogEntryVariants,
  },
})

export type CatalogEntryBadgeProps = VariantProps<typeof catalogEntryBadgeVariants> &
  WithChildren & {}

export const CatalogEntryBadge: React.FC<CatalogEntryBadgeProps> = ({ variant, children }) => (
  <Badge variant="plain" className={cn(catalogEntryBadgeVariants({ variant }))}>
    {children}
  </Badge>
)
