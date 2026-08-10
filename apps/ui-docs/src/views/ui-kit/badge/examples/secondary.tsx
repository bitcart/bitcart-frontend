import { Badge } from "@bitcart/ui-kit/components"
import { BitcartLogoIcon } from "@bitcart/ui-kit/icons"

export const SecondaryBadgeExample: React.FC = () => (
  <div className="gap-3 flex flex-wrap items-center justify-center">
    <Badge variant="secondary">Secondary</Badge>

    <Badge variant="secondary">
      <BitcartLogoIcon />
      Secondary
    </Badge>
  </div>
)
