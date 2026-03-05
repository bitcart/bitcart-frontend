import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"

import { cn } from "@/utils"

export const NavigationMenuList = ({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) => {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        `group gap-1 lg:gap-2 xl:gap-3 flex flex-1 list-none items-center justify-center`,
        className,
      )}
      {...props}
    />
  )
}

export const NavigationMenuItem = ({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) => {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative text-nowrap", className)}
      {...props}
    />
  )
}

export const NavigationMenuContent = ({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) => {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        `
          data-[motion^=from-]:animate-in
          data-[motion^=to-]:animate-out
          data-[motion^=from-]:fade-in
          data-[motion^=to-]:fade-out
          data-[motion=from-end]:slide-in-from-right-52
          data-[motion=from-start]:slide-in-from-left-52
          data-[motion=to-end]:slide-out-to-right-52
          data-[motion=to-start]:slide-out-to-left-52
          top-0 left-0 p-2 pr-2.5
          md:absolute md:w-auto
          w-full
        `,
        `
          group-data-[viewport=false]/navigation-menu:bg-popover
          group-data-[viewport=false]/navigation-menu:text-popover-foreground
          group-data-[viewport=false]/navigation-menu:mt-1.5
          group-data-[viewport=false]/navigation-menu:rounded-md
          group-data-[viewport=false]/navigation-menu:shadow-sm
          group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in
          group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out
          group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95
          group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95
          group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0
          group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0
          group-data-[viewport=false]/navigation-menu:top-full
          group-data-[viewport=false]/navigation-menu:overflow-hidden
          group-data-[viewport=false]/navigation-menu:border
          group-data-[viewport=false]/navigation-menu:duration-200
          **:data-[slot=navigation-menu-link]:focus:ring-0
          **:data-[slot=navigation-menu-link]:focus:outline-none
        `,
        className,
      )}
      {...props}
    />
  )
}

export const NavigationMenuViewport = ({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) => {
  return (
    <div className={cn("left-0 absolute top-full isolate z-50 flex justify-center")}>
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          `
            origin-top-center bg-popover text-popover-foreground
            data-[state=closed]:zoom-out-95
            data-[state=open]:zoom-in-90
            mt-1.5 rounded-md shadow-sm
            md:w-[var(--radix-navigation-menu-viewport-width)]
            data-[state=open]:animate-in
            data-[state=closed]:animate-out
            relative h-(--radix-navigation-menu-viewport-height) w-full overflow-hidden border
          `,
          className,
        )}
        {...props}
      />
    </div>
  )
}

export const NavigationMenuLink = ({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) => {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        `
          hover:text-accent-foreground
          focus:text-accent-foreground
          font-medium gap-1 rounded-sm p-2
          focus-visible:ring-ring/50
          [&_svg:not([class*='text-'])]:text-muted-foreground
          [&_svg:not([class*='size-'])]:size-4
          data-[active]:text-accent-foreground/90
          flex h-full flex-col transition-all duration-200 outline-none
          hover:scale-105
          focus:scale-105
          focus-visible:ring-[3px] focus-visible:outline-1
        `,
        className,
      )}
      {...props}
    />
  )
}

export const NavigationMenuIndicator = ({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) => {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        `
          data-[state=visible]:animate-in
          data-[state=hidden]:animate-out data-[state=hidden]:fade-out
          data-[state=visible]:fade-in
          h-1.5 top-full z-1 flex items-end justify-center overflow-hidden
        `,
        className,
      )}
      {...props}
    >
      <div className="bg-border h-2 w-2 rounded-tl-sm shadow-md relative top-[60%] rotate-45" />
    </NavigationMenuPrimitive.Indicator>
  )
}
