import type { InternalHref } from "@bitcart/core/types"
import { t } from "@lingui/core/macro"
import { useMemo } from "react"
import { prop, sortBy } from "remeda"

import type { BasicLinkComponent, LayoutBrandAttributes, LayoutNavigationConfig } from "@/types"
import { getTargetBlankA11yHint } from "@/utils"

export type WebsiteFooterProps = {
  brandAttributes: LayoutBrandAttributes
  homepageHref?: InternalHref
  navigationDirectory: LayoutNavigationConfig["directory"]
  LinkComponent: BasicLinkComponent
}

export const WebsiteFooter: React.FC<WebsiteFooterProps> = ({
  LinkComponent: Link,
  brandAttributes: brand,
  homepageHref = "/",
  navigationDirectory,
}) => {
  const copyrightText = useMemo(
    () =>
      `© ${
        brand.copyrightSinceYear ? `${brand.copyrightSinceYear} — ` : ""
      }${new Date().getFullYear()} ${brand.name}. ${
        brand.copyrightAppendix ?? t`All rights reserved.`
      }`,

    [brand.copyrightAppendix, brand.copyrightSinceYear, brand.name],
  )

  const iconLinks = useMemo(
    () =>
      navigationDirectory.iconLinks &&
      sortBy(navigationDirectory.iconLinks.flatMap(prop("items")), (link) =>
        "globalPriority" in link ? link.globalPriority : Number.POSITIVE_INFINITY,
      ).map(({ icon: Icon, ...link }) => {
        const a11yAwareProps = link.isExternal
          ? { href: link.href, a11yHint: getTargetBlankA11yHint() }
          : { href: link.href }

        return (
          <Link
            key={link.hint + link.href}
            title={link.hint}
            className="text-muted-foreground hover:text-accent-foreground transition-colors"
            aria-label={link.hint}
            {...a11yAwareProps}
          >
            <Icon className="size-5" aria-hidden="true" />
          </Link>
        )
      }),

    [Link, navigationDirectory.iconLinks],
  )

  return (
    <footer className="border-muted dark:border-border border-t">
      <div className="max-w-7xl px-4 md:px-6 lg:px-8 py-12 mx-auto">
        <div className="gap-15 lg:gap-8 lg:flex-row flex flex-col">
          <div className="max-w-112 flex w-full flex-col">
            <Link href={homepageHref} className="space-x-3 mb-4 flex items-center">
              <img alt={brand.logoImageAltText} src={brand.logoImageSrc} className="size-8" />
              <span className="text-xl font-bold">{brand.projectCanonicalName}</span>
            </Link>

            {brand.tagline && (
              <p className="text-muted-foreground mb-4 max-w-md">{brand.tagline}</p>
            )}

            <div className="gap-4 flex">{iconLinks}</div>
          </div>

          <div className="gap-20 lg:gap-8 lg:justify-around flex w-full flex-wrap justify-start">
            {navigationDirectory.labeledLinks.map((group, idx) => (
              <div key={idx + group.groupTitle} className="gap-4 flex flex-col">
                <h3 className="text-sm font-semibold tracking-wider uppercase">
                  {group.groupTitle}
                </h3>

                <ul className="gap-3 flex flex-col">
                  {sortBy(group.items, (link) =>
                    "globalPriority" in link ? link.globalPriority : Number.POSITIVE_INFINITY,
                  ).map((link) => {
                    const a11yAwareProps = link.isExternal
                      ? { href: link.href, a11yHint: getTargetBlankA11yHint() }
                      : { href: link.href }

                    return (
                      <li key={link.label + link.href}>
                        <Link
                          className={`
                            text-muted-foreground
                            hover:text-accent-foreground
                            transition-colors
                          `}
                          aria-label={link.hint ?? link.label}
                          {...a11yAwareProps}
                        >
                          {link.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-8 border-border border-t">
          <p className="text-muted-foreground text-sm text-center">{copyrightText}</p>
        </div>
      </div>
    </footer>
  )
}
