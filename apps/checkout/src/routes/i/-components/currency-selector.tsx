import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@bitcart/ui-kit/components"
import { t } from "@lingui/core/macro"

import type { InvoicePayment } from "#/common/data/bitcart"

type CurrencySelectorProps = {
  payments: InvoicePayment[]
  selectedIndex: number
  onSelect: (index: number) => void
}

export const CurrencySelector = ({ payments, selectedIndex, onSelect }: CurrencySelectorProps) => {
  return (
    <div className="px-4 py-3 flex items-center justify-between border-b">
      <span className="text-sm">{t`Pay with`}</span>
      {payments.length > 1 ? (
        <Select value={String(selectedIndex)} onValueChange={(value) => onSelect(Number(value))}>
          <SelectTrigger size="sm" className="w-auto">
            <SelectValue />
          </SelectTrigger>

          <SelectContent side="bottom">
            {payments.map((payment, index) => (
              <SelectItem key={index} value={String(index)}>
                {payment.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <span className="text-sm font-medium">{payments[0]?.name}</span>
      )}
    </div>
  )
}
