import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@bitcart/ui-kit/components"

export const ButtonInputGroupExample: React.FC = () => (
  <InputGroup className="max-w-sm">
    <InputGroupInput placeholder="bc1qxy2k…0wlh" readOnly />

    <InputGroupAddon align="inline-end">
      <InputGroupButton>Copy</InputGroupButton>
    </InputGroupAddon>
  </InputGroup>
)
