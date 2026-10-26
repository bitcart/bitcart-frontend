import { CHECKOUT_PAYMENT_QR_TESTID } from "@bitcart/qa"
import { cn } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react/macro"
import { QRCodeSVG } from "qrcode.react"

import { useCheckout } from "../hooks"

export const PaymentQr = ({ className }: { className?: string }) => {
  const { t } = useLingui()
  const { payment, environment } = useCheckout("payment")

  return (
    <div
      role="img"
      aria-label={t`Payment QR code`}
      data-testid={CHECKOUT_PAYMENT_QR_TESTID}

      //! The QR quiet zone must stay white in both themes: scanners need the contrast.
      className={cn(
        "rounded-2xl border-border bg-white p-4 shadow-sm border",
        environment.terminal ? "w-full" : "w-fit",
        className,
      )}
    >
      <QRCodeSVG
        value={payment.qrValue}
        level="M"
        aria-hidden
        className={environment.terminal ? "h-auto w-full" : "sm:size-[200px] size-[150px]"}
      />
    </div>
  )
}
