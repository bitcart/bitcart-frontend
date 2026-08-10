import { Badge } from "@bitcart/ui-kit/components"
import { BitcartLogoIcon } from "@bitcart/ui-kit/icons"

export const AccentBadgeExample: React.FC = () => (
  <div className="gap-3 flex flex-wrap items-center justify-center">
    <Badge variant="accent">Accent</Badge>

    <Badge variant="accent">
      <BitcartLogoIcon />
      Accent
    </Badge>
  </div>
)
