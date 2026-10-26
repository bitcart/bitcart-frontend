import { ToggleGroup, ToggleGroupItem } from "@bitcart/ui-kit/components"
import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react"

export const MultipleToggleGroupExample: React.FC = () => (
  <ToggleGroup multiple defaultValue={["bold"]} aria-label="Text formatting">
    <ToggleGroupItem value="bold" aria-label="Bold">
      <BoldIcon />
    </ToggleGroupItem>

    <ToggleGroupItem value="italic" aria-label="Italic">
      <ItalicIcon />
    </ToggleGroupItem>

    <ToggleGroupItem value="underline" aria-label="Underline">
      <UnderlineIcon />
    </ToggleGroupItem>
  </ToggleGroup>
)
