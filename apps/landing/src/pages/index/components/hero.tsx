import { Button } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { Link } from "@bitcart/vike-kit/navigation"
import { Trans, useLingui } from "@lingui/react/macro"
import { ArrowRight, Coins, Rocket, Shield, Zap } from "lucide-react"

import { Announcement } from "./announcement"

const FEATURE_HIGHLIGHT_CONTAINER_CLASS = `gap-2 md:gap-3 p-3 md:p-4 backdrop-blur-xs rounded-lg
border-primary/50 bg-secondary/60 flex items-center justify-center border-2`

export const Hero = () => {
  const { t } = useLingui()

  return (
    <section
      className={`
        from-purple-50 via-white to-purple-100 pt-16 pb-8
        md:pb-16
        dark:from-gray-900 dark:via-gray-900 dark:to-gray-800
        relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br
      `}
      style={{ paddingTop: "80px" }}
    >
      {/* Background decoration */}
      <div className="inset-0 absolute overflow-hidden">
        <div
          className={`
            -top-40 -right-40 w-80 h-80 from-purple-400/20 to-purple-500/20 blur-3xl absolute
            rounded-full bg-linear-to-r
          `}
        ></div>

        <div
          className={`
            -bottom-40 -left-40 w-80 h-80 from-purple-500/20 to-purple-400/20 blur-3xl absolute
            rounded-full bg-linear-to-r
          `}
        ></div>
      </div>

      <div className="max-w-7xl px-4 md:px-6 lg:px-8 relative mx-auto w-full text-center">
        <Announcement className="mb-8 md:mb-12" />

        <h1 className="text-6xl md:text-7xl xl:text-8xl font-bold mb-4 md:mb-6">
          <span
            className={`
              from-gray-900 via-purple-800 to-primary/80
              dark:from-white dark:via-purple-400 dark:to-purple-300
              bg-linear-to-r bg-clip-text text-transparent
            `}
          >
            Bitcart
          </span>
        </h1>

        <p
          className={`
            text-lg
            md:text-xl
            lg:text-2xl
            text-muted-foreground mb-3
            md:mb-4
            max-w-4xl leading-relaxed px-2 px-4 mx-auto
          `}
        >
          <Trans>
            Start Accepting Crypto Payments With{" "}
            <span className="font-semibold text-accent-foreground text-nowrap">0% Fees</span> &{" "}
            <span className="font-semibold text-accent-foreground text-nowrap">No Third-party</span>
          </Trans>
        </p>

        <div className="gap-6 md:gap-8 mb-6 sm:mb-10 md:mb-12 flex flex-col">
          <p className="md:text-lg max-w-3xl px-2 md:px-4 text-muted-foreground mx-auto">
            {t`Self-hosted, open-source cryptocurrency payment processor. Secure, private, censorship-resistant and free.`}
          </p>

          <p className="text-muted-foreground md:text-lg max-w-3xl px-2 md:px-4 mx-auto">
            <Trans>
              💰 Accept payments in{" "}
              <Link
                href="/coins"
                className={`
                  font-bold decoration-primary/50 px-1 py-0.5 rounded-xs -mx-1 -my-0.5
                  text-accent-foreground
                  hover:text-accent-foreground hover:decoration-primary hover:shadow-lg
                  hover:bg-accent
                  dark:hover:text-foreground
                  underline transition-all duration-200
                `}
              >
                50+ cryptocurrencies including Bitcoin, Ethereum, Tron, Monero & any other popular
                coin
              </Link>{" "}
              — No fees, no middleman, YOUR coins!
            </Trans>
          </p>
        </div>

        <div
          className={`
            gap-4 mb-6
            sm:mb-10
            md:mb-12
            max-sm:flex-col
            flex flex-row items-center justify-center
          `}
        >
          <Button
            asChild
            expandOnHover
            size="xl"
            className={`
              group elevation-3 bg-initial from-primary to-primary/80
              hover:bg-initial hover:from-primary/80 hover:to-purple-800
              max-sm:w-full
              bg-linear-to-r
            `}
          >
            <Link href="https://admin.bitcart.ai">
              <span>{t`Live Demo`}</span>

              <ArrowRight
                className={"w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform"}
              />
            </Link>
          </Button>

          <Button
            asChild
            expandOnHover
            size="xl"
            variant="outline"
            className={`
              group
              max-sm:w-full
              text-accent-foreground bg-background border-accent-foreground
            `}
          >
            <Link href="https://docs.bitcart.ai">
              <span>{t`View User Guide`}</span>

              <ArrowRight
                className={"w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform"}
              />
            </Link>
          </Button>
        </div>

        {/* Feature highlights */}
        <div className="lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl md:px-4 mx-auto grid grid-cols-2">
          {[
            { id: 1, Icon: Shield, title: t`Non-custodial` },
            { id: 2, Icon: Zap, title: t`Zero Fees` },
            { id: 3, Icon: Rocket, title: t`Self-hosted` },
          ].map(({ id, Icon, title }) => (
            <div key={id} className={FEATURE_HIGHLIGHT_CONTAINER_CLASS}>
              <Icon className="w-5 h-5 md:w-8 md:h-8 text-accent-foreground shrink-0" />

              <span
                className={`font-medium text-secondary-foreground text-xs sm:text-sm md:text-base`}
              >
                {title}
              </span>
            </div>
          ))}

          <Link
            href="/coins"
            className={cn(
              `
                group
                hover:bg-secondary/80 hover:border-accent-foreground
                transition-all duration-200
              `,

              FEATURE_HIGHLIGHT_CONTAINER_CLASS,
            )}
          >
            <Coins
              className={`
                w-5 h-5
                md:w-8 md:h-8
                text-accent-foreground shrink-0 transition-transform
                group-hover:scale-110
              `}
            />

            <span
              className={`
                font-medium text-secondary-foreground text-xs
                sm:text-sm
                md:text-base
                group-hover:text-accent-foreground
                transition-colors
              `}
            >
              {`50+ ${t`Coins`}`}
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
