import { Badge } from "@bitcart/ui-kit/components"
import { BitcartLogoIcon } from "@bitcart/ui-kit/icons"

export const DestructiveBadgeExample: React.FC = () => (
  <div className="gap-3 flex flex-wrap items-center justify-center">
    <Badge variant="destructive">Destructive</Badge>

    <Badge variant="destructive">
      <BitcartLogoIcon />
      Destructive
    </Badge>
  </div>
)
