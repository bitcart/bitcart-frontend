import { bitcartInvoices } from "@bitcart/api-sdk/endpoints"
import type { HttpHref } from "@bitcart/core/navigation"
import { LinkButton } from "@bitcart/ui-kit/components"
import type { IconComponent } from "@bitcart/ui-kit/types"
import { cn } from "@bitcart/ui-kit/utils"
import { t } from "@lingui/core/macro"
import confetti from "canvas-confetti"
import { CheckIcon, ClockIcon, RotateCcwIcon, XIcon } from "lucide-react"
import { useEffect } from "react"

type StatusOverlayProps = {
  status: bitcartInvoices.InvoiceStatus
  storeName: string
  invoiceId: string
  orderAmount: string
  orderCurrency: string
  redirectUrl: HttpHref | ""
  children?: React.ReactNode
}

type StatusDisplayParams = {
  bg: string
  iconBg: string
  titleColor: string
  Icon: IconComponent
  title: () => string
}

const TERMINAL_STATUS_DISPLAY_PARAMS: Record<
  bitcartInvoices.InvoiceTerminalStatus,
  StatusDisplayParams
> = {
  complete: {
    bg: "bg-green-50",
    iconBg: "text-green-600",
    titleColor: "text-green-600",
    Icon: CheckIcon,
    title: () => t`Payment complete`,
  },

  refunded: {
    bg: "bg-amber-50",
    iconBg: "text-amber-600",
    titleColor: "text-amber-600",
    Icon: RotateCcwIcon,
    title: () => t`Payment refunded`,
  },

  expired: {
    bg: "bg-gray-50",
    iconBg: "text-gray-500",
    titleColor: "text-gray-600",
    Icon: ClockIcon,
    title: () => t`Invoice expired`,
  },

  invalid: {
    bg: "bg-red-50",
    iconBg: "text-red-500",
    titleColor: "text-red-500",
    Icon: XIcon,
    title: () => t`This invoice has been marked as invalid`,
  },
}

export const StatusOverlay = ({
  status,
  storeName,
  invoiceId,
  orderAmount,
  orderCurrency,
  redirectUrl,
  children,
}: StatusOverlayProps) => {
  useEffect(() => {
    if (status === "complete") {
      const end = Date.now() + 2000

      const frame = () => {
        void confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
        })

        void confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }

      frame()
    }
  }, [status])

  if (!bitcartInvoices.isTerminalStatus(status)) {
    return null
  }

  const config = TERMINAL_STATUS_DISPLAY_PARAMS[status]
  const { Icon } = config

  return (
    <div className={cn(`${config.bg} px-8 py-12 text-center`)}>
      <div className={cn(`size-16 mx-auto ${config.iconBg}`)}>
        <Icon className="size-full" strokeWidth={1.5} />
      </div>

      <p className={cn(`mt-6 text-xl font-semibold ${config.titleColor}`)}>{config.title()}</p>
      <p className="mt-4 text-sm font-medium">{storeName}</p>

      <p className="mt-1 text-muted-foreground text-sm">
        {t`Invoice`} #{invoiceId}
      </p>

      <p className="mt-1 text-base font-semibold">
        {orderAmount} {orderCurrency}
      </p>

      <div className="mt-6 gap-3 flex justify-center">
        <LinkButton href={`/i/${invoiceId}`} variant="outline" size="sm">
          {t`View Receipt`}
        </LinkButton>

        {redirectUrl && (
          <LinkButton isExternalLink href={redirectUrl} size="sm">
            {t`Return to Store`}
          </LinkButton>
        )}
      </div>

      {children}
    </div>
  )
}
