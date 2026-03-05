import { Button } from "@bitcart/ui-kit/components"
import { Link } from "@bitcart/vike-kit/navigation"
import { Trans, useLingui } from "@lingui/react/macro"
import { ExternalLink } from "lucide-react"

export type AnnouncementProps = {
  className?: string
}

export const Announcement: React.FC<AnnouncementProps> = ({ className }) => {
  const { t } = useLingui()

  return (
    <div className={className}>
      <div
        className={`
          gap-3 from-purple-500 to-primary text-white px-4
          md:px-6
          py-2 elevation-3 mb-4 inline-flex transform cursor-default items-center rounded-full
          bg-linear-to-r transition-transform duration-200
          hover:scale-105
        `}
      >
        <div className="gap-2 flex items-center">
          <span className="text-base md:text-xl">🎉</span>

          <span className="font-bold text-sm md:text-base">{t`ETH Payments Plugin Released!`}</span>

          <span
            className={`
              px-1.5
              md:px-2
              py-0.5 bg-white/20 text-xs font-bold animate-pulse rounded-full
            `}
          >
            {t`NEW`}
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <p className="text-sm md:text-base mb-3 md:mb-4 leading-relaxed text-muted-foreground">
          <Trans>
            <span>Accept payments in </span>
            <strong className="text-accent-foreground">ETH, TRX, BNB, MATIC</strong>
            <span> and stablecoins like </span>
            <strong className="text-accent-foreground">USDT, USDC</strong>
            <span> - without address prompt, non-custodially and saving on fees!</span>
          </Trans>
        </p>

        <div className="md:flex-row gap-2 md:gap-3 flex flex-col items-center justify-center">
          <span className="text-xs md:text-sm text-accent-foreground font-medium">
            {t`Available in Admin Panel → Plugins`}
          </span>

          <div className="gap-2 flex">
            {[
              { label: t`User Guide`, href: "https://docs.bitcart.ai/guides/eth-payments-plugin" },
              { label: t`Announcement`, href: "https://t.me/bitcart/63625" },
            ].map(({ label, href }) => (
              <Button
                key={href}
                asChild
                expandOnHover
                size="sm"
                className="font-semibold transform duration-200"
              >
                <Link href={href}>
                  <ExternalLink className="w-3 h-3" />
                  <span>{label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
