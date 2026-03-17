import { Badge, Button } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { Link } from "@bitcart/vike-kit/navigation"
import { Trans } from "@lingui/react/macro"

export type SupportersSectionProps = {
  data: {
    name: string
    logo: string
    logoClass?: string
    description: string
    website: string
    contribution: string
  }[]
}

export const SupportersSection: React.FC<SupportersSectionProps> = ({ data }) => {
  return (
    <section className="py-12 sm:py-20 bg-background">
      <div className="max-w-7xl px-4 md:px-6 lg:px-8 mx-auto">
        <div className="mb-12 sm:mb-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <Trans>Companies Supporting Bitcart</Trans>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            <Trans>
              These companies have supported Bitcart development and receive priority support. If
              you want to support Bitcart as a company, please{" "}
              <Button
                render={<Link href="mailto:company@bitcart.ai" />}
                nativeButton={false}
                variant="link"
                size="inline"
              >
                email us
              </Button>
              .
            </Trans>
          </p>
        </div>

        <div className="md:grid-cols-2 lg:grid-cols-3 gap-8 grid grid-cols-1">
          {data.map((company, index) => (
            <div
              key={index}
              className={`
                bg-card rounded-lg p-6
                sm:p-8
                elevation-3
                dark:bg-secondary
                flex h-full flex-col border transition-shadow duration-200
              `}
            >
              <div className="space-y-4 sm:space-y-6 flex grow flex-col text-center">
                <div
                  className={`
                    w-32 h-16 rounded-md p-2 bg-border mx-auto flex items-center justify-center
                  `}
                >
                  <img
                    src={company.logo}
                    alt={`${company.name} logo`}
                    className={cn("max-h-full max-w-full object-contain", company.logoClass)}
                  />
                </div>

                <h3 className="text-lg sm:text-xl font-bold">{company.name}</h3>

                <div className="h-12 flex items-center justify-center">
                  <p className="text-muted-foreground text-sm sm:text-base text-center">
                    {company.description}
                  </p>
                </div>

                <div className="gap-2 flex flex-wrap justify-center">
                  <Badge variant="accent" className="md:text-sm">
                    {company.contribution}
                  </Badge>
                </div>

                <div className="pt-4 sm:pt-6 gap-3 mt-auto flex flex-col">
                  <Button
                    render={<Link href={company.website} />}
                    nativeButton={false}
                    size="lg"
                    className="w-full text-center uppercase"
                  >
                    <Trans>Details</Trans>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
