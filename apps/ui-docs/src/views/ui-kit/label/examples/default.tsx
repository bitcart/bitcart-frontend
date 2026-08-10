import { Input, Label } from "@bitcart/ui-kit/components"

export const DefaultLabelExample: React.FC = () => (
  <div className="gap-2 max-w-xs flex w-full flex-col">
    <Label htmlFor="label-example-email">Email address</Label>
    <Input id="label-example-email" type="email" placeholder="merchant@example.com" />
  </div>
)
