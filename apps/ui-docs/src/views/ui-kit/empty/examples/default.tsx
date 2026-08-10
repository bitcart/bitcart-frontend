import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@bitcart/ui-kit/components"

export const DefaultEmptyExample: React.FC = () => (
  <Empty className="border">
    <EmptyHeader>
      <EmptyTitle>No merchants yet</EmptyTitle>
      <EmptyDescription>Merchants will appear here once they join.</EmptyDescription>
    </EmptyHeader>

    <EmptyContent>
      <Button size="sm">Add merchant</Button>
    </EmptyContent>
  </Empty>
)
