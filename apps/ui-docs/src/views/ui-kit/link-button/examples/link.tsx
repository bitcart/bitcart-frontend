import { LinkButton } from "@bitcart/ui-kit/components"

export const LinkLinkButtonExample: React.FC = () => (
  <div className="gap-4 flex flex-wrap items-center justify-center">
    <LinkButton href="/ui-kit" variant="link" size="sm">
      Link sm
    </LinkButton>

    <LinkButton href="/ui-kit" variant="link" size="default">
      Link default
    </LinkButton>

    <LinkButton href="/ui-kit" variant="link" size="lg">
      Link lg
    </LinkButton>

    <LinkButton disabled href="/ui-kit" variant="link" size="lg">
      Link lg disabled
    </LinkButton>
  </div>
)
