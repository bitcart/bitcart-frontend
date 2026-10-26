import type { HttpHref, InternalHref } from "@bitcart/core/navigation"
import { CHECKOUT_STATUS_TESTID } from "@bitcart/qa"
import { Button, LinkButton } from "@bitcart/ui-kit/components"
import type { IconComponent } from "@bitcart/ui-kit/types"
import { cn } from "@bitcart/ui-kit/utils"
import type { MessageDescriptor } from "@lingui/core"
import { msg } from "@lingui/core/macro"
import { useLingui } from "@lingui/react/macro"
import confetti from "canvas-confetti"
import { CheckIcon, CircleQuestionMarkIcon, ClockIcon, RotateCcwIcon, XIcon } from "lucide-react"
import { useEffect } from "react"

import { useAmountFormat } from "../amount-format"
import { useCheckoutAppConfig } from "../hooks"
import type { CheckoutFinalStatus, CheckoutStatusException, CheckoutStoreSupport } from "../model"
import type { CheckoutReceiptPrinter } from "../receipt-printer"
import { useRedirectEngagement } from "../redirect-engagement"
import { ExtensionSlot } from "../runtime/slot"
import { useCanOpenExternalLinks } from "../terminal"
import { PrintReceiptButton, PrintReceiptFailure } from "./print-receipt"
import { RedirectAnnouncement, ReturnToStoreButton } from "./return-to-store"

type StatusOverlayProps = {
  status: CheckoutFinalStatus
  exception: CheckoutStatusException | null
  storeName: string
  storeSupport: CheckoutStoreSupport | null
  invoiceId: string
  price: string | null
  receivedAmount?: string
  celebrates?: boolean
  receiptHref?: InternalHref
  receiptPrinter?: CheckoutReceiptPrinter
  refund?: { href: InternalHref; isUnclaimed: boolean }
  redirectUrl: HttpHref | ""
  cancelRedirect?: () => void
  children?: React.ReactNode
}

type StatusDisplayParams = {
  iconColor: string
  Icon: IconComponent
  title: MessageDescriptor
}

const FINAL_STATUS_DISPLAY_PARAMS: Record<CheckoutFinalStatus, StatusDisplayParams> = {
  complete: { iconColor: "text-success", Icon: CheckIcon, title: msg`Payment complete` },
  refunded: { iconColor: "text-warning", Icon: RotateCcwIcon, title: msg`Payment refunded` },
  expired: { iconColor: "text-muted-foreground", Icon: ClockIcon, title: msg`Invoice expired` },

  invalid: {
    iconColor: "text-destructive-foreground",
    Icon: XIcon,
    title: msg`This invoice has been marked as invalid`,
  },

  unknown: {
    iconColor: "text-muted-foreground",
    Icon: CircleQuestionMarkIcon,
    title: msg`Invoice status unavailable`,
  },
}

const ACTION_CLASS_NAME = "min-w-max grow basis-0"

const PageAction = ({
  href,
  variant,
  className,
  children,
}: {
  href: InternalHref
  variant: "default" | "outline"
  className?: string
  children: string
}) => {
  const { openPage } = useCheckoutAppConfig()

  if (openPage) {
    return (
      <Button variant={variant} className={className} onClick={() => openPage(href)}>
        {children}
      </Button>
    )
  } else
    return (
      <LinkButton href={href} variant={variant} className={className}>
        {children}
      </LinkButton>
    )
}

const ReceiptAction = ({
  href,
  printer,
  className,
}: {
  href: InternalHref
  printer?: CheckoutReceiptPrinter
  className?: string
}) => {
  const { t } = useLingui()

  if (printer?.target === "terminal") {
    return <PrintReceiptButton printer={printer} />
  } else
    return (
      <PageAction href={href} variant="outline" className={className}>
        {t`View Receipt`}
      </PageAction>
    )
}

