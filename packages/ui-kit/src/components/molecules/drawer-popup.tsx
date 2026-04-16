//* Ported from: https://coss.com/ui

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer"
import { t } from "@lingui/core/macro"
import { XIcon } from "lucide-react"
import { useContext } from "react"

import { DrawerContext } from "@/contexts/drawer"
import type { DrawerPosition } from "@/types"
import { cn } from "@/utils"

import { Button } from "../atoms/button"
import { DrawerBackdrop, DrawerBar, DrawerPortal, DrawerViewport } from "../atoms/drawer"

export type DrawerPopupProps = DrawerPrimitive.Popup.Props & {
  keepMounted?: boolean
  position?: DrawerPosition
  showBar?: boolean
  showCloseButton?: boolean
  variant?: "default" | "straight" | "inset"
}

export const DrawerPopup: React.FC<DrawerPopupProps> = ({
  children,
  className,
  keepMounted = true,
  position: positionProp,
  showBar = true,
  showCloseButton = false,
  variant = "default",
  ...props
}) => {
  const { position: contextPosition } = useContext(DrawerContext)
  const position = positionProp ?? contextPosition

  return (
    <DrawerPortal keepMounted={keepMounted}>
      <DrawerBackdrop />

      <DrawerViewport position={position} variant={variant}>
        <DrawerPrimitive.Popup
          className={cn(
            `
              min-h-0 min-w-0 bg-popover text-popover-foreground shadow-lg/5
              before:inset-0
              after:bg-popover
              relative flex max-h-full w-full flex-col
              transition-[transform,box-shadow,height,background-color] duration-450
              ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform outline-none
              [--peek:calc(var(--spacing)*6-1px)]
              [--scale-base:calc(max(0,1-(var(--nested-drawers)*var(--stack-step))))]
              [--scale:clamp(0,calc(var(--scale-base)+(var(--stack-step)*var(--stack-progress))),1)]
              [--shrink:calc(1-var(--scale))]
              [--stack-peek-offset:max(0px,calc((var(--nested-drawers)-var(--stack-progress))*var(--peek)))]
              [--stack-progress:clamp(0,var(--drawer-swipe-progress),1)] [--stack-step:0.05]
              not-dark:bg-clip-padding
              before:pointer-events-none before:absolute before:shadow-[0_1px_black/4%]
              after:pointer-events-none after:absolute
              data-ending-style:shadow-transparent
              data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)]
              data-nested-drawer-open:overflow-hidden
              data-nested-drawer-open:bg-[color-mix(in_srgb,var(--popover),var(--color-black)_calc(2%*(var(--nested-drawers)-var(--stack-progress))))]
              data-starting-style:shadow-transparent
              data-swiping:select-none
              dark:before:shadow-[0_-1px_white/6%]
              dark:data-nested-drawer-open:bg-[color-mix(in_srgb,var(--popover),var(--color-black)_calc(6%*(var(--nested-drawers)-var(--stack-progress))))]
            `,

            "touch-none",

            {
              [`
                after:inset-x-0
                has-data-[slot=drawer-bar]:pt-2
                data-ending-style:mb-0
                data-starting-style:mb-0
                data-ending-style:pb-0
                data-starting-style:pb-0
                row-start-2
                -mb-[max(0px,calc(var(--drawer-snap-point-offset,0px)+clamp(0,1,var(--drawer-snap-point-offset,0px)/1px)*var(--drawer-swipe-movement-y,0px)))]
                transform-[translateY(calc(var(--drawer-snap-point-offset)+var(--drawer-swipe-movement-y)))]
                border-t
                pb-[max(0px,calc(env(safe-area-inset-bottom,0px)+var(--drawer-snap-point-offset,0px)+clamp(0,1,var(--drawer-snap-point-offset,0px)/1px)*var(--drawer-swipe-movement-y,0px)))]
                not-data-starting-style:not-data-ending-style:transition-[transform,box-shadow,height,background-color,margin,padding]
                after:top-full after:h-[--bleed]
                data-ending-style:transform-[translateY(calc(100%+env(safe-area-inset-bottom,0px)+var(--inset)))]
                data-starting-style:transform-[translateY(calc(100%+env(safe-area-inset-bottom,0px)+var(--inset)))]
              `]: position === "bottom",
            },

            {
              [`
                after:inset-x-0
                has-data-[slot=drawer-bar]:pb-2
                transform-[translateY(var(--drawer-swipe-movement-y))] border-b
                after:bottom-full after:h-[--bleed]
                data-ending-style:transform-[translateY(calc(-100%-var(--inset)))]
                data-starting-style:transform-[translateY(calc(-100%-var(--inset)))]
              `]: position === "top",
            },

            {
              [`
                max-w-md
                after:inset-y-0
                has-data-[slot=drawer-bar]:pe-2
                w-[calc(100%-var(--spacing)*12)]
                transform-[translateX(var(--drawer-swipe-movement-x))] border-e
                after:end-full after:w-[--bleed]
                data-ending-style:transform-[translateX(calc(-100%-var(--inset)))]
                data-starting-style:transform-[translateX(calc(-100%-var(--inset)))]
              `]: position === "left",
            },

            {
              [`
                max-w-md
                after:inset-y-0
                has-data-[slot=drawer-bar]:ps-2
                col-start-2 w-[calc(100%-var(--spacing)*12)]
                transform-[translateX(var(--drawer-swipe-movement-x))] border-s
                after:start-full after:w-[--bleed]
                data-ending-style:transform-[translateX(calc(100%+var(--inset)))]
                data-starting-style:transform-[translateX(calc(100%+var(--inset)))]
              `]: position === "right",
            },

            { "rounded-t-2xl": variant !== "straight" && position === "bottom" },

            {
              [`rounded-b-2xl **:data-[slot=drawer-footer]:rounded-b-[calc(var(--radius-2xl)-1px)]`]:
                variant !== "straight" && position === "top",
            },

            {
              [`rounded-e-2xl **:data-[slot=drawer-footer]:rounded-ee-[calc(var(--radius-2xl)-1px)]`]:
                variant !== "straight" && position === "left",
            },

            {
              [`rounded-s-2xl **:data-[slot=drawer-footer]:rounded-es-[calc(var(--radius-2xl)-1px)]`]:
                variant !== "straight" && position === "right",
            },

            {
              "before:rounded-t-[calc(var(--radius-2xl)-1px)]":
                variant === "default" && position === "bottom",
            },

            {
              "before:rounded-b-[calc(var(--radius-2xl)-1px)]":
                variant === "default" && position === "top",
            },

            {
              "before:rounded-e-[calc(var(--radius-2xl)-1px)]":
                variant === "default" && position === "left",
            },

            {
              "before:rounded-s-[calc(var(--radius-2xl)-1px)]":
                variant === "default" && position === "right",
            },

            {
              [`
                sm:rounded-2xl sm:border
                sm:after:bg-transparent
                sm:before:rounded-[calc(var(--radius-2xl)-1px)]
                sm:**:data-[slot=drawer-footer]:rounded-b-[calc(var(--radius-2xl)-1px)]
                before:hidden
              `]: variant === "inset",
            },

            { "[--stack-step:0]": variant === "straight" },

            {
              [`
                h-[--drawer-height,auto]
                [--height:max(0px,calc(var(--drawer-frontmost-height,var(--drawer-height))))]
                data-nested-drawer-open:h-[--height]
              `]: position === "bottom" || position === "top",
            },

            {
              [`
                origin-[50%_calc(100%-var(--inset))]
                data-nested-drawer-open:transform-[translateY(calc(var(--drawer-swipe-movement-y)-var(--stack-peek-offset)-(var(--shrink)*var(--height))))_scale(var(--scale))]
              `]: position === "bottom",
            },

            {
              [`
                origin-[50%_var(--inset)]
                data-nested-drawer-open:transform-[translateY(calc(var(--drawer-swipe-movement-y)+var(--stack-peek-offset)+(var(--shrink)*var(--height))))_scale(var(--scale))]
              `]: position === "top",
            },

            {
              [`
                origin-right
                data-nested-drawer-open:transform-[translateX(calc(var(--drawer-swipe-movement-x)+var(--stack-peek-offset)))_scale(var(--scale))]
              `]: position === "left",
            },

            {
              [`
                origin-left
                data-nested-drawer-open:transform-[translateX(calc(var(--drawer-swipe-movement-x)-var(--stack-peek-offset)))_scale(var(--scale))]
              `]: position === "right",
            },

            className,
          )}
          data-slot="drawer-popup"
          {...props}
        >
          {children}

          {showCloseButton && (
            <DrawerPrimitive.Close
              aria-label={t`Close`}
              className="end-2 top-2 absolute"
              render={<Button size="icon" variant="ghost" />}
            >
              <XIcon />
            </DrawerPrimitive.Close>
          )}

          {showBar && <DrawerBar />}
        </DrawerPrimitive.Popup>
      </DrawerViewport>
    </DrawerPortal>
  )
}
