import { Spinner } from "@bitcart/ui-kit/components"

export const DefaultSpinnerExample: React.FC = () => (
  <div className="gap-6 flex flex-wrap items-center justify-center">
    <Spinner className="size-4" />
    <Spinner className="size-6" />
    <Spinner className="size-8" />
  </div>
)
