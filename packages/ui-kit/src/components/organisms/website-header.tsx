import type { InternalHref } from "@bitcart/core/types"
import { NAVBAR_TESTID, NAV_DROPDOWN_CONTENT_TESTID, NAV_DROPDOWN_TOGGLE_TESTID } from "@bitcart/qa"
import { t } from "@lingui/core/macro"
import { MoreHorizontal } from "lucide-react"
import { useCallback, useMemo } from "react"
import { useIsClient } from "usehooks-ts"

import { useCssRuntimeFeatureSupport, useCurrentBreakpoint } from "@/hooks"
import { useWindowScrollThreshold } from "@/hooks/scroll"
import type {
  BasicLinkComponent,
  BasicNavigationLink,
  LayoutBrandAttributes,
  LayoutNavigationConfig,
  NavigationCatalog,
} from "@/types"
import { cn, getTargetBlankA11yHint } from "@/utils"

import { Button } from "../atoms/button"
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../atoms/dropdown-menu"
import { LinkButton } from "../atoms/link-button"
import {
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../atoms/navigation-menu"
import { DropdownMenuContent } from "../molecules/dropdown-menu"
import { NavigationMenu } from "../molecules/navigation-menu"
import { ThemeToggle, ThemeToggleFallback } from "../molecules/theme-toggle"

export type WebsiteHeaderProps = {
  LinkComponent: BasicLinkComponent
  activeNavlinkHref?: BasicNavigationLink["href"]
  brandAttributes: LayoutBrandAttributes
  homepageHref?: InternalHref
  layoutControls?: React.ReactNode
  maxVisibleNavBarLinks: LayoutNavigationConfig["navBarDisplayCapacity"]
  navigationCatalog: NavigationCatalog
}

export const WebsiteHeader: React.FC<WebsiteHeaderProps> = ({
  LinkComponent: Link,
  activeNavlinkHref,
  brandAttributes: brand,
  homepageHref = "/",
  layoutControls,
  maxVisibleNavBarLinks,
  navigationCatalog,
}) => {
  const isClient = useIsClient()
  const { isScrolled } = useWindowScrollThreshold({ axis: "vertical", value: 20 })
  const currentBreakpoint = useCurrentBreakpoint()

  const isCssScrollStateTrackable = useCssRuntimeFeatureSupport({
    property: "container-type",
    value: "scroll-state",
  })

  const hasCompositeLogo = useMemo(
    () => brand.projectCanonicalName.startsWith(`${brand.name} `),
    [brand.name, brand.projectCanonicalName],
  )

  const shouldDisplayDropdownNavMenu = useMemo(() => {
    if (currentBreakpoint === "sm") {
      return false
    } else {
      return (
        navigationCatalog.labeledLinks.length >
        maxVisibleNavBarLinks[currentBreakpoint in maxVisibleNavBarLinks ? currentBreakpoint : "md"]
      )
    }
  }, [currentBreakpoint, maxVisibleNavBarLinks, navigationCatalog.labeledLinks])

  const getNavBarLinkClass = useCallback(
    (n: number) =>
      cn({
        "md:inline-flex hidden": n <= maxVisibleNavBarLinks.md,
        "lg:inline-flex hidden": n > maxVisibleNavBarLinks.md && n <= maxVisibleNavBarLinks.lg,
        "xl:inline-flex hidden": n > maxVisibleNavBarLinks.lg && n <= maxVisibleNavBarLinks.xl,
        "2xl:inline-flex hidden": n > maxVisibleNavBarLinks.xl && n <= maxVisibleNavBarLinks["2xl"],
        "3xl:inline-flex hidden": n > maxVisibleNavBarLinks["2xl"],
      }),

    [maxVisibleNavBarLinks],
  )

  const getDropdownNavMenuLinkClass = useCallback(
    (n: number) =>
      cn({
        hidden: n <= maxVisibleNavBarLinks.md,
        "md:block lg:hidden": n > maxVisibleNavBarLinks.md && n <= maxVisibleNavBarLinks.lg,
        "md:block xl:hidden": n > maxVisibleNavBarLinks.lg && n <= maxVisibleNavBarLinks.xl,
        "md:block 2xl:hidden": n > maxVisibleNavBarLinks.xl && n <= maxVisibleNavBarLinks["2xl"],
        "md:block 3xl:hidden": n > maxVisibleNavBarLinks["2xl"],
      }),

    [maxVisibleNavBarLinks],
  )

  //* Prevents collisions with the nav menu on small screens, for websites under brand umbrellas
  const logoLabel = useMemo(
    () =>
      hasCompositeLogo ? (
        <>
          <span
            className={"text-lg font-bold gap-1 text-2xl max-lg:flex hidden flex-col leading-none"}
            aria-hidden={!(currentBreakpoint === "sm" || currentBreakpoint === "md")}
          >
            {brand.projectCanonicalName.split(" ").map((nameFragment) => (
              <span key={nameFragment}>{nameFragment}</span>
            ))}
          </span>

          <span
            className="text-2xl font-bold max-lg:hidden"
            aria-hidden={currentBreakpoint === "sm" || currentBreakpoint === "md"}
          >
            {brand.projectCanonicalName}
          </span>
        </>
      ) : (
        <span className="text-2xl font-bold">{brand.projectCanonicalName}</span>
      ),

    [brand.projectCanonicalName, currentBreakpoint, hasCompositeLogo],
  )

  // FIXME: Extract into a single organism along with `dropdownNavMenu` and consume it as a prop
  const navBar = useMemo(
    () => (
      <>
        <NavigationMenu
          className="md:flex hidden"
          aria-label={t`Navigation bar`}
          aria-hidden={currentBreakpoint === "sm"}
          data-testid={NAVBAR_TESTID}
        >
          <NavigationMenuList>
            {navigationCatalog.labeledLinks.map((link, idx) => {
              const a11yAwareLinkProps = link.isExternal
                ? { href: link.href, a11yHint: getTargetBlankA11yHint() }
                : { href: link.href }

              return (
                <NavigationMenuItem
                  key={link.label + link.href}
                  className={getNavBarLinkClass(
                    "globalPriority" in link ? link.globalPriority : idx + 1,
                  )}
                  aria-label={link.hint ?? link.label}
                >
                  <NavigationMenuLink
                    active={!link.isExternal && link.href === activeNavlinkHref}
                    render={<Link {...a11yAwareLinkProps} />}
                  >
                    <span>
                      {currentBreakpoint === "md" ? (link.shortLabel ?? link.label) : link.label}
                    </span>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )
            })}
          </NavigationMenuList>
        </NavigationMenu>

        {navigationCatalog.iconLinks?.map(({ icon: Icon, ...link }) => {
          const a11yAwareLinkProps = link.isExternal
            ? { href: link.href, isExternalLink: true as const }
            : { href: link.href, isExternalLink: false as const }

          return (
            <LinkButton
              key={link.hint + link.href}
              title={link.hint}
              size="icon"
              variant="ghost"
              className="md:flex hidden"
              aria-label={link.hint.replace(/`/g, "")}
              {...a11yAwareLinkProps}
            >
              <Icon className="size-5" aria-hidden="true" />
            </LinkButton>
          )
        })}
      </>
    ),

    [
      Link,
      activeNavlinkHref,
      currentBreakpoint,
      getNavBarLinkClass,
      navigationCatalog.iconLinks,
      navigationCatalog.labeledLinks,
    ],
  )

  const dropdownNavMenu = useMemo(
    () => (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button size="icon" variant="ghost" />}
          className={cn("relative", { hidden: !shouldDisplayDropdownNavMenu })}
          aria-label={t`More`}
          data-testid={NAV_DROPDOWN_TOGGLE_TESTID}
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          aria-label={t`Additional navigation`}
          className={cn("w-56", { hidden: !shouldDisplayDropdownNavMenu })}
          data-testid={NAV_DROPDOWN_CONTENT_TESTID}
        >
          <DropdownMenuGroup>
            {navigationCatalog.labeledLinks.map((link, idx) => {
              const a11yAwareLinkProps = link.isExternal
                ? { href: link.href, a11yHint: getTargetBlankA11yHint() }
                : { href: link.href }

              return (
                <DropdownMenuItem
                  key={link.label + link.href}
                  nativeButton={false}
                  render={<Link {...a11yAwareLinkProps} />}
                  className={getDropdownNavMenuLinkClass(
                    "globalPriority" in link ? link.globalPriority : idx + 1,
                  )}
                  aria-label={link.hint ?? link.label}
                >
                  {link.label}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    ),

    [
      Link,
      getDropdownNavMenuLinkClass,
      navigationCatalog.labeledLinks,
      shouldDisplayDropdownNavMenu,
    ],
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
        className={`
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
        `}
      >
        {t`Skip to main content`}
      </LinkButton>

      <div className="max-w-8xl px-4 md:px-6 lg:px-8 mx-auto">
        <div className="h-16 flex items-center justify-between">
          <Link
            href={homepageHref}
            className={`
              focus-visible:outline-ring focus-visible:outline-ring/50
              space-x-3 rounded-sm pr-1 flex items-center transition-opacity duration-200
              hover:opacity-80
              focus-visible:outline-offset-4
              [header:has(>#main-content-link:focus)_&]:opacity-0
            `}
          >
            <div className="size-10 flex items-center justify-center">
              <img alt={brand.logoImageAltText} src={brand.logoImageSrc} className="size-10" />
            </div>

            {logoLabel}
          </Link>

          <div className="gap-4 h-9 flex items-center">
            {navBar}
            {dropdownNavMenu}

            {isClient ? (
              <ThemeToggle className="max-md:hidden" />
            ) : (
              <ThemeToggleFallback className="max-md:hidden" />
            )}

            {layoutControls}
          </div>
        </div>
      </div>
    </header>
  )
}
