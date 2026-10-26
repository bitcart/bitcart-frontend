import { cn } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react/macro"

export const LabeledDivider = ({ label, className }: { label: string; className?: string }) => (
  <div className={cn("gap-3 text-xs text-muted-foreground flex items-center", className)}>
    <span aria-hidden className="bg-border h-px flex-1" />
    {label}
    <span aria-hidden className="bg-border h-px flex-1" />
  </div>
)

export const ManualPaymentDivider = ({ className }: { className?: string }) => {
  const { t } = useLingui()

  return <LabeledDivider label={t`or send it yourself`} className={className} />
}
