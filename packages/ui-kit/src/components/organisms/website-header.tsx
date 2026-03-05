import { t } from "@lingui/core/macro"
import { Loader, Menu, MoreHorizontal, X } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { isEmptyish, prop } from "remeda"
import { useIsClient } from "usehooks-ts"

import { useCssRuntimeFeatureSupport, useCurrentBreakpoint } from "@/hooks"
import { useWindowScrollThreshold } from "@/hooks/scroll"
import type {
  BasicLinkComponent,
  BasicNavigationLink,
  LayoutBrandAttributes,
  LayoutNavigationConfig,
} from "@/types"
import { cn } from "@/utils"

import { Button } from "../atoms/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../atoms/dropdown-menu"
import {
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../atoms/navigation-menu"
import { NavigationMenu } from "../molecules/navigation-menu"
import { ThemeToggle, ThemeToggleFallback } from "../molecules/theme-toggle"

export type WebsiteHeaderProps = {
  LinkComponent: BasicLinkComponent
  activeNavlinkHref?: BasicNavigationLink["href"]
  brandAttributes: LayoutBrandAttributes
  homepageHref?: string
  layoutControls?: React.ReactNode
  maxVisibleNavBarLinks: LayoutNavigationConfig["navBarDisplayCapacity"]
  navigationDirectory: LayoutNavigationConfig["directory"]
}

export const WebsiteHeader: React.FC<WebsiteHeaderProps> = ({
  LinkComponent: Link,
  brandAttributes: brand,
  homepageHref = "/",
  layoutControls,
  maxVisibleNavBarLinks,
  navigationDirectory,
}) => {
  const isClient = useIsClient()
  const { isScrolled } = useWindowScrollThreshold({ axis: "vertical", value: 20 })
  const currentBreakpoint = useCurrentBreakpoint()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), [])

  const isCssScrollStateTrackable = useCssRuntimeFeatureSupport({
    property: "container-type",
    value: "scroll-state",
  })

  const hasCompositeLogo = useMemo(
    () => brand.projectCanonicalName.startsWith(`${brand.name} `),
    [brand.name, brand.projectCanonicalName],
  )

  const labeledLinks = useMemo(
    () => navigationDirectory.labeledLinks.flatMap(prop("items")),
    [navigationDirectory.labeledLinks],
  )

  const iconLinks = useMemo(
    () => navigationDirectory.iconLinks?.flatMap(prop("items")),
    [navigationDirectory.iconLinks],
  )

  const shouldDisplayDropdownNavMenu = useMemo(() => {
    if (currentBreakpoint === "sm") {
      return false
    } else {
      return (
        labeledLinks.length >
        maxVisibleNavBarLinks[currentBreakpoint in maxVisibleNavBarLinks ? currentBreakpoint : "md"]
      )
    }
  }, [currentBreakpoint, labeledLinks.length, maxVisibleNavBarLinks])

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

  const navBar = useMemo(
    () => (
      <>
        <NavigationMenu
          className="md:flex hidden"
          aria-label={t`Navigation bar`}
          aria-hidden={currentBreakpoint === "sm"}
        >
          <NavigationMenuList>
            {labeledLinks.map((link, idx) => (
              <NavigationMenuItem
                key={link.label + link.href}
                className={getNavBarLinkClass(
                  "globalPosition" in link ? link.globalPosition : idx + 1,
                )}
                style={{ order: "globalPosition" in link ? link.globalPosition : undefined }}
                aria-label={link.hint ?? link.label}
              >
                <NavigationMenuLink asChild>
                  <Link href={link.href}>
                    <span>
                      {currentBreakpoint === "md" ? (link.shortLabel ?? link.label) : link.label}
                    </span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {iconLinks?.map(({ icon: Icon, ...link }) => (
          <Button
            asChild
            key={link.hint + link.href}
            size="icon"
            variant="ghost"
            title={link.hint}
            className="md:flex hidden"
            style={{ order: "globalPosition" in link ? link.globalPosition : undefined }}
            aria-label={link.hint.replace(/`/g, "")}
          >
            <Link href={link.href}>
              <Icon className="w-5 h-5" />
            </Link>
          </Button>
        ))}
      </>
    ),

    [Link, currentBreakpoint, getNavBarLinkClass, iconLinks, labeledLinks],
  )

  const dropdownNavMenu = useMemo(
    () => (
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          className={cn("relative", { hidden: !shouldDisplayDropdownNavMenu })}
          aria-label="More"
        >
          <Button size="icon" variant="ghost">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className={cn("w-56", { hidden: !shouldDisplayDropdownNavMenu })}
        >
          <DropdownMenuGroup>
            {labeledLinks.map((link, idx) => (
              <DropdownMenuItem
                asChild
                key={link.label + link.href}
                className={getDropdownNavMenuLinkClass(
                  "globalPosition" in link ? link.globalPosition : idx + 1,
                )}
                style={{ order: "globalPosition" in link ? link.globalPosition : undefined }}
                aria-label={link.hint ?? link.label}
              >
                <Link href={link.href}>{link.label}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    ),

    [Link, getDropdownNavMenuLinkClass, labeledLinks, shouldDisplayDropdownNavMenu],
  )

  const mobileMenuContent = useMemo(
    () =>
      isMobileMenuOpen && (
        <div
          id="mobile-menu"
          aria-label={t`Mobile menu`}
          className={`
            md:hidden
            top-16 left-0 right-0 shadow-lg bg-background absolute w-full border-t
          `}
        >
          <div className="px-4 py-4 flex w-full flex-col">
            <nav className="gap-2 flex w-full flex-col" aria-label={t`Navigation menu`}>
              {labeledLinks.map((link) => (
                <Button
                  asChild
                  key={link.label + link.href}
                  onClick={closeMobileMenu}
                  variant="ghost"
                  className={`w-full justify-start text-left`}
                  style={{ order: "globalPosition" in link ? link.globalPosition : undefined }}
                  aria-label={link.hint ?? link.label}
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
            </nav>

            <div
              className={cn(
                "gap-4 pt-2 mt-4 flex w-full items-center border-t",

                {
                  "justify-end": isEmptyish(iconLinks),
                  "justify-between": !isEmptyish(iconLinks),
                },
              )}
            >
              {!isEmptyish(iconLinks) && (
                <nav className="gap-4 flex" aria-label={t`Other links`}>
                  {iconLinks?.map(({ icon: Icon, ...link }) => (
                    <Button
                      asChild
                      key={link.hint + link.href}
                      onClick={closeMobileMenu}
                      size="icon-lg"
                      variant="ghost"
                      title={link.hint}
                      className="hover:text-accent-foreground bg-muted/25 dark:hover:bg-accent/30"
                      style={{ order: "globalPosition" in link ? link.globalPosition : undefined }}
                      aria-label={link.hint.replace(/`/g, "")}
                    >
                      <Link href={link.href}>
                        <Icon className="w-5 h-5" />
                      </Link>
                    </Button>
                  ))}
                </nav>
              )}

              <ThemeToggle
                className={`
                  w-10 h-10
                  hover:text-accent-foreground
                  bg-muted/25
                  dark:hover:bg-accent/30
                `}
              />
            </div>
          </div>
        </div>
      ),

    [Link, closeMobileMenu, iconLinks, isMobileMenuOpen, labeledLinks],
  )

  return (
    <header
      className={cn("glassy-header left-0 right-0 fixed z-40", {
        "bg-transparent": !isCssScrollStateTrackable && isClient && !isScrolled,
        "glassy shadow-lg": !isCssScrollStateTrackable && isClient && isScrolled,
      })}
    >
      <div className="max-w-8xl px-4 md:px-6 lg:px-8 mx-auto">
        <div className="h-16 flex items-center justify-between">
          <Link
            href={homepageHref}
            className={`
              space-x-3 flex items-center transition-opacity duration-200
              hover:opacity-80
            `}
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                alt={`${brand.projectCanonicalName} logo`}
                src={brand.logoImageSrc}
                className="w-10 h-10"
              />
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

            <Button
              disabled={!isClient}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              size="icon-lg"
              variant="ghost"
              className="md:hidden"
              aria-label={isMobileMenuOpen ? t`Close menu` : t`Open menu`}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isClient ? (
                <>{isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</>
              ) : (
                <Loader className="w-6 h-6 animate-spin text-foreground" />
              )}
            </Button>
          </div>
        </div>

        {mobileMenuContent}
      </div>
    </header>
  )
}
