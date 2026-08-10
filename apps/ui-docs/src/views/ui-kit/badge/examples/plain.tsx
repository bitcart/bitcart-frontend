import { Badge } from "@bitcart/ui-kit/components"
import { BitcartLogoIcon } from "@bitcart/ui-kit/icons"

export const PlainBadgeExample: React.FC = () => (
  <div className="gap-3 flex flex-wrap items-center justify-center">
    <Badge variant="plain">Plain</Badge>

    <Badge variant="plain">
      <BitcartLogoIcon />
      Plain
    </Badge>
  </div>
)
