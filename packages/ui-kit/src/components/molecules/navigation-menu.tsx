//* Ported from: https://ui.shadcn.com

import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/utils"

import { NavigationMenuPositioner } from "../atoms/navigation-menu"
import { navigationMenuTriggerStyle } from "./navigation-menu-styles"

export const NavigationMenu = ({
  className,
  children,
  viewport = true,
  align = "start",
  ...props
}: NavigationMenuPrimitive.Root.Props &
  Pick<NavigationMenuPrimitive.Positioner.Props, "align"> & {
    viewport?: boolean
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

export const NavigationMenuTrigger = ({
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Trigger.Props) => {
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
