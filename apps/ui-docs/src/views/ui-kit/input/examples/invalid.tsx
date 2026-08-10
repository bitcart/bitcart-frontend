import { Input } from "@bitcart/ui-kit/components"

export const InvalidInputExample: React.FC = () => (
  <div className="max-w-xs w-full">
    <Input type="email" aria-invalid defaultValue="not-an-email" />
  </div>
)
