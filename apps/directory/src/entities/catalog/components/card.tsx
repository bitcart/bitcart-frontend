import {
  Badge,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  LinkButton,
} from "@bitcart/ui-kit/components"
import { useLingui } from "@lingui/react/macro"
import { GithubLogoIcon } from "@phosphor-icons/react/dist/csr/GithubLogo"
import { XLogoIcon } from "@phosphor-icons/react/dist/csr/XLogo"
import { BadgeCheck, ExternalLink } from "lucide-react"
import { keys } from "remeda"

import type { DirectoryEntry } from "@/common/data/bitcart/directory"

import { CatalogEntryBadge } from "./badge"

export type CatalogEntryCardProps = {
  data: DirectoryEntry
}

export const CatalogEntryCard: React.FC<CatalogEntryCardProps> = ({
  data: { social_links, ...entry },
}) => {
  const { t } = useLingui()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          <h3>{entry.name}</h3>
        </CardTitle>

        <div className="gap-2 mt-1 flex flex-wrap">
          <CatalogEntryBadge variant={entry.category}>
            {entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}
          </CatalogEntryBadge>

          {entry.subcategory && (
            <Badge variant="outline">
              {entry.subcategory.charAt(0).toUpperCase() + entry.subcategory.slice(1)}
            </Badge>
          )}

          {entry.is_sponsor && (
            <CatalogEntryBadge variant="sponsor">{t`Sponsor`}</CatalogEntryBadge>
          )}

          {entry.is_official && (
            <CatalogEntryBadge variant="official">
              <BadgeCheck className="size-4" />
              {t`Official`}
            </CatalogEntryBadge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-muted-foreground leading-relaxed">{entry.description}</p>
      </CardContent>

      <CardFooter className="gap-6 mt-a flex-col">
        {social_links && keys(social_links).length > 0 && (
          <div className={`gap-3 flex w-full flex-wrap justify-center`}>
            {social_links.github && (
              <LinkButton
                href={social_links.github}
                isExternalLink
                variant="outline"
                aria-label={t`${entry.name} GitHub`}
              >
                <GithubLogoIcon aria-hidden="true" />
                <span>{t`GitHub`}</span>
              </LinkButton>
            )}

            {social_links.twitter && (
              <LinkButton
                href={
                  social_links.twitter.startsWith("@")
                    ? `https://twitter.com/${social_links.twitter.slice(1)}`
                    : social_links.twitter
                }
                isExternalLink
                variant="outline"
                aria-label={t`${entry.name} on Twitter`}
              >
                <XLogoIcon aria-hidden="true" />
                <span>{t`Twitter`}</span>
              </LinkButton>
            )}
          </div>
        )}

        <LinkButton
          isExternalLink
          href={entry.url}
          className="w-full"
          aria-label={t`Visit ${entry.name}`}
        >
          <ExternalLink aria-hidden="true" />
          <span>{t`Visit Site`}</span>
        </LinkButton>
      </CardFooter>
    </Card>
  )
}