export const StatusOverlay = ({
  status,
  exception,
  storeName,
  storeSupport,
  invoiceId,
  price,
  receivedAmount,
  celebrates = false,
  receiptHref,
  receiptPrinter,
  refund,
  redirectUrl,
  cancelRedirect,
  children,
}: StatusOverlayProps) => {
  const { t } = useLingui()
  const format = useAmountFormat()
  const { close } = useCheckoutAppConfig()
  const canOpenExternalLinks = useCanOpenExternalLinks()
  const canReturnToStore = Boolean(redirectUrl && canOpenExternalLinks)
  const isCountingDown = Boolean(cancelRedirect && canReturnToStore)
  const engagement = useRedirectEngagement(isCountingDown ? cancelRedirect : undefined)

  const storeLine =
    status === "complete" || status === "refunded" ? t`Paid to ${storeName}` : storeName

  useEffect(() => {
    if (!celebrates) return void null

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
  }, [celebrates])

  const config = FINAL_STATUS_DISPLAY_PARAMS[status]
  const { Icon } = config

  const title = exception?.kind === "failedConfirm" ? t`Payment failed to confirm` : t(config.title)

  const getExplanation = (): string | null => {
    if (exception?.kind === "failedConfirm") {
      return t`The transaction was dropped from the network before it confirmed. If the funds left your wallet, contact ${storeName}.`
    } else if (exception?.kind === "expiredPartiallyPaid") {
      const paid = format.crypto(exception.paid, exception.symbol)

      return t`You sent ${paid}, but not the full amount before the invoice expired. Contact ${storeName} about a refund.`
    } else if (status === "unknown") {
      return t`This invoice's status can't be shown here. Contact ${storeName} if you need help with it.`
    } else return null
  }

  const explanation = getExplanation()
  const contactSupport = explanation && canOpenExternalLinks ? storeSupport : null

  return (
    <div data-testid={CHECKOUT_STATUS_TESTID} className="px-8 py-12 text-center" {...engagement}>
      <div className={cn("size-16 mx-auto", config.iconColor)}>
        <Icon className="size-full" strokeWidth={1.5} />
      </div>

      <p className="mt-6 text-xl font-semibold">{title}</p>

      {explanation && (
        <p className="mt-2 text-sm text-muted-foreground text-balance">{explanation}</p>
      )}

      <p className="mt-4 text-sm font-medium">{storeLine}</p>

      <p className="mt-1 text-muted-foreground text-sm">
        {t`Invoice`} #{invoiceId}
      </p>

      {price !== null && <p className="mt-1 text-base font-semibold">{price}</p>}
      {receivedAmount && <p className="text-muted-foreground text-sm">{receivedAmount}</p>}

      <div className="mt-6 gap-3 max-w-sm mx-auto flex flex-wrap justify-center">
        {receiptHref && (
          <ReceiptAction
            href={receiptHref}
            printer={receiptPrinter}
            className={ACTION_CLASS_NAME}
          />
        )}

        {refund && (
          <PageAction
            href={refund.href}
            variant={refund.isUnclaimed ? "default" : "outline"}
            className={ACTION_CLASS_NAME}
          >
            {refund.isUnclaimed ? t`Claim refund` : t`View refund`}
          </PageAction>
        )}

        {contactSupport?.kind === "url" && (
          <LinkButton
            isExternalLink
            href={contactSupport.href}
            variant="outline"
            className={ACTION_CLASS_NAME}
          >
            {t`Contact store`}
          </LinkButton>
        )}

        {contactSupport?.kind === "email" && (
          <LinkButton href={contactSupport.href} variant="outline" className={ACTION_CLASS_NAME}>
            {t`Contact store`}
          </LinkButton>
        )}

        {redirectUrl && canReturnToStore && (
          <ReturnToStoreButton
            url={redirectUrl}
            isCountingDown={isCountingDown}
            className={ACTION_CLASS_NAME}
          />
        )}

        {close && !canReturnToStore && (
          <Button onClick={close} className={ACTION_CLASS_NAME}>
            {t`Close`}
          </Button>
        )}
      </div>

      {isCountingDown && <RedirectAnnouncement storeName={storeName} />}
      {receiptPrinter && <PrintReceiptFailure printer={receiptPrinter} />}

      <ExtensionSlot name="checkout:status-extra" className="mt-6" />
      {children}
    </div>
  )
}
