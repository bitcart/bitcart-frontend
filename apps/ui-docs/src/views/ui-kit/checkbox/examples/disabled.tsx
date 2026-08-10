import { Checkbox, Label } from "@bitcart/ui-kit/components"

export const DisabledCheckboxExample: React.FC = () => (
  <div className="gap-4 flex flex-col">
    <div className="gap-3 flex items-center">
      <Checkbox id="checkbox-example-disabled" disabled />
      <Label htmlFor="checkbox-example-disabled">Enable notifications</Label>
    </div>

    <div className="gap-3 flex items-center">
      <Checkbox id="checkbox-example-disabled-checked" disabled defaultChecked />
      <Label htmlFor="checkbox-example-disabled-checked">Two-factor authentication</Label>
    </div>
  </div>
)
