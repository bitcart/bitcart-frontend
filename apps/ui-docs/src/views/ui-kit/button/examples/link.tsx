import { Button } from "@bitcart/ui-kit/components"
import { BitcartLogoIcon } from "@bitcart/ui-kit/icons"

export const LinkButtonExample: React.FC = () => (
  <div className="gap-4 flex flex-col">
    <div className="gap-4 flex flex-wrap items-center justify-center">
      <Button variant="link" size="sm">
        Link sm
      </Button>

      <Button variant="link" size="default">
        Link default
      </Button>

      <Button variant="link" size="lg">
        Link lg
      </Button>
    </div>

    <div className="gap-4 flex flex-wrap items-center justify-center">
      <Button variant="link" size="xl">
        Link xl
      </Button>

      <Button disabled variant="link" size="xl">
        Link xl disabled
      </Button>
    </div>

    <div className="gap-4 flex flex-wrap items-center justify-center">
      <Button variant="link" size="icon-sm">
        <BitcartLogoIcon />
      </Button>

      <Button variant="link" size="icon">
        <BitcartLogoIcon />
      </Button>

      <Button variant="link" size="icon-lg">
        <BitcartLogoIcon />
      </Button>

      <Button disabled variant="link" size="icon-lg">
        <BitcartLogoIcon />
      </Button>
    </div>
  </div>
)
