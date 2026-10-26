import { CHECKOUT_PAYMENT_ADDRESS_TESTID } from "@bitcart/qa"
import {
  Button,
  ResponsiveDialog,
  ResponsiveDialogHeader,
  ResponsiveDialogPanel,
  ResponsiveDialogPopup,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react/macro"
import { QrCodeIcon } from "lucide-react"

import { useCheckoutCopyStatus, type CheckoutCopy } from "../copy-status"
import { useCheckout } from "../hooks"
import { CopyableValue, MarkedValue } from "./copyable-value"
import { PaymentQr } from "./payment-qr"

const INVOICE_VISIBLE_END = 12

const shortenInvoice = (invoice: string) =>
  `${invoice.slice(0, INVOICE_VISIBLE_END)}…${invoice.slice(-INVOICE_VISIBLE_END)}`

const PhoneQrSheet = () => {
  const { t } = useLingui()

  return (
    <ResponsiveDialog>
      <ResponsiveDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t`Show QR code`}
            className="text-muted-foreground sm:hidden"
          />
        }
      >
        <QrCodeIcon className="size-4" />
      </ResponsiveDialogTrigger>

      <ResponsiveDialogPopup>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{t`QR code`}</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogPanel>
          <div className="pb-4 flex justify-center">
            <PaymentQr className="max-w-80 w-full [&_svg]:h-auto [&_svg]:w-full" />
          </div>
        </ResponsiveDialogPanel>
      </ResponsiveDialogPopup>
    </ResponsiveDialog>
  )
}

export const PaymentAddress = ({
  copy,
  isStartAlignedFromSm = false,
  className,
}: {
  copy?: CheckoutCopy
  isStartAlignedFromSm?: boolean
  className?: string
}) => {
  const { t } = useLingui()
  const { payment, environment } = useCheckout("payment")
  const ownCopy = useCheckoutCopyStatus()
  const display = payment.lightning ? shortenInvoice(payment.address) : payment.address

  if (environment.terminal) {
    return (
      <p
        data-testid={CHECKOUT_PAYMENT_ADDRESS_TESTID}
        className={cn("text-sm font-mono text-center text-balance break-all", className)}
      >
        <MarkedValue value={display} isMarked={!payment.lightning} />
      </p>
    )
  } else
    return (
      <div className={className}>
        <CopyableValue
          target="address"
          label={payment.lightning ? t`Lightning invoice` : t`Address`}
          value={payment.address}
          display={display}
          copy={copy ?? ownCopy}
          isMarked={!payment.lightning}
          isStartAlignedFromSm={isStartAlignedFromSm}
          testId={CHECKOUT_PAYMENT_ADDRESS_TESTID}
        >
          <PhoneQrSheet />
        </CopyableValue>
      </div>
    )
}
