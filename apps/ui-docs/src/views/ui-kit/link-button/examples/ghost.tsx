import { LinkButton } from "@bitcart/ui-kit/components"

export const GhostLinkButtonExample: React.FC = () => (
  <div className="gap-4 flex flex-wrap items-center justify-center">
    <LinkButton href="/docs" variant="ghost" size="sm">
      Ghost sm
    </LinkButton>

    <LinkButton href="/docs" variant="ghost" size="default">
      Ghost default
    </LinkButton>

    <LinkButton href="/docs" variant="ghost" size="lg">
      Ghost lg
    </LinkButton>

    <LinkButton disabled href="/docs" variant="ghost" size="lg">
      Ghost lg disabled
    </LinkButton>
  </div>
)
