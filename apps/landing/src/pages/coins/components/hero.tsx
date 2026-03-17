import { SearchField } from "@bitcart/ui-kit/components"
import { Trans, useLingui } from "@lingui/react/macro"
import { Coins } from "lucide-react"

export type HeroProps = {
  searchTerm: string
  setSearchTerm: (searchTerm: string) => void
}

export const Hero: React.FC<HeroProps> = ({ searchTerm, setSearchTerm }) => {
  const { t } = useLingui()

  return (
    <section
      className={`
        py-12
        sm:py-20
        from-purple-50 via-white to-purple-100
        dark:from-gray-900 dark:via-gray-900 dark:to-gray-800
        bg-linear-to-br
      `}
    >
      <div className="max-w-7xl px-4 md:px-6 lg:px-8 mx-auto text-center">
        <div className="mb-4 sm:mb-6 flex items-center justify-center">
          <div className="p-3 sm:p-4 bg-accent rounded-full">
            <Coins className="size-8 sm:size-10 md:size-12 text-accent-foreground" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
          <Trans>
            Supported <br className="sm:hidden" />
            <span className="text-accent-foreground wrap-break-word">Cryptocurrencies</span>
          </Trans>
        </h1>

        <p
          className={`
            text-base
            sm:text-xl
            text-muted-foreground mb-6
            sm:mb-8
            max-w-3xl leading-relaxed mx-auto
          `}
        >
          {t`Accept payments in any of these cryptocurrencies and tokens with zero fees and complete control over your funds. Plus any ERC-20, BEP-20, TRC-20 or CashToken compatible token by contract address.`}
        </p>

        <div className="max-w-md relative mx-auto">
          <SearchField
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={t`Search currencies and tokens...`}
            className="dark:bg-secondary"
          />
        </div>
      </div>
    </section>
  )
}
