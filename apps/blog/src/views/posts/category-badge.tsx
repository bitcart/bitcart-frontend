import { Link } from "@bitcart/tanstack-start-kit/navigation"
import { Badge } from "@bitcart/ui-kit/components"

import { CATEGORIES, type CategoryKey } from "#/common/content/taxonomy"
import { getCategoryHref } from "#/common/navigation"

export type CategoryBadgeProps = {
  category: CategoryKey
}

//* `relative z-10` lifts the badge above the card-wide link overlay, so it stays clickable.
export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => (
  <Badge
    variant="accent"
    className="relative z-10"
    render={<Link href={getCategoryHref(category)} />}
  >
    {CATEGORIES[category].label}
  </Badge>
)
