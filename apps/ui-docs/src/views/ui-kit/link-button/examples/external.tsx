import { LinkButton } from "@bitcart/ui-kit/components"

export const ExternalLinkButtonExample: React.FC = () => (
  <div className="gap-4 flex flex-wrap items-center justify-center">
    <LinkButton href="https://bitcart.ai" isExternalLink variant="outline">
      Visit bitcart.ai
    </LinkButton>
  </div>
)
