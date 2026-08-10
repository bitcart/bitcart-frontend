import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@bitcart/ui-kit/components"

export const TextareaInputGroupExample: React.FC = () => (
  <InputGroup className="max-w-sm">
    <InputGroupTextarea placeholder="Describe the refund reason…" />

    <InputGroupAddon align="block-end">
      <InputGroupText>Visible to the customer</InputGroupText>
    </InputGroupAddon>
  </InputGroup>
)
