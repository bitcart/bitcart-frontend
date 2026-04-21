import {
  MOBILE_MENU_CONTENT_TESTID,
  MOBILE_MENU_TOGGLE_TESTID,
  UI_THEME_MOBILE_TOGGLE_TESTID,
} from "@bitcart/qa"
import { t } from "@lingui/core/macro"
import { Loader, Menu, X } from "lucide-react"
import { useCallback, useRef, useState } from "react"
import { isEmptyish } from "remeda"
import { useIsClient } from "usehooks-ts"

import { useCurrentBreakpoint, useLayoutContext } from "@/hooks"
import { cn } from "@/utils"

import { Button } from "../atoms/button"
import { Drawer, DrawerFooter, DrawerHeader, DrawerTrigger } from "../atoms/drawer"
import { LinkButton } from "../atoms/link-button"
import { DrawerPanel } from "../molecules/drawer-panel"
import { DrawerPopup } from "../molecules/drawer-popup"
import { ThemeToggle } from "../molecules/theme-toggle"

export type WebsiteMobileMenuProps = {
  classNames?: { trigger?: string; popup?: string }
}

export const WebsiteMobileMenu: React.FC<WebsiteMobileMenuProps> = ({ classNames }) => {
  const {
    Link,
    currentRoute,

    layoutConfig: {
      brand,
      navigation: { rootRoutePathname },
    },

    primaryNavCatalog: { iconLinks, labeledLinks },
  } = useLayoutContext()

  const isClient = useIsClient()
  const currentBreakpoint = useCurrentBreakpoint()
  const popupRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const toggle = useCallback(() => setIsOpen((state) => !state), [])
  const close = useCallback(() => setIsOpen(false), [])

  const getInitialFocusElement = useCallback(
    () =>
      popupRef.current?.querySelector<HTMLElement>("[aria-current='page']") ??
      popupRef.current?.querySelectorAll<HTMLElement>("a, button").item(1) ??
      null,

    [],
  )

  return (
    <Drawer open={isOpen && currentBreakpoint === "sm"} onOpenChange={setIsOpen}>
      <DrawerTrigger
        disabled={!isClient}
        onClick={toggle}
        render={<Button size="icon-lg" variant="ghost" />}
        className={cn("md:hidden", classNames?.trigger)}
        aria-label={isOpen ? t`Close menu` : t`Open menu`}
        data-testid={MOBILE_MENU_TOGGLE_TESTID}
      >
        {isClient ? (
          <>{isOpen ? <X className="size-6" /> : <Menu className="size-6" />}</>
        ) : (
          <Loader className="size-6 animate-spin text-foreground" />
        )}
      </DrawerTrigger>

      <DrawerPopup
        ref={popupRef}
        initialFocus={getInitialFocusElement}
        keepMounted={currentBreakpoint === "sm"}
        className={classNames?.popup}
        aria-label={t`Main Menu`}
      >
        <DrawerHeader className="flex-row items-center justify-center">
          <Link
            href={rootRoutePathname}
            className={cn(`
              focus-visible:outline-ring focus-visible:outline-ring/50
              space-x-3 rounded-sm pr-1 flex w-fit items-center transition-opacity duration-200
              hover:opacity-80
              focus-visible:outline-offset-4
            `)}
          >
            <div className="size-10 flex items-center justify-center">
              <img alt={brand.logoImageAltText} src={brand.logoImageSrc} className="size-10" />
            </div>

            <span className="text-2xl font-bold">{brand.projectCanonicalName}</span>
          </Link>
        </DrawerHeader>

        <DrawerPanel scrollFade={false} data-testid={MOBILE_MENU_CONTENT_TESTID}>
          <nav className="gap-2 flex w-full flex-col" aria-label={t`Navigation`}>
            {labeledLinks.map((link) => {
              const a11yAwareLinkProps = link.isExternal
                ? { href: link.href, isExternalLink: true as const }
                : { href: link.href, isExternalLink: false as const }

              const isActive = !link.isExternal && link.href === currentRoute.pathnameWithHash

              return (
                <LinkButton
                  key={link.label + link.href}
                  onClick={close}
                  variant="ghost"
                  className={cn("w-full justify-start text-left", {
                    "bg-accent text-accent-foreground": isActive,
                  })}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={link.hint ?? link.label}
                  {...a11yAwareLinkProps}
                >
                  {link.label}
                </LinkButton>
              )
            })}
          </nav>
        </DrawerPanel>

        <DrawerFooter className="bg-transparent">
          <div
            className={cn(
              "gap-4 pt-2 flex w-full items-center",

              {
                "justify-end": isEmptyish(iconLinks),
                "justify-between": !isEmptyish(iconLinks),
              },
            )}
          >
            {!isEmptyish(iconLinks) && (
              <nav className="gap-4 flex" aria-label={t`Other links`}>
                {iconLinks?.map(({ icon: Icon, ...link }) => {
                  const a11yAwareLinkProps = link.isExternal
                    ? { href: link.href, isExternalLink: true as const }
                    : { href: link.href, isExternalLink: false as const }

                  return (
                    <LinkButton
                      key={link.hint + link.href}
                      onClick={close}
                      title={link.hint}
                      size="icon-lg"
                      variant="ghost"
                      className="hover:text-accent-foreground bg-muted/25 dark:hover:bg-accent/30"
                      aria-label={link.hint}
                      {...a11yAwareLinkProps}
                    >
                      <Icon aria-hidden="true" />
                    </LinkButton>
                  )
                })}
              </nav>
            )}

            <ThemeToggle
              testId={UI_THEME_MOBILE_TOGGLE_TESTID}
              className={cn(
                `size-10 hover:text-accent-foreground bg-muted/25 dark:hover:bg-accent/30`,
              )}
            />
          </div>
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  )
}
