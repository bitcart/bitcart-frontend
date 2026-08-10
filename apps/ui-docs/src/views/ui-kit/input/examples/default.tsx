import { Input } from "@bitcart/ui-kit/components"

export const DefaultInputExample: React.FC = () => (
  <div className="gap-4 max-w-xs flex w-full flex-col">
    <Input size="sm" placeholder="Small" />
    <Input size="default" placeholder="Default" />
    <Input size="lg" placeholder="Large" />
  </div>
)
