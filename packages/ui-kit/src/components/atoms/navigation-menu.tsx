//* Ported from: https://ui.shadcn.com

import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu"

import { cn } from "@/utils"

export const NavigationMenuList = ({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.List>) => {
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
}: React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.Item>) => {
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
}: NavigationMenuPrimitive.Content.Props) => {
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
          group-data-[viewport=false]/navigation-menu:rounded-md
          group-data-[viewport=false]/navigation-menu:shadow-sm
          group-data-[viewport=false]/navigation-menu:data-open:animate-in
          group-data-[viewport=false]/navigation-menu:data-closed:animate-out
          group-data-[viewport=false]/navigation-menu:data-closed:zoom-out-95
          group-data-[viewport=false]/navigation-menu:data-open:zoom-in-95
          group-data-[viewport=false]/navigation-menu:data-open:fade-in-0
          group-data-[viewport=false]/navigation-menu:data-closed:fade-out-0
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

export const NavigationMenuPositioner = ({
  className,
  side = "bottom",
  sideOffset = 8,
  align = "start",
  alignOffset = 0,
  ...props
}: NavigationMenuPrimitive.Positioner.Props) => {
  return (
    <NavigationMenuPrimitive.Portal>
      <NavigationMenuPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className={cn(
          `
            isolate z-50 transition-[top,left,right,bottom] duration-[0.35s]
            ease-[cubic-bezier(0.22,1,0.36,1)]
          `,

          className,
        )}
        {...props}
      >
        <NavigationMenuPrimitive.Popup
          className={`
            rounded-md bg-popover text-popover-foreground shadow-sm ring-foreground/10 relative
            origin-[--transform-origin] ring-1 transition-[opacity,width,height,transform]
            duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] outline-none
            data-ending-style:scale-90 data-ending-style:opacity-0 data-ending-style:duration-150
            data-starting-style:scale-90 data-starting-style:opacity-0
          `}
        >
          <NavigationMenuPrimitive.Viewport className="relative size-full overflow-hidden" />
        </NavigationMenuPrimitive.Popup>
      </NavigationMenuPrimitive.Positioner>
    </NavigationMenuPrimitive.Portal>
  )
}

export const NavigationMenuLink = ({ className, ...props }: NavigationMenuPrimitive.Link.Props) => {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        `
          hover:text-accent-foreground
          focus:text-accent-foreground
          font-medium gap-1 rounded-sm p-2
          focus-visible:ring-ring/50
          [&_svg:not-[class*='text-']]:text-muted-foreground
          [&_svg:not-[class*='size-']]:size-4
          data-active:text-accent-foreground/90
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
}: React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.Icon>) => {
  return (
    <NavigationMenuPrimitive.Icon
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
      <div className="bg-border size-2 rounded-tl-sm shadow-md relative top-[60%] rotate-45" />
    </NavigationMenuPrimitive.Icon>
  )
}
