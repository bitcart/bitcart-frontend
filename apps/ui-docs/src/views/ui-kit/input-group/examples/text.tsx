import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@bitcart/ui-kit/components"

export const TextInputGroupExample: React.FC = () => (
  <InputGroup className="max-w-sm">
    <InputGroupInput placeholder="0.00" />

    <InputGroupAddon align="inline-end">
      <InputGroupText>BTC</InputGroupText>
    </InputGroupAddon>
  </InputGroup>
)
