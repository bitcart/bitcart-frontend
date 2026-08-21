import { useIsClient } from "@bitcart/hooks"
import { t } from "@lingui/core/macro"
import { useMemo } from "react"

import { useCssRuntimeFeatureSupport, useLayoutContext, useWindowScrollThreshold } from "@/hooks"
import type { WithChildren } from "@/types"
import { cn } from "@/utils"

export type WebsiteHeaderProps = WithChildren & {
  className?: string
}

export const WebsiteHeader: React.FC<WebsiteHeaderProps> = ({ className, children }) => {
  const {
    Link,

    layoutConfig: {
      brand,
      project,
      navigation: { rootRoutePathname },
    },
  } = useLayoutContext()

  const isClient = useIsClient()
  const { isScrolled } = useWindowScrollThreshold({ axis: "vertical", value: 20 })

  const isCssScrollStateTrackable = useCssRuntimeFeatureSupport({
    property: "container-type",
    value: "scroll-state",
  })

  const logoLabelText = project?.canonicalName ?? brand.name
  const logoLabelTextFragments = useMemo(() => logoLabelText.split(" "), [logoLabelText])

  //* Prevents collisions with the nav menu on small screens.
  const logoLabel = useMemo(
    () =>
      logoLabelTextFragments.length > 1 ? (
        <>
          <span className="text-lg font-bold gap-1 max-lg:flex hidden flex-col leading-none">
            {logoLabelTextFragments.map((textFragment) => (
              <span key={textFragment}>{textFragment}</span>
            ))}
          </span>

          <span className="text-2xl font-bold max-lg:hidden">{logoLabelText}</span>
        </>
      ) : (
        <span className="text-2xl font-bold">{logoLabelText}</span>
      ),

    [logoLabelText, logoLabelTextFragments],
  )

  return (
    <header
      className={cn(
        `inset-x-0 h-16 top-0 @document/scroll-top:glassy @document/scroll-top:shadow-lg fixed z-40`,

        //* JS fallback for the browsers that don't ship `scroll-state` container queries yet.
        {
          "bg-transparent": isClient && !isCssScrollStateTrackable && !isScrolled,
          glassy: isClient && !isCssScrollStateTrackable && isScrolled,
        },

        className,
      )}
    >
      <div className="max-w-8xl px-4 md:px-6 lg:px-8 mx-auto">
        <div className="h-16 flex items-center justify-between">
          <Link
            href={rootRoutePathname}
            className={cn(`
              rounded-lg p-1 px-2 text-foreground
              hover:text-accent-foreground
              focus-visible:text-accent-foreground
              transition-scale gap-3
              focus-visible:outline-ring/90
              flex items-center duration-200
              hover:scale-105
              focus-visible:outline-3
              [#root:has(#main-content-link:focus)_&]:opacity-0
            `)}
            aria-label={t`Go to homepage`}
          >
            <div className="size-10 flex items-center justify-center">
              <img
                alt={t`${project?.canonicalName ?? brand.name} logo`}
                src={project?.logoImageSrc ?? brand.logoImageSrc}
                className="size-10"
              />
            </div>

            {logoLabel}
          </Link>

          <div className="gap-4 h-9 flex items-center">{children}</div>
        </div>
      </div>
    </header>
  )
}
