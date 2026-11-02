import { LinkButton } from "@bitcart/ui-kit/components"

export const OutlineLinkButtonExample: React.FC = () => (
  <div className="gap-4 flex flex-wrap items-center justify-center">
    <LinkButton href="/ui-kit" variant="outline" size="sm">
      Outline sm
    </LinkButton>

    <LinkButton href="/ui-kit" variant="outline" size="default">
      Outline default
    </LinkButton>

    <LinkButton href="/ui-kit" variant="outline" size="lg">
      Outline lg
    </LinkButton>

    <LinkButton disabled href="/ui-kit" variant="outline" size="lg">
      Outline lg disabled
    </LinkButton>
  </div>
)
