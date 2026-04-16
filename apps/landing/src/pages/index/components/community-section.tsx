import type { HttpHref } from "@bitcart/core/types"
import { LinkButton } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { Trans } from "@lingui/react/macro"
import { DiscordLogoIcon } from "@phosphor-icons/react/dist/csr/DiscordLogo"
import { GithubLogoIcon } from "@phosphor-icons/react/dist/csr/GithubLogo"
import { MatrixLogoIcon } from "@phosphor-icons/react/dist/csr/MatrixLogo"
import { RedditLogoIcon } from "@phosphor-icons/react/dist/csr/RedditLogo"
import { TelegramLogoIcon } from "@phosphor-icons/react/dist/csr/TelegramLogo"

export type CommunitySectionProps = {
  className?: string
}

const COMMUNITY_LINKS = [
  {
    Icon: TelegramLogoIcon,
    href: "https://t.me/bitcart" as HttpHref,
    label: "Telegram",
  },
  {
    Icon: GithubLogoIcon,
    href: "https://github.com/bitcart/bitcart" as HttpHref,
    label: "GitHub",
  },
  {
    Icon: DiscordLogoIcon,
    href: "https://discord.gg/8H2Sfdh" as HttpHref,
    label: "Discord",
  },
  {
    Icon: MatrixLogoIcon,
    href: "https://matrix.to/#/#bitcart:matrix.org" as HttpHref,
    label: "Matrix",
  },
  {
    Icon: RedditLogoIcon,
    href: "https://www.reddit.com/r/Bitcart" as HttpHref,
    label: "Reddit",
  },
]

export const CommunitySection: React.FC<CommunitySectionProps> = ({ className }) => {
  return (
    <section
      id="community"
      aria-labelledby="community-heading"
      className={cn("gap-6 flex flex-col", className)}
    >
      <h2 id="community-heading" className="text-4xl font-bold">
        <Trans>
          Join the <span className="text-accent-foreground">Community</span>
        </Trans>
      </h2>

      <p className="text-muted-foreground leading-relaxed">
        <Trans>
          Bitcart is an open-source project, not a company. We rely on a network of diverse
          contributors and users to provide support for numerous use-cases. Join us in improving,
          learning, and building Bitcart.
        </Trans>
      </p>

      <div className="gap-4 md:gap-4 grid grid-cols-2">
        {COMMUNITY_LINKS.map(({ Icon, href, label }, idx) => (
          <LinkButton
            key={href}
            href={href}
            isExternalLink
            variant="outline"
            size="xl"
            className={cn({
              "col-span-2": COMMUNITY_LINKS.length % 2 !== 0 && idx === COMMUNITY_LINKS.length - 1,
            })}
          >
            <Icon className="size-5" aria-hidden="true" />
            <span className="font-medium">{label}</span>
          </LinkButton>
        ))}
      </div>
    </section>
  )
}
