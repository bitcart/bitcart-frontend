import { Button } from "@bitcart/ui-kit/components"
import { BitcartLogoIcon } from "@bitcart/ui-kit/icons"

export const ExpandingButtonExample: React.FC = () => (
  <div className="gap-4 flex flex-col">
    <div className="gap-4 flex flex-wrap items-center justify-center">
      <Button variant="default" expandOnHover size="sm">
        Expanding sm
      </Button>

      <Button variant="default" expandOnHover size="default">
        Expanding default
      </Button>

      <Button variant="default" expandOnHover size="lg">
        Expanding lg
      </Button>
    </div>

    <div className="gap-4 flex flex-wrap items-center justify-center">
      <Button variant="default" expandOnHover size="xl">
        Expanding xl
      </Button>

      <Button disabled variant="default" expandOnHover size="xl">
        Expanding xl disabled
      </Button>
    </div>

    <div className="gap-4 flex flex-wrap items-center justify-center">
      <Button variant="default" expandOnHover size="icon-sm">
        <BitcartLogoIcon />
      </Button>

      <Button variant="default" expandOnHover size="icon">
        <BitcartLogoIcon />
      </Button>

      <Button variant="default" expandOnHover size="icon-lg">
        <BitcartLogoIcon />
      </Button>

      <Button disabled variant="default" expandOnHover size="icon-lg">
        <BitcartLogoIcon />
      </Button>
    </div>
  </div>
)
