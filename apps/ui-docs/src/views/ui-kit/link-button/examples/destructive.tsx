import { LinkButton } from "@bitcart/ui-kit/components"

export const DestructiveLinkButtonExample: React.FC = () => (
  <div className="gap-4 flex flex-wrap items-center justify-center">
    <LinkButton href="/docs" variant="destructive" size="sm">
      Destructive sm
    </LinkButton>

    <LinkButton href="/docs" variant="destructive" size="default">
      Destructive default
    </LinkButton>

    <LinkButton href="/docs" variant="destructive" size="lg">
      Destructive lg
    </LinkButton>

    <LinkButton disabled href="/docs" variant="destructive" size="lg">
      Destructive lg disabled
    </LinkButton>
  </div>
)
