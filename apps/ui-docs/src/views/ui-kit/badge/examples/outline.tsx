import { Badge } from "@bitcart/ui-kit/components"
import { BitcartLogoIcon } from "@bitcart/ui-kit/icons"

export const OutlineBadgeExample: React.FC = () => (
  <div className="gap-3 flex flex-wrap items-center justify-center">
    <Badge variant="outline">Outline</Badge>

    <Badge variant="outline">
      <BitcartLogoIcon />
      Outline
    </Badge>
  </div>
)
