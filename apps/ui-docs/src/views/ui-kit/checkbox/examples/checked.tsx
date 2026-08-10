import { Checkbox, Label } from "@bitcart/ui-kit/components"

export const CheckedCheckboxExample: React.FC = () => (
  <div className="gap-3 flex items-center">
    <Checkbox id="checkbox-example-newsletter" defaultChecked />
    <Label htmlFor="checkbox-example-newsletter">Subscribe to the newsletter</Label>
  </div>
)
