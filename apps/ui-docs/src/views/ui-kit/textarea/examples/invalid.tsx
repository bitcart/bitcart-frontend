import { Textarea } from "@bitcart/ui-kit/components"

export const InvalidTextareaExample: React.FC = () => (
  <div className="max-w-sm w-full">
    <Textarea aria-invalid defaultValue="Too short" />
  </div>
)
