import { Separator } from "@bitcart/ui-kit/components"

export const HorizontalSeparatorExample: React.FC = () => (
  <div className="gap-4 max-w-xs flex w-full flex-col">
    <div className="gap-1 flex flex-col">
      <h4 className="text-sm font-medium">Bitcart</h4>
      <p className="text-muted-foreground text-sm">Self-hosted payment processor</p>
    </div>

    <Separator />

    <div className="text-sm gap-4 flex items-center">
      <span>Docs</span>
      <span>Source</span>
      <span>Community</span>
    </div>
  </div>
)
