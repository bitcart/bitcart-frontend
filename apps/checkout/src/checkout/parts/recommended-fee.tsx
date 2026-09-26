import { t } from "@lingui/core/macro"

import { useCheckout } from "../hooks"

export const RecommendedFee = ({ className }: { className?: string }) => {
  const { recommendedFee } = useCheckout("payment").payment

  return (
    recommendedFee !== null && (
      <p className={className}>{t`Recommended fee: ${recommendedFee} sat/byte`}</p>
    )
  )
}
