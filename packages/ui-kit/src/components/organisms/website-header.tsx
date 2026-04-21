import { t } from "@lingui/core/macro"
import { useMemo } from "react"
import { useIsClient } from "usehooks-ts"

import { useCssRuntimeFeatureSupport, useLayoutContext } from "@/hooks"
import { useWindowScrollThreshold } from "@/hooks/scroll"
import { cn } from "@/utils"

import { LinkButton } from "../atoms/link-button"

export type WebsiteHeaderProps = {
  children: React.ReactNode
}

export const WebsiteHeader: React.FC<WebsiteHeaderProps> = ({ children }) => {
  const {
    Link,

    layoutConfig: {
      brand,
      navigation: { rootRoutePathname },
    },
  } = useLayoutContext()

  const isClient = useIsClient()
  const { isScrolled } = useWindowScrollThreshold({ axis: "vertical", value: 20 })

  const isCssScrollStateTrackable = useCssRuntimeFeatureSupport({
    property: "container-type",
    value: "scroll-state",
  })

  const hasCompositeLogo = useMemo(
    () => brand.projectCanonicalName.startsWith(`${brand.name} `),
    [brand.name, brand.projectCanonicalName],
  )

  //* Prevents collisions with the nav menu on small screens, for websites under brand umbrellas
  const logoLabel = useMemo(
    () =>
      hasCompositeLogo ? (
        <>
          <span
            className={"text-lg font-bold gap-1 text-2xl max-lg:flex hidden flex-col leading-none"}
          >
            {brand.projectCanonicalName.split(" ").map((nameFragment) => (
              <span key={nameFragment}>{nameFragment}</span>
            ))}
          </span>

          <span className="text-2xl font-bold max-lg:hidden">{brand.projectCanonicalName}</span>
        </>
      ) : (
        <span className="text-2xl font-bold">{brand.projectCanonicalName}</span>
      ),

    [brand.projectCanonicalName, hasCompositeLogo],
  )

  return (
    <header
      className={cn("glassy-header left-0 right-0 fixed z-40", {
        "bg-transparent": !isCssScrollStateTrackable && isClient && !isScrolled,
        "glassy shadow-lg": !isCssScrollStateTrackable && isClient && isScrolled,
      })}
    >
      <LinkButton
        id="main-content-link"
        href="#main-content"
        size="lg"
        className={cn(`
          focus:top-3 focus:left-4
          focus-visible:ring-foreground
          hover:bg-primary
          focus:bg-primary
          md:focus:left-6 md:focus:h-10
          lg:focus:left-8
          important:px-6 important:py-3
          focus:important:absolute
          sr-only
          focus:not-sr-only focus:z-50
        `)}
      >
        {t`Skip to main content`}
      </LinkButton>

      <div className="max-w-8xl px-4 md:px-6 lg:px-8 mx-auto">
        <div className="h-16 flex items-center justify-between">
          <Link
            href={rootRoutePathname}
            className={cn(`
              focus-visible:outline-ring focus-visible:outline-ring/50
              space-x-3 rounded-sm pr-1 flex items-center transition-opacity duration-200
              hover:opacity-80
              focus-visible:outline-offset-4
              [header:has(>#main-content-link:focus)_&]:opacity-0
            `)}
          >
            <div className="size-10 flex items-center justify-center">
              <img alt={brand.logoImageAltText} src={brand.logoImageSrc} className="size-10" />
            </div>

            {logoLabel}
          </Link>

          <div className="gap-4 h-9 flex items-center">{children}</div>
        </div>
      </div>
    </header>
  )
}
