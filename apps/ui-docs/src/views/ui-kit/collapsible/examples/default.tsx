import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@bitcart/ui-kit/components"
import { ChevronsUpDownIcon } from "lucide-react"

export const DefaultCollapsibleExample: React.FC = () => (
  <Collapsible className="gap-2 w-80 flex flex-col">
    <div className="px-4 gap-4 flex items-center justify-between">
      <h4 className="text-sm font-semibold">Connected wallets (3)</h4>

      <CollapsibleTrigger render={<Button variant="ghost" size="icon-sm" />}>
        <ChevronsUpDownIcon />
        <span className="sr-only">Toggle</span>
      </CollapsibleTrigger>
    </div>

    <div className="border-border rounded-md px-4 py-2 font-mono text-sm border">bc1qxy2k…0wlh</div>

    <CollapsibleContent className="gap-2 flex flex-col">
      <div className="border-border rounded-md px-4 py-2 font-mono text-sm border">
        bc1q9d3e…7klm
      </div>

      <div className="border-border rounded-md px-4 py-2 font-mono text-sm border">
        bc1p5cyx…4fnr
      </div>
    </CollapsibleContent>
  </Collapsible>
)
