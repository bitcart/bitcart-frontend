import { Input } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { t } from "@lingui/core/macro"
import { useCallback, useState } from "react"

import type { InvoicePayment } from "#/common/data/bitcart/types"

const CopyField = ({ label, value }: { label: string; value: string }) => {
  const [copied, setCopied] = useState(false)

  const handleClick = useCallback(() => {
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 800)
    })
  }, [value])

  return (
    <div className="space-y-2">
      <div className="text-muted-foreground text-sm text-center">{label}</div>
      <button
        type="button"
        className="relative w-full cursor-pointer text-left"
        onClick={handleClick}
      >
        <Input value={value} readOnly className="text-sm font-mono pointer-events-none" />
        {copied && (
          <div
            className={cn(`
              inset-0 rounded-md bg-green-50 text-green-600 animate-copied-flash text-sm font-medium
              absolute flex items-center justify-center
            `)}
          >
            {t`Copied!`}
          </div>
        )}
      </button>
    </div>
  )
}

type CopyTabProps = {
  payment: InvoicePayment
}

export const CopyTab = ({ payment }: CopyTabProps) => {
  return (
    <div className="space-y-5 px-4 py-6">
      <div className="space-y-2">
        <div className="text-muted-foreground text-sm text-center">{t`Amount`}</div>
        <div className="text-2xl font-light text-center">
          {payment.amount} {payment.name}
        </div>
      </div>

      <CopyField label={t`Address`} value={payment.payment_address} />
      <CopyField label={t`Payment Link`} value={payment.payment_url} />
    </div>
  )
}
