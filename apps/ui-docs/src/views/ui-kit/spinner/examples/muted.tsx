import { Button, Spinner } from "@bitcart/ui-kit/components"

export const MutedSpinnerExample: React.FC = () => (
  <div className="gap-4 flex flex-col items-center">
    <div className="text-muted-foreground gap-2 text-sm flex items-center">
      <Spinner className="size-4" />
      <span>Fetching invoices…</span>
    </div>

    <Button disabled>
      <Spinner className="size-4" />
      Processing
    </Button>
  </div>
)
