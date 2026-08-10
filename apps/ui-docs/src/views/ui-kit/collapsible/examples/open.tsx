import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@bitcart/ui-kit/components"
import { ChevronsUpDownIcon } from "lucide-react"

export const OpenCollapsibleExample: React.FC = () => (
  <Collapsible defaultOpen className="gap-2 w-80 flex flex-col">
    <div className="px-4 gap-4 flex items-center justify-between">
      <h4 className="text-sm font-semibold">Recent invoices</h4>

      <CollapsibleTrigger render={<Button variant="ghost" size="icon-sm" />}>
        <ChevronsUpDownIcon />
        <span className="sr-only">Toggle</span>
      </CollapsibleTrigger>
    </div>

    <CollapsibleContent className="gap-2 flex flex-col">
      <div className="border-border rounded-md px-4 py-2 text-sm border">#1042 — 0.0012 BTC</div>
      <div className="border-border rounded-md px-4 py-2 text-sm border">#1041 — 0.0210 BTC</div>
      <div className="border-border rounded-md px-4 py-2 text-sm border">#1040 — 0.0035 BTC</div>
    </CollapsibleContent>
  </Collapsible>
)
