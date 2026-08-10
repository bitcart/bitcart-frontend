import { Button } from "@bitcart/ui-kit/components"
import { BitcartLogoIcon } from "@bitcart/ui-kit/icons"

export const WhiteButtonExample: React.FC = () => (
  <div className="gap-4 bg-primary p-4 rounded-md flex flex-col">
    <div className="gap-4 flex flex-wrap items-center justify-center">
      <Button variant="white" size="sm">
        White sm
      </Button>

      <Button variant="white" size="default">
        White default
      </Button>

      <Button variant="white" size="lg">
        White lg
      </Button>
    </div>

    <div className="gap-4 flex flex-wrap items-center justify-center">
      <Button variant="white" size="xl">
        White xl
      </Button>

      <Button disabled variant="white" size="xl">
        White xl disabled
      </Button>
    </div>

    <div className="gap-4 flex flex-wrap items-center justify-center">
      <Button variant="white" size="icon-sm">
        <BitcartLogoIcon />
      </Button>

      <Button variant="white" size="icon">
        <BitcartLogoIcon />
      </Button>

      <Button variant="white" size="icon-lg">
        <BitcartLogoIcon />
      </Button>

      <Button disabled variant="white" size="icon-lg">
        <BitcartLogoIcon />
      </Button>
    </div>
  </div>
)
