import { FloatingActionButton } from "@bitcart/ui-kit/components"
import { BitcartLogoIcon } from "@bitcart/ui-kit/icons"

export const DefaultFloatingActionButtonExample: React.FC = () => (
  <div className="gap-4 flex flex-wrap items-center justify-center">
    <FloatingActionButton size="sm">
      <BitcartLogoIcon />
    </FloatingActionButton>

    <FloatingActionButton size="default">
      <BitcartLogoIcon />
    </FloatingActionButton>
  </div>
)
