import { bitcartInvoices } from "@bitcart/api-sdk/endpoints"
import type { HttpHref } from "@bitcart/core/navigation"
import { CHECKOUT_STATUS_TESTID } from "@bitcart/qa"
import { LinkButton } from "@bitcart/ui-kit/components"
import type { IconComponent } from "@bitcart/ui-kit/types"
import { cn } from "@bitcart/ui-kit/utils"
import type { MessageDescriptor } from "@lingui/core"
import { msg } from "@lingui/core/macro"
import { useLingui } from "@lingui/react/macro"
import confetti from "canvas-confetti"
import { CheckIcon, ClockIcon, RotateCcwIcon, XIcon } from "lucide-react"
import { useEffect } from "react"

import { ExtensionSlot } from "../runtime/slot"

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
  title: MessageDescriptor
}

const TERMINAL_STATUS_DISPLAY_PARAMS: Record<
  bitcartInvoices.InvoiceTerminalStatus,
  StatusDisplayParams
> = {
  complete: {
    bg: "bg-success/10",
    iconBg: "text-success",
    titleColor: "text-success",
    Icon: CheckIcon,
    title: msg`Payment complete`,
  },

  refunded: {
    bg: "bg-warning/10",
    iconBg: "text-warning",
    titleColor: "text-warning",
    Icon: RotateCcwIcon,
    title: msg`Payment refunded`,
  },

  expired: {
    bg: "bg-muted",
    iconBg: "text-muted-foreground",
    titleColor: "text-muted-foreground",
    Icon: ClockIcon,
    title: msg`Invoice expired`,
  },

  invalid: {
    bg: "bg-destructive/10",
    iconBg: "text-destructive-foreground",
    titleColor: "text-destructive-foreground",
    Icon: XIcon,
    title: msg`This invoice has been marked as invalid`,
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
  const { t } = useLingui()

  useEffect(() => {
    if (status !== "complete") return void null

    const end = Date.now() + 2000
    let frameId = 0

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
        frameId = requestAnimationFrame(frame)
      }
    }

    frame()

    return () => {
      cancelAnimationFrame(frameId)
      confetti.reset()
    }
  }, [status])

  if (!bitcartInvoices.isTerminalStatus(status)) {
    return null
  }

  const config = TERMINAL_STATUS_DISPLAY_PARAMS[status]
  const { Icon } = config

  return (
    <div data-testid={CHECKOUT_STATUS_TESTID} className={cn(`${config.bg} px-8 py-12 text-center`)}>
      <div className={cn(`size-16 mx-auto ${config.iconBg}`)}>
        <Icon className="size-full" strokeWidth={1.5} />
      </div>

      <p className={cn(`mt-6 text-xl font-semibold ${config.titleColor}`)}>{t(config.title)}</p>
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

      <ExtensionSlot name="checkout:status-extra" className="mt-6" />
      {children}
    </div>
  )
}
