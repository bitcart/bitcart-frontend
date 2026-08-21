import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { t } from "@lingui/core/macro"
import { ChevronDownIcon } from "lucide-react"
import { useState } from "react"

import type { InvoicePayment } from "#/common/data/bitcart/types"

type PaymentSummaryProps = {
  storeName: string
  payment: InvoicePayment
  orderAmount: string
  orderCurrency: string
}

export const PaymentSummary = ({
  storeName,
  payment,
  orderAmount,
  orderCurrency,
}: PaymentSummaryProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="px-4 py-3 w-full border-b">
        <div className="flex items-start justify-between">
          <span className="text-sm">{storeName}</span>
          <div className="text-right">
            <div className="text-sm font-medium">
              {payment.amount} {payment.name}
            </div>
            <div className="text-muted-foreground text-xs">{payment.rate_str}</div>
          </div>
        </div>
        <div className="mt-1 flex justify-center">
          <ChevronDownIcon
            className={cn(`size-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}
            `)}
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-4 py-2 border-b">
          <div className="py-1.5 flex items-start justify-between">
            <span className="text-sm">{t`Order amount`}</span>
            <div className="text-right">
              <div className="text-sm">
                {payment.amount} {payment.name}
              </div>
              <div className="text-muted-foreground text-xs">
                {orderAmount} {orderCurrency}
              </div>
            </div>
          </div>
          <div className="py-1.5 flex items-center justify-between">
            <span className="text-sm">{t`Already paid`}</span>
            <span className="text-sm">
              {payment.already_paid} {payment.name}
            </span>
          </div>
          <div className="py-1.5 flex items-center justify-between">
            <span className="text-sm font-medium">{t`Due`}</span>
            <span className="text-sm font-medium">
              {payment.due} {payment.name}
            </span>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
