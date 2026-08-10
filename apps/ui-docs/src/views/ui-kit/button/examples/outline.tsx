import { Button } from "@bitcart/ui-kit/components"
import { BitcartLogoIcon } from "@bitcart/ui-kit/icons"

export const OutlineButtonExample: React.FC = () => (
  <div className="gap-4 flex flex-col">
    <div className="gap-4 flex flex-wrap items-center justify-center">
      <Button variant="outline" size="sm">
        Outline sm
      </Button>

      <Button variant="outline" size="default">
        Outline default
      </Button>

      <Button variant="outline" size="lg">
        Outline lg
      </Button>
    </div>

    <div className="gap-4 flex flex-wrap items-center justify-center">
      <Button variant="outline" size="xl">
        Outline xl
      </Button>

      <Button disabled variant="outline" size="xl">
        Outline xl disabled
      </Button>
    </div>

    <div className="gap-4 flex flex-wrap items-center justify-center">
      <Button variant="outline" size="icon-sm">
        <BitcartLogoIcon />
      </Button>

      <Button variant="outline" size="icon">
        <BitcartLogoIcon />
      </Button>

      <Button variant="outline" size="icon-lg">
        <BitcartLogoIcon />
      </Button>

      <Button disabled variant="outline" size="icon-lg">
        <BitcartLogoIcon />
      </Button>
    </div>
  </div>
)
