import { Checkbox, Label } from "@bitcart/ui-kit/components"

export const DefaultCheckboxExample: React.FC = () => (
  <div className="gap-3 flex items-center">
    <Checkbox id="checkbox-example-terms" />
    <Label htmlFor="checkbox-example-terms">Accept terms and conditions</Label>
  </div>
)
