import { cn } from "@bitcart/ui-kit/utils"

import { CheckoutControls } from "./controls"
import { PoweredBy } from "./powered-by"

export const CheckoutFooter = ({ className }: { className?: string }) => (
  <div
    className={cn("px-5 py-3 border-border flex items-center justify-between border-t", className)}
  >
    <CheckoutControls />
    <PoweredBy />
  </div>
)
