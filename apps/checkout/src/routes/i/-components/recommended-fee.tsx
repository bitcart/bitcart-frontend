import { t } from "@lingui/core/macro"

type RecommendedFeeProps = {
  fee: number
}

export const RecommendedFee = ({ fee }: RecommendedFeeProps) => {
  return (
    <div className="px-4 pb-2 text-muted-foreground text-sm text-center">
      {t`Recommended fee`}: {fee} sat/byte
    </div>
  )
}
