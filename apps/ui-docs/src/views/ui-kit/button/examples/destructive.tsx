import { Button } from "@bitcart/ui-kit/components"
import { BitcartLogoIcon } from "@bitcart/ui-kit/icons"

export const DestructiveButtonExample: React.FC = () => (
  <div className="gap-4 flex flex-col">
    <div className="gap-4 flex flex-wrap items-center justify-center">
      <Button variant="destructive" size="sm">
        Destructive sm
      </Button>

      <Button variant="destructive" size="default">
        Destructive default
      </Button>

      <Button variant="destructive" size="lg">
        Destructive lg
      </Button>
    </div>

    <div className="gap-4 flex flex-wrap items-center justify-center">
      <Button variant="destructive" size="xl">
        Destructive xl
      </Button>

      <Button disabled variant="destructive" size="xl">
        Destructive xl disabled
      </Button>
    </div>

    <div className="gap-4 flex flex-wrap items-center justify-center">
      <Button variant="destructive" size="icon-sm">
        <BitcartLogoIcon />
      </Button>

      <Button variant="destructive" size="icon">
        <BitcartLogoIcon />
      </Button>

      <Button variant="destructive" size="icon-lg">
        <BitcartLogoIcon />
      </Button>

      <Button disabled variant="destructive" size="icon-lg">
        <BitcartLogoIcon />
      </Button>
    </div>
  </div>
)
