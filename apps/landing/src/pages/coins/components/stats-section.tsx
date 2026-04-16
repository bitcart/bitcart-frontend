import { useLingui } from "@lingui/react/macro"

import { bitcartHooks } from "@/common/data/bitcart"

export type StatsSectionProps = {}

export const StatsSection: React.FC<StatsSectionProps> = () => {
  const { t } = useLingui()

  const {
    data: { totalCounts },
  } = bitcartHooks.useAssetCatalog()

  return (
    <section aria-label={t`Statistics`} className="py-8 sm:py-12 bg-background">
      <div className="max-w-7xl px-4 md:px-6 lg:px-8 mx-auto">
        <div className="sm:grid-cols-3 gap-6 sm:gap-8 grid grid-cols-1 text-center">
          <div className="space-y-2">
            <div className="text-2xl sm:text-3xl font-bold text-accent-foreground">
              {totalCounts.blockchains}
            </div>

            <div className="text-muted-foreground text-sm sm:text-base">
              {t`Supported Blockchains`}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-2xl sm:text-3xl font-bold text-accent-foreground">
              {totalCounts.fungibleTokens}+
            </div>

            <div className="text-muted-foreground text-sm sm:text-base">{t`Supported Tokens`}</div>
          </div>

          <div className="space-y-2">
            <div className="text-2xl sm:text-3xl font-bold text-accent-foreground">0%</div>
            <div className="text-muted-foreground text-sm sm:text-base">{t`Transaction Fees`}</div>
          </div>
        </div>
      </div>
    </section>
  )
}
