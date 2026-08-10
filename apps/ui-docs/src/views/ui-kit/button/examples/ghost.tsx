import { Button } from "@bitcart/ui-kit/components"
import { BitcartLogoIcon } from "@bitcart/ui-kit/icons"

export const GhostButtonExample: React.FC = () => (
  <div className="gap-4 flex flex-col">
    <div className="gap-4 flex flex-wrap items-center justify-center">
      <Button variant="ghost" size="sm">
        Ghost sm
      </Button>

      <Button variant="ghost" size="default">
        Ghost default
      </Button>

      <Button variant="ghost" size="lg">
        Ghost lg
      </Button>
    </div>

    <div className="gap-4 flex flex-wrap items-center justify-center">
      <Button variant="ghost" size="xl">
        Ghost xl
      </Button>

      <Button disabled variant="ghost" size="xl">
        Ghost xl disabled
      </Button>
    </div>

    <div className="gap-4 flex flex-wrap items-center justify-center">
      <Button variant="ghost" size="icon-sm">
        <BitcartLogoIcon />
      </Button>

      <Button variant="ghost" size="icon">
        <BitcartLogoIcon />
      </Button>

      <Button variant="ghost" size="icon-lg">
        <BitcartLogoIcon />
      </Button>

      <Button disabled variant="ghost" size="icon-lg">
        <BitcartLogoIcon />
      </Button>
    </div>
  </div>
)
