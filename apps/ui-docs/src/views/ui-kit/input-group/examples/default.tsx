import { InputGroup, InputGroupAddon, InputGroupInput } from "@bitcart/ui-kit/components"
import { SearchIcon } from "lucide-react"

export const DefaultInputGroupExample: React.FC = () => (
  <InputGroup className="max-w-sm">
    <InputGroupAddon>
      <SearchIcon />
    </InputGroupAddon>

    <InputGroupInput placeholder="Search merchants…" />
  </InputGroup>
)
