//* Ported from: https://ui.shadcn.com

import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/utils"

import { NavigationMenuPositioner } from "../atoms/navigation-menu"
import { navigationMenuTriggerStyle } from "./navigation-menu-styles"

export type NavigationMenuProps = NavigationMenuPrimitive.Root.Props &
  Pick<NavigationMenuPrimitive.Positioner.Props, "align"> & {
    viewport?: boolean
  }

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  className,
  children,
  viewport = true,
  align = "start",
  ...props
}) => {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "group/navigation-menu relative flex h-full max-w-max flex-1 items-center justify-center",
        className,
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuPositioner align={align} />}
    </NavigationMenuPrimitive.Root>
  )
}

export type NavigationMenuTriggerProps = NavigationMenuPrimitive.Trigger.Props & {}

export const NavigationMenuTrigger: React.FC<NavigationMenuTriggerProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon
        className={cn(`
          ml-1 size-3 relative top-px transition duration-200
          group-data-open:rotate-180
          group-data-popup-open:rotate-180
        `)}
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  )
}
