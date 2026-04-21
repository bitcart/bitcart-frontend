import { cn } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react/macro"
import { Coins } from "lucide-react"

export const AdditionalInfoSection: React.FC = () => {
  const { t } = useLingui()

  return (
    <section
      aria-label={t`Additional information`}
      className="py-8 sm:py-12 border-border dark:border-background border-b"
    >
      <div className="max-w-4xl px-4 md:px-6 lg:px-8 mx-auto text-center">
        <div
          className={cn(`
            from-blue-50 to-indigo-50 rounded-lg p-6
            sm:p-8
            dark:from-blue-900/20 dark:to-indigo-900/20
            bg-linear-to-r
          `)}
        >
          <div className="mb-4 flex items-center justify-center">
            <div className="p-3 bg-accent rounded-full">
              <Coins className="size-6 text-accent-foreground" />
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-bold mb-3">
            {t`Support for Any Compatible Token`}
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground mb-4 leading-relaxed">
            {t`The tokens shown above are just examples. Bitcart supports any token that follows standard interfaces:`}
          </p>

          <div
            className={cn(`
              gap-2
              sm:gap-3
              text-xs
              sm:text-sm
              max-w-5xl mx-auto flex flex-wrap justify-center
            `)}
          >
            {[
              "ERC-20 (Ethereum)",
              "BEP-20 (BSC)",
              "TRC-20 (Tron)",
              "ERC-20 (POL)",
              "CashToken (BCH)",
              `+ ${t`More`}`,
            ].map((content) => (
              <span
                key={content}
                className={cn(`
                  px-3 py-1 font-medium border-muted bg-background text-muted-foreground
                  rounded-full border
                `)}
              >
                {content}
              </span>
            ))}
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground mt-4">
            {t`Simply enter any compatible token's contract address to accept payments in that token.`}
          </p>
        </div>
      </div>
    </section>
  )
}
