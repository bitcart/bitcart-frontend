import { Button } from "@bitcart/ui-kit/components"
import { BitcartLogoIcon } from "@bitcart/ui-kit/icons"

export const DefaultButtonExample: React.FC = () => (
  <div className="gap-4 flex flex-col">
    <div className="gap-4 flex flex-wrap items-center justify-center">
      <Button variant="default" size="sm">
        Default sm
      </Button>

      <Button variant="default" size="default">
        Default default
      </Button>

      <Button variant="default" size="lg">
        Default lg
      </Button>
    </div>

    <div className="gap-4 flex flex-wrap items-center justify-center">
      <Button variant="default" size="xl">
        Default xl
      </Button>

      <Button disabled variant="default" size="xl">
        Default xl disabled
      </Button>
    </div>

    <div className="gap-4 flex flex-wrap items-center justify-center">
      <Button variant="default" size="icon-sm">
        <BitcartLogoIcon />
      </Button>

      <Button variant="default" size="icon">
        <BitcartLogoIcon />
      </Button>

      <Button variant="default" size="icon-lg">
        <BitcartLogoIcon />
      </Button>

      <Button disabled variant="default" size="icon-lg">
        <BitcartLogoIcon />
      </Button>
    </div>
  </div>
)
