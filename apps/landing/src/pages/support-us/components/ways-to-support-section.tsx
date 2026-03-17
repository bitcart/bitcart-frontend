import { Trans } from "@lingui/react/macro"

export type WaysToSupportSectionProps = {
  data: {
    title: string
    description: string
    examples: string[]
  }[]
}

export const WaysToSupportSection: React.FC<WaysToSupportSectionProps> = ({ data }) => {
  return (
    <section className="py-12 sm:py-20 bg-background">
      <div className="max-w-7xl px-4 md:px-6 lg:px-8 mx-auto">
        <div className="mb-12 sm:mb-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <Trans>Ways to Support</Trans>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            <Trans>
              There are multiple ways your company can support Bitcart development and growth.
            </Trans>
          </p>
        </div>

        <div className="md:grid-cols-2 gap-6 sm:gap-8 grid grid-cols-1">
          {data.map((type, index) => (
            <div
              key={index}
              className={`
                bg-card rounded-lg p-6
                sm:p-8
                elevation-3
                dark:bg-secondary
                border transition-shadow duration-200
              `}
            >
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{type.title}</h3>

              <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
                {type.description}
              </p>

              <div className="space-y-2">
                <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
                  <Trans>Examples:</Trans>
                </h4>

                <ul className="space-y-2">
                  {type.examples.map((example, exampleIndex) => (
                    <li
                      key={exampleIndex}
                      className="text-muted-foreground text-sm sm:text-base flex items-center"
                    >
                      <div
                        className={`
                          size-2 bg-primary mr-3
                          dark:bg-accent-foreground
                          shrink-0 rounded-full
                        `}
                      />

                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
