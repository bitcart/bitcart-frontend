import { LinkButton } from "@bitcart/ui-kit/components"

export const WhiteLinkButtonExample: React.FC = () => (
  <div className="gap-4 bg-primary p-4 rounded-md flex flex-wrap items-center justify-center">
    <LinkButton href="/docs" variant="white" size="sm">
      White sm
    </LinkButton>

    <LinkButton href="/docs" variant="white" size="default">
      White default
    </LinkButton>

    <LinkButton href="/docs" variant="white" size="lg">
      White lg
    </LinkButton>

    <LinkButton disabled href="/docs" variant="white" size="lg">
      White lg disabled
    </LinkButton>
  </div>
)
