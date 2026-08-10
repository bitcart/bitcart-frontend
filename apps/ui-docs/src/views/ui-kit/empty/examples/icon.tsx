import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@bitcart/ui-kit/components"
import { StoreIcon } from "lucide-react"

export const IconEmptyExample: React.FC = () => (
  <Empty className="border">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <StoreIcon />
      </EmptyMedia>

      <EmptyTitle>No merchants yet</EmptyTitle>
      <EmptyDescription>Merchants will appear here once they join.</EmptyDescription>
    </EmptyHeader>

    <EmptyContent>
      <Button size="sm">Add merchant</Button>
    </EmptyContent>
  </Empty>
)
