import { Button } from "@bitcart/ui-kit/components"
import { BitcartLogoIcon } from "@bitcart/ui-kit/icons"

export const SecondaryButtonExample: React.FC = () => (
  <div className="gap-4 flex flex-col">
    <div className="gap-4 flex flex-wrap items-center justify-center">
      <Button variant="secondary" size="sm">
        Secondary sm
      </Button>

      <Button variant="secondary" size="default">
        Secondary default
      </Button>

      <Button variant="secondary" size="lg">
        Secondary lg
      </Button>
    </div>

    <div className="gap-4 flex flex-wrap items-center justify-center">
      <Button variant="secondary" size="xl">
        Secondary xl
      </Button>

      <Button disabled variant="secondary" size="xl">
        Secondary xl disabled
      </Button>
    </div>

    <div className="gap-4 flex flex-wrap items-center justify-center">
      <Button variant="secondary" size="icon-sm">
        <BitcartLogoIcon />
      </Button>

      <Button variant="secondary" size="icon">
        <BitcartLogoIcon />
      </Button>

      <Button variant="secondary" size="icon-lg">
        <BitcartLogoIcon />
      </Button>

      <Button disabled variant="secondary" size="icon-lg">
        <BitcartLogoIcon />
      </Button>
    </div>
  </div>
)
