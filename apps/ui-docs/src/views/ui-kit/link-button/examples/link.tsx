import { LinkButton } from "@bitcart/ui-kit/components"

export const LinkLinkButtonExample: React.FC = () => (
  <div className="gap-4 flex flex-wrap items-center justify-center">
    <LinkButton href="/docs" variant="link" size="sm">
      Link sm
    </LinkButton>

    <LinkButton href="/docs" variant="link" size="default">
      Link default
    </LinkButton>

    <LinkButton href="/docs" variant="link" size="lg">
      Link lg
    </LinkButton>

    <LinkButton disabled href="/docs" variant="link" size="lg">
      Link lg disabled
    </LinkButton>
  </div>
)
