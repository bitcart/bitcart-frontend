import { NAVBAR_TESTID, NAV_DROPDOWN_CONTENT_TESTID, NAV_DROPDOWN_TOGGLE_TESTID } from "@bitcart/qa"
import { t } from "@lingui/core/macro"
import { MoreHorizontal } from "lucide-react"
import { useCallback, useMemo } from "react"

import { useCurrentBreakpoint, useLayoutContext } from "@/hooks"
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

export type WebsiteNavigationMenuProps = {
  className?: string
  inert?: boolean
}

export const WebsiteNavigationMenu: React.FC<WebsiteNavigationMenuProps> = ({
  className: rowClassName,
  inert,
}) => {
  const {
    Link,
    currentRoute,

    layoutConfig: {
      navigation: { navBarDisplayCapacity: maxVisibleRowLinks },
    },

    primaryNavCatalog: { iconLinks, labeledLinks },
  } = useLayoutContext()

  const currentBreakpoint = useCurrentBreakpoint()

  const shouldDisplayDropdown = useMemo(() => {
    if (currentBreakpoint === "sm") {
      return false
    } else {
      return (
        labeledLinks.length >
        maxVisibleRowLinks[currentBreakpoint in maxVisibleRowLinks ? currentBreakpoint : "md"]
      )
    }
  }, [currentBreakpoint, labeledLinks, maxVisibleRowLinks])

  const getRowLinkClass = useCallback(
    (n: number) =>
      cn({
        "md:inline-flex hidden": n <= maxVisibleRowLinks.md,
        "lg:inline-flex hidden": n > maxVisibleRowLinks.md && n <= maxVisibleRowLinks.lg,
        "xl:inline-flex hidden": n > maxVisibleRowLinks.lg && n <= maxVisibleRowLinks.xl,
        "2xl:inline-flex hidden": n > maxVisibleRowLinks.xl && n <= maxVisibleRowLinks["2xl"],
        "3xl:inline-flex hidden": n > maxVisibleRowLinks["2xl"],
      }),

    [maxVisibleRowLinks],
  )

  const getDropdownLinkClass = useCallback(
    (n: number) =>
      cn({
        hidden: n <= maxVisibleRowLinks.md,
        "md:block lg:hidden": n > maxVisibleRowLinks.md && n <= maxVisibleRowLinks.lg,
        "md:block xl:hidden": n > maxVisibleRowLinks.lg && n <= maxVisibleRowLinks.xl,
        "md:block 2xl:hidden": n > maxVisibleRowLinks.xl && n <= maxVisibleRowLinks["2xl"],
        "md:block 3xl:hidden": n > maxVisibleRowLinks["2xl"],
      }),

    [maxVisibleRowLinks],
  )

  return (
    <NavigationMenu
      className={cn("gap-4", rowClassName)}
      aria-label={t`Navigation menu`}
      inert={inert}
      data-testid={NAVBAR_TESTID}
    >
      <NavigationMenuList>
        {labeledLinks.map((link, idx) => {
          const a11yAwareLinkProps = link.isExternal
            ? { href: link.href, a11yHint: getTargetBlankA11yHint() }
            : { href: link.href }

          const isActive = !link.isExternal && link.href === currentRoute.pathnameWithHash

          return (
            <NavigationMenuItem
              key={link.label + link.href}
              className={getRowLinkClass(idx + 1)}
              aria-label={link.hint ?? link.label}
            >
              <NavigationMenuLink active={isActive} render={<Link {...a11yAwareLinkProps} />}>
                <span>
                  {currentBreakpoint === "md" ? (link.shortLabel ?? link.label) : link.label}
                </span>
              </NavigationMenuLink>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>

      <NavigationMenuList className="gap-4 lg:gap-4 xl:gap-4">
        {iconLinks?.map(({ icon: Icon, ...link }) => {
          const a11yAwareLinkProps = link.isExternal
            ? { href: link.href, isExternalLink: true as const }
            : { href: link.href, isExternalLink: false as const }

          const isActive = !link.isExternal && link.href === currentRoute.pathnameWithHash

          return (
            <NavigationMenuItem key={link.hint + link.href} aria-label={link.hint}>
              <NavigationMenuLink
                active={isActive}
                title={link.hint}
                render={<LinkButton size="icon" variant="ghost" {...a11yAwareLinkProps} />}
              >
                <Icon className="size-5" aria-hidden="true" />
              </NavigationMenuLink>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button size="icon" variant="ghost" />}
          className={cn("relative", { hidden: !shouldDisplayDropdown })}
          aria-label={t`Show more links`}
          data-testid={NAV_DROPDOWN_TOGGLE_TESTID}
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          aria-label={t`More links`}
          className={cn("w-56", { hidden: !shouldDisplayDropdown })}
          data-testid={NAV_DROPDOWN_CONTENT_TESTID}
        >
          <DropdownMenuGroup render={<nav />}>
            {labeledLinks.map((link, idx) => {
              const a11yAwareLinkProps = link.isExternal
                ? { href: link.href, a11yHint: getTargetBlankA11yHint() }
                : { href: link.href }

              const isActive = !link.isExternal && link.href === currentRoute.pathnameWithHash

              return (
                <DropdownMenuItem
                  key={link.label + link.href}
                  nativeButton={false}
                  render={<Link {...a11yAwareLinkProps} />}
                  className={cn("w-full justify-start text-left", getDropdownLinkClass(idx + 1), {
                    "bg-accent text-accent-foreground": isActive,
                  })}
                  aria-label={link.hint ?? link.label}
                >
                  {link.label}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </NavigationMenu>
  )
}
