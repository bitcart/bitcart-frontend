import { Badge } from "@bitcart/ui-kit/components"
import { BitcartLogoIcon } from "@bitcart/ui-kit/icons"

export const DefaultBadgeExample: React.FC = () => (
  <div className="gap-3 flex flex-wrap items-center justify-center">
    <Badge variant="default">Default</Badge>

    <Badge variant="default">
      <BitcartLogoIcon />
      Default
    </Badge>
  </div>
)
