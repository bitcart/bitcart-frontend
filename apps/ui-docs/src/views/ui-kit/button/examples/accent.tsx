import { Button } from "@bitcart/ui-kit/components"
import { BitcartLogoIcon } from "@bitcart/ui-kit/icons"

export const AccentButtonExample: React.FC = () => (
  <div className="gap-4 flex flex-col">
    <div className="gap-4 flex flex-wrap items-center justify-center">
      <Button variant="accent" size="sm">
        Accent sm
      </Button>

      <Button variant="accent" size="default">
        Accent default
      </Button>

      <Button variant="accent" size="lg">
        Accent lg
      </Button>
    </div>

    <div className="gap-4 flex flex-wrap items-center justify-center">
      <Button variant="accent" size="xl">
        Accent xl
      </Button>

      <Button disabled variant="accent" size="xl">
        Accent xl disabled
      </Button>
    </div>

    <div className="gap-4 flex flex-wrap items-center justify-center">
      <Button variant="accent" size="icon-sm">
        <BitcartLogoIcon />
      </Button>

      <Button variant="accent" size="icon">
        <BitcartLogoIcon />
      </Button>

      <Button variant="accent" size="icon-lg">
        <BitcartLogoIcon />
      </Button>

      <Button disabled variant="accent" size="icon-lg">
        <BitcartLogoIcon />
      </Button>
    </div>
  </div>
)
