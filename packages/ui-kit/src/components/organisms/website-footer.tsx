import { t } from "@lingui/core/macro"
import { useMemo } from "react"
import { prop, sortBy } from "remeda"

import { useLayoutContext } from "@/hooks"
import { cn, getLayoutRegionNavigationDirectory, getTargetBlankA11yHint } from "@/utils"

export type WebsiteFooterProps = {
  classNames?: { root?: string }
}

export const WebsiteFooter: React.FC<WebsiteFooterProps> = ({ classNames }) => {
  const {
    Link,
    layoutConfig: { brand, navigation },
  } = useLayoutContext()

  /**
   * All navigation groups containing only the links relevant for this component.
   */
  const navDirectory = useMemo(
    () => getLayoutRegionNavigationDirectory("footer", navigation.directory),
    [navigation.directory],
  )

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
      navDirectory.iconLinks &&
      sortBy(navDirectory.iconLinks.flatMap(prop("items")), (link) =>
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

    [Link, navDirectory.iconLinks],
  )

  return (
    <footer className={cn("border-muted dark:border-border border-t", classNames?.root)}>
      <div className="max-w-7xl px-4 md:px-6 lg:px-8 py-12 mx-auto">
        <div className="gap-15 lg:gap-8 lg:flex-row flex flex-col">
          <div className="max-w-112 flex w-full flex-col">
            <Link href={navigation.rootRoutePathname} className="space-x-3 mb-4 flex items-center">
              <img alt={brand.logoImageAltText} src={brand.logoImageSrc} className="size-8" />
              <span className="text-xl font-bold">{brand.projectCanonicalName}</span>
            </Link>

            {brand.tagline && (
              <p className="text-muted-foreground mb-4 max-w-md">{brand.tagline}</p>
            )}

            <div className="gap-4 flex">{iconLinks}</div>
          </div>

          <div className="gap-20 lg:gap-8 lg:justify-around flex w-full flex-wrap justify-start">
            {navDirectory.labeledLinks.map((group, idx) => (
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
                          className={cn(`
                            text-muted-foreground
                            hover:text-accent-foreground
                            transition-colors
                          `)}
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
