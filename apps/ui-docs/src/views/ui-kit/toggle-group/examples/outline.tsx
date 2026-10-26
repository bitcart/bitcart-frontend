import { ToggleGroup, ToggleGroupItem } from "@bitcart/ui-kit/components"

export const OutlineToggleGroupExample: React.FC = () => (
  <ToggleGroup variant="outline" defaultValue={["week"]} aria-label="Period">
    <ToggleGroupItem value="day">Day</ToggleGroupItem>
    <ToggleGroupItem value="week">Week</ToggleGroupItem>
    <ToggleGroupItem value="month">Month</ToggleGroupItem>
  </ToggleGroup>
)
