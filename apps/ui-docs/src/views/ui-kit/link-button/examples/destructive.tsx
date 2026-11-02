import { LinkButton } from "@bitcart/ui-kit/components"

export const DestructiveLinkButtonExample: React.FC = () => (
  <div className="gap-4 flex flex-wrap items-center justify-center">
    <LinkButton href="/ui-kit" variant="destructive" size="sm">
      Destructive sm
    </LinkButton>

    <LinkButton href="/ui-kit" variant="destructive" size="default">
      Destructive default
    </LinkButton>

    <LinkButton href="/ui-kit" variant="destructive" size="lg">
      Destructive lg
    </LinkButton>

    <LinkButton disabled href="/ui-kit" variant="destructive" size="lg">
      Destructive lg disabled
    </LinkButton>
  </div>
)
