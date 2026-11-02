import { LinkButton } from "@bitcart/ui-kit/components"

export const DefaultLinkButtonExample: React.FC = () => (
  <div className="gap-4 flex flex-wrap items-center justify-center">
    <LinkButton href="/ui-kit" variant="default" size="sm">
      Default sm
    </LinkButton>

    <LinkButton href="/ui-kit" variant="default" size="default">
      Default default
    </LinkButton>

    <LinkButton href="/ui-kit" variant="default" size="lg">
      Default lg
    </LinkButton>

    <LinkButton disabled href="/ui-kit" variant="default" size="lg">
      Default lg disabled
    </LinkButton>
  </div>
)
