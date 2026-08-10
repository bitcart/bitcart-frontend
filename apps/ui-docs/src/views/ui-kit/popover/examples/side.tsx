import { Button, Popover, PopoverContent, PopoverTrigger } from "@bitcart/ui-kit/components"

export const SidePopoverExample: React.FC = () => (
  <Popover>
    <PopoverTrigger render={<Button variant="outline" />}>Payout details</PopoverTrigger>

    <PopoverContent side="right">
      <div className="gap-2 flex flex-col">
        <p className="text-sm font-medium">Next payout</p>

        <p className="text-muted-foreground text-sm">
          0.0412 BTC leaves the hot wallet on the first business day of the month.
        </p>
      </div>
    </PopoverContent>
  </Popover>
)
