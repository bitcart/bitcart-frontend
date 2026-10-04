import { CHECKOUT_RECOMMENDED_FEE_TESTID } from "@bitcart/qa"
import { t } from "@lingui/core/macro"

import { useCheckout } from "../hooks"

export const RecommendedFee = ({ className }: { className?: string }) => {
  const { recommendedFee } = useCheckout("payment").payment

  return (
    recommendedFee !== null && (
      <p className={className} data-testid={CHECKOUT_RECOMMENDED_FEE_TESTID}>
        {t`Recommended fee: ${recommendedFee} sat/byte`}
      </p>
    )
  )
}
