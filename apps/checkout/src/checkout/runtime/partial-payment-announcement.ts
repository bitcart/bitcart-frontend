import { toast } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react/macro"
import { useEffect, useRef } from "react"

import { useAmountFormat } from "../amount-format"
import { useCheckout } from "../hooks"

/**
 * Announces each partial payment that arrives while the checkout is open.
 */
export const usePartialPaymentAnnouncement = (): void => {
  const { t } = useLingui()
  const model = useCheckout()
  const format = useAmountFormat()
  const payment = model.phase === "payment" ? model.payment : null
  const paidAmount = payment?.partial?.paid ?? null
  const lastPaidAmountRef = useRef(paidAmount)

  const announcement =
    payment &&
    t`Partial payment received. Please send the remaining ${format.crypto(payment.amount, payment.symbol)}.`

  useEffect(() => {
    if (paidAmount !== null && paidAmount !== lastPaidAmountRef.current && announcement) {
      toast.info(announcement)
    }

    lastPaidAmountRef.current = paidAmount
  }, [announcement, paidAmount])
}
