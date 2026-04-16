import type { HttpHref, InternalHref } from "@bitcart/core/types"

import { Button } from "../atoms/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../atoms/card"
import { LinkButton } from "../atoms/link-button"

export type FeatureGalleryItem = {
  title: string
  icon: React.ReactNode
  description: string

  actions?: ({
    label: string
  } & (
    | ({ href: InternalHref; isExternalLink?: false } | { href: HttpHref; isExternalLink: true })
    | { callback: VoidFunction }
  ))[]
}

export type FeatureGalleryProps = {
  items: FeatureGalleryItem[]
}

export const FeatureGallery: React.FC<FeatureGalleryProps> = ({ items }) => {
  return (
    <div className="md:grid-cols-2 lg:grid-cols-3 gap-8 grid grid-cols-1">
      {items.map(({ title, icon, description, actions }) => (
        <Card key={title + description} className="elevation-3 py-8 gap-4 transition-shadow">
          <CardHeader className="gap-4 px-8 flex flex-col items-center text-center">
            <div className="p-4 bg-accent rounded-full">{icon}</div>
            <CardTitle className="text-lg leading-tight">{title}</CardTitle>
          </CardHeader>

          <CardContent className="gap-4 px-8 flex flex-col items-center">
            <p className="leading-relaxed text-muted-foreground text-center">{description}</p>
          </CardContent>

          <CardFooter className="px-8 pt-4">
            <div className="gap-3 flex w-full flex-col">
              {actions?.map((action) => {
                if ("callback" in action) {
                  return (
                    <Button key={action.label} onClick={action.callback}>
                      {action.label}
                    </Button>
                  )
                } else {
                  const a11yAwareLinkProps = action.isExternalLink
                    ? { href: action.href, isExternalLink: true as const }
                    : { href: action.href, isExternalLink: false as const }

                  return (
                    <LinkButton key={action.label} {...a11yAwareLinkProps}>
                      {action.label}
                    </LinkButton>
                  )
                }
              })}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
