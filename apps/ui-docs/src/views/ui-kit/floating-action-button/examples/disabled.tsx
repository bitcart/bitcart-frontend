import { FloatingActionButton } from "@bitcart/ui-kit/components"
import { BitcartLogoIcon } from "@bitcart/ui-kit/icons"

export const DisabledFloatingActionButtonExample: React.FC = () => (
  <div className="gap-4 flex flex-wrap items-center justify-center">
    <FloatingActionButton disabled size="sm">
      <BitcartLogoIcon />
    </FloatingActionButton>

    <FloatingActionButton disabled size="default">
      <BitcartLogoIcon />
    </FloatingActionButton>
  </div>
)
