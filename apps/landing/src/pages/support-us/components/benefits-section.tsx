import { Trans } from "@lingui/react/macro"

export type BenefitsSectionProps = {
  data: {
    icon: React.ReactNode
    title: string
    description: string
  }[]
}

export const BenefitsSection: React.FC<BenefitsSectionProps> = ({ data }) => {
  return (
    <section className="py-12 sm:py-20 bg-secondary">
      <div className="max-w-7xl px-4 md:px-6 lg:px-8 mx-auto">
        <div className="mb-12 sm:mb-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <Trans>Why Support Bitcart?</Trans>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            <Trans>
              Supporting Bitcart provides tangible benefits for your company while contributing to
              the open-source ecosystem.
            </Trans>
          </p>
        </div>

        <div className="md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 grid grid-cols-1">
          {data.map((benefit, index) => (
            <div
              key={index}
              className={`
                bg-card rounded-lg p-4
                sm:p-6
                elevation-3 text-center transition-shadow duration-200
              `}
            >
              <div className="p-3 sm:p-4 bg-accent mb-3 sm:mb-4 mx-auto w-fit rounded-full">
                {benefit.icon}
              </div>

              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">{benefit.title}</h3>
              <p className="text-muted-foreground text-sm sm:text-base">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
