import { cn } from "@bitcart/ui-kit/utils"
import { t } from "@lingui/core/macro"
import { QRCodeSVG } from "qrcode.react"

import { useCheckout } from "../hooks"

export const PaymentQr = ({ size = 200, className }: { size?: number; className?: string }) => {
  const { payment } = useCheckout("payment")

  return (
    <div
      role="img"
      aria-label={t`Payment QR code`}

      //! The QR quiet zone must stay white in both themes: scanners need the contrast.
      className={cn("rounded-2xl border-border bg-white p-4 shadow-sm w-fit border", className)}
    >
      <QRCodeSVG value={payment.paymentUrl ?? payment.address} size={size} level="M" aria-hidden />
    </div>
  )
}
