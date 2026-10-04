import { cn } from "@bitcart/ui-kit/utils"

import { ExtensionSlot } from "../runtime/slot"
import { CheckoutControls } from "./controls"
import { PoweredBy } from "./powered-by"

export const CheckoutFooter = ({ className }: { className?: string }) => (
  <div className={cn("border-border border-t", className)}>
    <ExtensionSlot name="checkout:footer-extra" className="px-5 pt-3" />

    <div className="gap-x-3 gap-y-2 px-5 py-3 flex flex-wrap items-center justify-between">
      <CheckoutControls />
      <PoweredBy className="ml-auto" />
    </div>
  </div>
)
