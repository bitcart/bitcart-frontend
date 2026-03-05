import { t } from "@lingui/core/macro"
import { useMemo } from "react"

import type { BasicLinkComponent, LayoutBrandAttributes, LayoutNavigationConfig } from "@/types"

export type WebsiteFooterProps = {
  brandAttributes: LayoutBrandAttributes
  homepageHref?: string
  navigationDirectory: LayoutNavigationConfig["directory"]
  LinkComponent: BasicLinkComponent
}

export const WebsiteFooter: React.FC<WebsiteFooterProps> = ({
  LinkComponent: Link,
  brandAttributes: brand,
  homepageHref = "/",
  navigationDirectory: { labeledLinks, iconLinks },
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

  return (
    <footer className="border-muted dark:border-border border-t">
      <div className="max-w-7xl px-4 md:px-6 lg:px-8 py-12 mx-auto">
        <div className="gap-15 lg:gap-8 lg:flex-row flex flex-col">
          <div className="max-w-112 flex w-full flex-col">
            <Link href={homepageHref} className="space-x-3 mb-4 flex items-center">
              <img
                alt={`${brand.projectCanonicalName} logo`}
                src={brand.logoImageSrc}
                className="w-8 h-8"
              />

              <span className="text-xl font-bold">{brand.projectCanonicalName}</span>
            </Link>

            {brand.tagline && (
              <p className="text-muted-foreground mb-4 max-w-md">{brand.tagline}</p>
            )}

            <div className="gap-4 flex">
              {iconLinks?.map((group) =>
                group.items.map(({ icon: Icon, ...item }) => (
                  <Link
                    key={item.hint + item.href}
                    href={item.href}
                    title={item.hint}
                    className="text-muted-foreground hover:text-accent-foreground transition-colors"
                    style={{ order: "globalPosition" in item ? item.globalPosition : undefined }}
                    aria-label={item.hint}
                  >
                    <Icon className="w-5 h-5" />
                  </Link>
                )),
              )}
            </div>
          </div>

          <div className="gap-20 lg:gap-8 lg:justify-around flex w-full flex-wrap justify-start">
            {labeledLinks.map((group, idx) => (
              <div key={idx + group.groupTitle} className="gap-4 flex flex-col">
                <h3 className="text-sm font-semibold tracking-wider uppercase">
                  {group.groupTitle}
                </h3>

                <ul className="gap-3 flex flex-col">
                  {group.items.map((item) => (
                    <li
                      key={item.label + item.href}
                      style={{ order: "globalPosition" in item ? item.globalPosition : undefined }}
                    >
                      <Link
                        href={item.href}
                        className={`
                          text-muted-foreground
                          hover:text-accent-foreground
                          transition-colors
                        `}
                        aria-label={item.hint ?? item.label}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
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
