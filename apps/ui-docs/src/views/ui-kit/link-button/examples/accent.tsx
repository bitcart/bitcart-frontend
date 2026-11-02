import { LinkButton } from "@bitcart/ui-kit/components"

export const AccentLinkButtonExample: React.FC = () => (
  <div className="gap-4 flex flex-wrap items-center justify-center">
    <LinkButton href="/ui-kit" variant="accent" size="sm">
      Accent sm
    </LinkButton>

    <LinkButton href="/ui-kit" variant="accent" size="default">
      Accent default
    </LinkButton>

    <LinkButton href="/ui-kit" variant="accent" size="lg">
      Accent lg
    </LinkButton>

    <LinkButton disabled href="/ui-kit" variant="accent" size="lg">
      Accent lg disabled
    </LinkButton>
  </div>
)
