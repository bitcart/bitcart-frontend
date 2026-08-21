import { t } from "@lingui/core/macro"
import { cva } from "class-variance-authority"
import { CheckIcon, ClockIcon, Loader2Icon, XIcon } from "lucide-react"

import type { InvoiceStatus } from "#/common/data/bitcart/types"

const statusBarVariants = cva(
  "rounded-t-lg px-4 py-2 text-sm font-medium text-white flex items-center justify-between",
  {
    variants: {
      status: {
        pending: "bg-green-600",
        paid: "bg-blue-600 animate-pulse",
        confirmed: "bg-blue-600",
        complete: "bg-green-600",
        expired: "bg-gray-500",
        invalid: "bg-red-600",
      },
    },
  },
)

const STATUS_LABELS: Record<InvoiceStatus, () => string> = {
  pending: () => t`Awaiting Payment`,
  paid: () => t`Payment Received`,
  confirmed: () => t`Payment Confirmed`,
  complete: () => t`Payment Complete`,
  expired: () => t`Invoice Expired`,
  invalid: () => t`Invalid`,
}

const StatusIcon = ({ status }: { status: InvoiceStatus }) => {
  switch (status) {
    case "pending":
      return <Loader2Icon className="size-4 animate-spin" />
    case "paid":
      return <Loader2Icon className="size-4 animate-spin" />
    case "confirmed":
      return <CheckIcon className="size-4" />
    case "complete":
      return <CheckIcon className="size-4" />
    case "expired":
      return <ClockIcon className="size-4" />
    case "invalid":
      return <XIcon className="size-4" />
  }
}

type StatusBarProps = {
  status: InvoiceStatus
  countdown?: string
}

export const StatusBar = ({ status, countdown }: StatusBarProps) => {
  return (
    <div className={statusBarVariants({ status })}>
      <div className="gap-2 flex items-center">
        <StatusIcon status={status} />
        <span>{STATUS_LABELS[status]()}</span>
      </div>
      {countdown && status === "pending" && <span className="tabular-nums">{countdown}</span>}
    </div>
  )
}
