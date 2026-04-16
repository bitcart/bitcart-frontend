import { LinkButton } from "@bitcart/ui-kit/components"
import { Trans } from "@lingui/react/macro"
import { ArrowRight, Mail } from "lucide-react"

export const CtaSection = () => {
  return (
    <section
      aria-labelledby="support-cta-heading"
      className="py-12 sm:py-20 from-primary to-primary/80 bg-linear-to-r"
    >
      <div className="max-w-4xl px-4 md:px-6 lg:px-8 mx-auto text-center">
        <h2
          id="support-cta-heading"
          className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4 sm:mb-6"
        >
          <Trans>Ready to Support Bitcart?</Trans>
        </h2>

        <p className="text-lg sm:text-xl text-purple-100 mb-6 sm:mb-8 leading-relaxed">
          <Trans>
            Join the companies already supporting the future of decentralized payments. Let&apos;s
            discuss how we can work together.
          </Trans>
        </p>

        <div className="sm:flex-row gap-4 flex flex-col justify-center">
          <LinkButton
            href="mailto:company@bitcart.ai"
            expandOnHover
            size="xl"
            variant="white"
            className="group elevation-3"
          >
            <Mail />

            <span>
              <Trans>Email Us:</Trans> company@bitcart.ai
            </span>

            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </LinkButton>
        </div>

        <p className="text-purple-100 mt-4 sm:mt-6 text-xs sm:text-sm">
          <Trans>
            We&apos;ll get back to you within 24 hours to discuss partnership opportunities.
          </Trans>
        </p>
      </div>
    </section>
  )
}
