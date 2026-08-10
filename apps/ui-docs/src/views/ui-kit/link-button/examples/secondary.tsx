import { LinkButton } from "@bitcart/ui-kit/components"

export const SecondaryLinkButtonExample: React.FC = () => (
  <div className="gap-4 flex flex-wrap items-center justify-center">
    <LinkButton href="/docs" variant="secondary" size="sm">
      Secondary sm
    </LinkButton>

    <LinkButton href="/docs" variant="secondary" size="default">
      Secondary default
    </LinkButton>

    <LinkButton href="/docs" variant="secondary" size="lg">
      Secondary lg
    </LinkButton>

    <LinkButton disabled href="/docs" variant="secondary" size="lg">
      Secondary lg disabled
    </LinkButton>
  </div>
)
