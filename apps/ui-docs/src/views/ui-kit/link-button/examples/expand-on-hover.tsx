import { LinkButton } from "@bitcart/ui-kit/components"

export const ExpandOnHoverLinkButtonExample: React.FC = () => (
  <div className="gap-4 flex flex-wrap items-center justify-center">
    <LinkButton href="/docs" variant="default" expandOnHover size="sm">
      Expanding sm
    </LinkButton>

    <LinkButton href="/docs" variant="default" expandOnHover size="default">
      Expanding default
    </LinkButton>

    <LinkButton href="/docs" variant="default" expandOnHover size="lg">
      Expanding lg
    </LinkButton>

    <LinkButton disabled href="/docs" variant="default" expandOnHover size="lg">
      Expanding lg disabled
    </LinkButton>
  </div>
)
