import type { bitcartInvoices } from "@bitcart/api-sdk/endpoints"
import { t } from "@lingui/core/macro"
import { cva } from "class-variance-authority"
import {
  CheckIcon,
  CircleHelpIcon,
  ClockIcon,
  Loader2Icon,
  RotateCcwIcon,
  XIcon,
} from "lucide-react"

const statusBarVariants = cva(
  "rounded-t-lg px-4 py-2 text-sm font-medium text-white flex items-center justify-between",
  {
    variants: {
      status: {
        pending: "bg-green-600",
        unconfirmed: "bg-blue-600 animate-pulse",
        paid: "bg-blue-600 animate-pulse",
        confirmed: "bg-blue-600",
        complete: "bg-green-600",
        refunded: "bg-amber-600",
        expired: "bg-gray-500",
        invalid: "bg-red-600",
        unknown: "bg-gray-500",
      },
    },
  },
)

const STATUS_LABELS: Record<bitcartInvoices.InvoiceStatus, () => string> = {
  pending: () => t`Awaiting Payment`,
  unconfirmed: () => t`Awaiting Confirmation`,
  paid: () => t`Payment Received`,
  confirmed: () => t`Payment Confirmed`,
  complete: () => t`Payment Complete`,
  refunded: () => t`Refunded`,
  expired: () => t`Invoice Expired`,
  invalid: () => t`Invalid`,
  unknown: () => t`Status Unavailable`,
}

const StatusIcon = ({ status }: { status: bitcartInvoices.InvoiceStatus }) => {
  switch (status) {
    case "pending":
      return <Loader2Icon className="size-4 animate-spin" />
    case "unconfirmed":
      return <Loader2Icon className="size-4 animate-spin" />
    case "paid":
      return <Loader2Icon className="size-4 animate-spin" />
    case "confirmed":
      return <CheckIcon className="size-4" />
    case "complete":
      return <CheckIcon className="size-4" />
    case "refunded":
      return <RotateCcwIcon className="size-4" />
    case "expired":
      return <ClockIcon className="size-4" />
    case "invalid":
      return <XIcon className="size-4" />
    case "unknown":
      return <CircleHelpIcon className="size-4" />
  }
}

type StatusBarProps = {
  status: bitcartInvoices.InvoiceStatus
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
