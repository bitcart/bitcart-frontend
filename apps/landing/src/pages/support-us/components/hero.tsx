import { Button } from "@bitcart/ui-kit/components"
import { Link } from "@bitcart/vike-kit/navigation"
import { Trans, useLingui } from "@lingui/react/macro"
import { ArrowRight, Mail } from "lucide-react"

export const Hero = () => {
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
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6">
          <Trans>
            Support <span className="text-accent-foreground">Bitcart</span> as a Company
          </Trans>
        </h1>

        <p
          className={`
            text-lg
            sm:text-xl
            text-muted-foreground mb-6
            sm:mb-8
            max-w-3xl leading-relaxed mx-auto
          `}
        >
          <Trans>
            Join leading companies in supporting the future of decentralized cryptocurrency
            payments. Help us build better open-source financial infrastructure.
          </Trans>
        </p>

        <div className="sm:flex-row gap-4 flex flex-col justify-center">
          <Button
            render={<Link href="mailto:company@bitcart.ai" />}
            nativeButton={false}
            expandOnHover
            size="xl"
            className="group elevation-3 sm:w-auto w-full"
          >
            <Mail />
            <span>{t`Contact Us`}</span>
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Button>

          <Button
            render={
              <Link
                href="https://docs.bitcart.ai/support-and-community/support#paid-support"
                target="_blank"
              />
            }
            nativeButton={false}
            expandOnHover
            size="xl"
            variant="outline"
            className={`
              group
              sm:w-auto
              text-accent-foreground bg-background border-accent-foreground w-full
            `}
          >
            <span>{t`Learn More`}</span>
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  )
}
