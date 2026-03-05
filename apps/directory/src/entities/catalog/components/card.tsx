import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@bitcart/ui-kit/components"
import { Link } from "@bitcart/vike-kit/navigation"
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
        <CardTitle className="text-xl">{entry.name}</CardTitle>

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
              <BadgeCheck className="w-4 h-4" />
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
              <Button variant="outline" asChild>
                <Link untracked href={social_links.github}>
                  <GithubLogoIcon className="w-4 h-4" />
                  <span>{t`GitHub`}</span>
                </Link>
              </Button>
            )}

            {social_links.twitter && (
              <Button variant="outline" asChild>
                <Link
                  untracked
                  href={
                    social_links.twitter.startsWith("@")
                      ? `https://twitter.com/${social_links.twitter.slice(1)}`
                      : social_links.twitter
                  }
                >
                  <XLogoIcon className="w-4 h-4" />
                  <span>{t`Twitter`}</span>
                </Link>
              </Button>
            )}
          </div>
        )}

        <Button asChild className="w-full">
          <Link untracked href={entry.url}>
            <ExternalLink className="w-4 h-4" />
            <span>{t`Visit Site`}</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
