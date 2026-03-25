//* Ported from: https://coss.com/ui

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer"
import { mergeProps } from "@base-ui/react/merge-props"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { useRender } from "@base-ui/react/use-render"
import { ChevronRightIcon } from "lucide-react"
import { useContext } from "react"

import { DrawerContext } from "@/contexts/drawer"
import type { DrawerPosition } from "@/types"
import { cn } from "@/utils"

const DRAWER_SWIPE_DIRECTION_BY_POSITION: Record<
  DrawerPosition,
  DrawerPrimitive.Root.Props["swipeDirection"]
> = {
  bottom: "down",
  left: "left",
  right: "right",
  top: "up",
}

export const DrawerCreateHandle: typeof DrawerPrimitive.createHandle = DrawerPrimitive.createHandle

export type DrawerProps = DrawerPrimitive.Root.Props & {
  position?: DrawerPosition
}

export const Drawer: React.FC<DrawerProps> = ({
  swipeDirection,
  position = "bottom",
  ...props
}) => {
  return (
    <DrawerContext.Provider value={{ position }}>
      <DrawerPrimitive.Root
        swipeDirection={swipeDirection ?? DRAWER_SWIPE_DIRECTION_BY_POSITION[position]}
        {...props}
      />
    </DrawerContext.Provider>
  )
}

export const DrawerPortal: typeof DrawerPrimitive.Portal = DrawerPrimitive.Portal

export type DrawerTriggerProps = DrawerPrimitive.Trigger.Props & {}

export const DrawerTrigger: React.FC<DrawerTriggerProps> = (props) => {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

export type DrawerCloseProps = DrawerPrimitive.Close.Props & {}

export const DrawerClose: React.FC<DrawerCloseProps> = (props) => {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

export type DrawerSwipeAreaProps = DrawerPrimitive.SwipeArea.Props & {
  position?: DrawerPosition
}

export const DrawerSwipeArea: React.FC<DrawerSwipeAreaProps> = ({
  className,
  position: positionProp,
  ...props
}) => {
  const { position: contextPosition } = useContext(DrawerContext)
  const position = positionProp ?? contextPosition

  return (
    <DrawerPrimitive.SwipeArea
      className={cn(
        "fixed z-50 touch-none",
        { "inset-x-0 bottom-0 h-8": position === "bottom" },
        { "inset-x-0 top-0 h-8": position === "top" },
        { "inset-y-0 left-0 w-8": position === "left" },
        { "inset-y-0 right-0 w-8": position === "right" },
        className,
      )}
      data-slot="drawer-swipe-area"
      {...props}
    />
  )
}

export type DrawerBackdropProps = DrawerPrimitive.Backdrop.Props & {}

export const DrawerBackdrop: React.FC<DrawerBackdropProps> = ({ className, ...props }) => {
  return (
    <DrawerPrimitive.Backdrop
      className={cn(
        `
          inset-0 bg-black/32 backdrop-blur-sm fixed z-50
          opacity-[calc(1-var(--drawer-swipe-progress))] transition-opacity duration-450
          ease-[cubic-bezier(0.32,0.72,0,1)]
          data-ending-style:opacity-0
          data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)]
          data-starting-style:opacity-0
          data-swiping:duration-0
          supports-[-webkit-touch-callout:none]:absolute
        `,

        className,
      )}
      data-slot="drawer-backdrop"
      {...props}
    />
  )
}

export type DrawerViewportProps = DrawerPrimitive.Viewport.Props & {
  position?: DrawerPosition
  variant?: "default" | "straight" | "inset"
}

export const DrawerViewport: React.FC<DrawerViewportProps> = ({
  className,
  position,
  variant = "default",
  ...props
}) => {
  return (
    <DrawerPrimitive.Viewport
      className={cn(
        "inset-0 fixed z-50 [--bleed:calc(var(--spacing)*12)] [--inset:calc(var(--spacing)*0)]",
        "touch-none",
        { "pt-12 grid grid-rows-[1fr_auto]": position === "bottom" },
        { "pb-12 grid grid-rows-[auto_1fr]": position === "top" },
        { "flex justify-start": position === "left" },
        { "flex justify-end": position === "right" },
        { "sm:[--inset:calc(var(--spacing)*4)] px-[--inset]": variant === "inset" },
        { "pt-[--inset]": variant === "inset" && position !== "bottom" },
        { "pb-[--inset]": variant === "inset" && position !== "top" },
        className,
      )}
      data-slot="drawer-viewport"
      {...props}
    />
  )
}

export type DrawerHeaderProps = useRender.ComponentProps<"div"> & {
  allowSelection?: boolean
}

export const DrawerHeader: React.FC<DrawerHeaderProps> = ({
  className,
  allowSelection = false,
  render,
  ...props
}) => {
  const defaultProps = {
    className: cn(
      `
        gap-2 p-6
        in-[[data-slot=drawer-popup]:has([data-slot=drawer-panel])]:pb-3
        max-sm:pb-4
        flex flex-col
      `,

      { "cursor-default": !allowSelection },
      className,
    ),
    "data-slot": "drawer-header",
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render: allowSelection ? <DrawerContent render={render} /> : render,
  })
}

export type DrawerFooterProps = useRender.ComponentProps<"div"> & {
  variant?: "default" | "bare"
  allowSelection?: boolean
}

export const DrawerFooter: React.FC<DrawerFooterProps> = ({
  className,
  variant = "default",
  allowSelection = true,
  render,
  ...props
}) => {
  const defaultProps = {
    className: cn(
      `
        gap-2 px-6
        sm:flex-row sm:justify-end
        flex flex-col-reverse pb-[env(safe-area-inset-bottom,0px)]
      `,

      { "cursor-default": !allowSelection },

      {
        "bg-muted/72 pt-4 border-t pb-[calc(env(safe-area-inset-bottom,0px)+var(--spacing)*4)]":
          variant === "default",
      },

      {
        [`
          in-[[data-slot=drawer-popup]:has([data-slot=drawer-panel])]:pt-3
          pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+var(--spacing)*6)]
        `]: variant === "bare",
      },

      className,
    ),

    "data-slot": "drawer-footer",
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render: allowSelection ? <DrawerContent render={render} /> : render,
  })
}

export type DrawerTitleProps = DrawerPrimitive.Title.Props & {}

export const DrawerTitle: React.FC<DrawerTitleProps> = ({ className, ...props }) => {
  return (
    <DrawerPrimitive.Title
      className={cn("font-semibold text-xl leading-none", className)}
      data-slot="drawer-title"
      {...props}
    />
  )
}

export type DrawerDescriptionProps = DrawerPrimitive.Description.Props & {}

export const DrawerDescription: React.FC<DrawerDescriptionProps> = ({ className, ...props }) => {
  return (
    <DrawerPrimitive.Description
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="drawer-description"
      {...props}
    />
  )
}

export type DrawerBarProps = useRender.ComponentProps<"div"> & {
  position?: DrawerPosition
}

export const DrawerBar: React.FC<DrawerBarProps> = ({
  className,
  position: positionProp,
  render,
  ...props
}) => {
  const { position: contextPosition } = useContext(DrawerContext)
  const position = positionProp ?? contextPosition
  const horizontal = position === "left" || position === "right"

  const defaultProps = {
    "aria-hidden": true as const,

    className: cn(
      `p-3 before:bg-input absolute flex touch-none items-center justify-center before:rounded-full`,

      {
        "inset-y-0 before:h-12 before:w-1": horizontal,
        "inset-x-0 before:h-1 before:w-12": !horizontal,
      },

      { "bottom-0": position === "top" },
      { "top-0": position === "bottom" },
      { "right-0": position === "left" },
      { "left-0": position === "right" },
      className,
    ),

    "data-slot": "drawer-bar",
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export const DrawerContent: typeof DrawerPrimitive.Content = DrawerPrimitive.Content

export type DrawerMenuProps = useRender.ComponentProps<"nav"> & {}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({ className, render, ...props }) => {
  const defaultProps = {
    className: cn("-m-2 flex flex-col", className),
    "data-slot": "drawer-menu",
  }

  return useRender({
    defaultTagName: "nav",
    props: mergeProps<"nav">(defaultProps, props),
    render,
  })
}

export type DrawerMenuItemProps = useRender.ComponentProps<"button"> & {
  variant?: "default" | "destructive"
}

export const DrawerMenuItem: React.FC<DrawerMenuItemProps> = ({
  className,
  variant = "default",
  render,
  disabled,
  ...props
}) => {
  const defaultProps = {
    className: cn(
      `
        min-h-9 gap-2 rounded-sm px-2 py-1 text-base text-foreground
        hover:bg-accent hover:text-accent-foreground
        data-[variant=destructive]:text-destructive-foreground
        sm:min-h-8 sm:text-sm
        [&>svg:not-[class*='size-']]:size-4.5
        sm:[&>svg:not-[class*='size-']]:size-4
        [&>svg]:-mx-0.5
        flex w-full cursor-default items-center outline-none select-none
        disabled:pointer-events-none disabled:opacity-64
        [&>svg]:pointer-events-none [&>svg]:shrink-0
        [&>svg:not-[class*='opacity-']]:opacity-80
      `,

      className,
    ),

    "data-slot": "drawer-menu-item",
    "data-variant": variant,
    disabled,
    type: "button" as const,
  }

  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(defaultProps, props),
    render,
  })
}

export type DrawerMenuSeparatorProps = useRender.ComponentProps<"div"> & {}

export const DrawerMenuSeparator: React.FC<DrawerMenuSeparatorProps> = ({
  className,
  render,
  ...props
}) => {
  const defaultProps = {
    className: cn("mx-2 my-1 bg-border h-px", className),
    "data-slot": "drawer-menu-separator",
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export type DrawerMenuGroupProps = useRender.ComponentProps<"div"> & {}

export const DrawerMenuGroup: React.FC<DrawerMenuGroupProps> = ({
  className,
  render,
  ...props
}) => {
  const defaultProps = {
    className: cn("flex flex-col", className),
    "data-slot": "drawer-menu-group",
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export type DrawerMenuGroupLabelProps = useRender.ComponentProps<"div"> & {}

export const DrawerMenuGroupLabel: React.FC<DrawerMenuGroupLabelProps> = ({
  className,
  render,
  ...props
}) => {
  const defaultProps = {
    className: cn("px-2 py-1.5 font-medium text-muted-foreground text-xs", className),
    "data-slot": "drawer-menu-group-label",
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export type DrawerMenuTriggerProps = DrawerPrimitive.Trigger.Props & {}

export const DrawerMenuTrigger: React.FC<DrawerMenuTriggerProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <DrawerTrigger
      className={cn(
        `
          min-h-9 gap-2 rounded-sm px-2 py-1 text-base text-foreground
          hover:bg-accent hover:text-accent-foreground
          sm:min-h-8 sm:text-sm
          [&_svg:not-[class*='size-']]:size-4.5
          sm:[&_svg:not-[class*='size-']]:size-4
          flex w-full cursor-default items-center outline-none select-none
          [&_svg]:pointer-events-none [&_svg]:shrink-0
        `,

        className,
      )}
      data-slot="drawer-menu-trigger"
      {...props}
    >
      {children}
      <ChevronRightIcon className="-me-0.5 ms-auto opacity-80" />
    </DrawerTrigger>
  )
}

export type DrawerMenuCheckboxItemProps = CheckboxPrimitive.Root.Props & {
  variant?: "default" | "switch"
  render?: React.ReactElement
}

export const DrawerMenuCheckboxItem: React.FC<DrawerMenuCheckboxItemProps> = ({
  className,
  children,
  checked,
  defaultChecked,
  onCheckedChange,
  variant = "default",
  disabled,
  render,
  ...props
}) => {
  return (
    <CheckboxPrimitive.Root
      checked={checked}
      className={cn(
        `
          min-h-9 gap-2 rounded-sm px-2 py-1 text-base text-foreground
          hover:bg-accent hover:text-accent-foreground
          sm:min-h-8 sm:text-sm
          [&_svg:not-[class*='size-']]:size-4.5
          sm:[&_svg:not-[class*='size-']]:size-4
          [&_svg]:-mx-0.5
          grid w-full cursor-default items-center outline-none select-none
          data-disabled:pointer-events-none data-disabled:opacity-64
          [&_svg]:pointer-events-none [&_svg]:shrink-0
          [&_svg:not-[class*='opacity-']]:opacity-80
        `,

        {
          "gap-4 pe-1.5 grid-cols-[1fr_auto]": variant === "switch",
          "pe-4 grid-cols-[1rem_1fr]": variant !== "switch",
        },

        className,
      )}
      data-slot="drawer-menu-checkbox-item"
      defaultChecked={defaultChecked}
      disabled={disabled}
      onCheckedChange={onCheckedChange}
      render={render}
      {...props}
    >
      {variant === "switch" ? (
        <>
          <span className="col-start-1">{children}</span>

          <CheckboxPrimitive.Indicator
            className={`
              focus-visible:ring-ring focus-visible:ring-offset-background
              data-checked:bg-primary
              data-unchecked:bg-input
              sm:[--thumb-size:calc(var(--spacing)*3)]
              col-start-2 inline-flex h-[calc(var(--thumb-size)+2px)]
              w-[calc(var(--thumb-size)*2-2px)] shrink-0 items-center rounded-full p-px
              inset-shadow-[0_1px_color-black/4%] transition-[background-color,box-shadow]
              duration-200 outline-none [--thumb-size:calc(var(--spacing)*4)]
              focus-visible:ring-2 focus-visible:ring-offset-1
              data-disabled:opacity-64
            `}
            keepMounted
          >
            <span
              className={`
                bg-background shadow-sm/5 pointer-events-none block aspect-square h-full origin-left
                rounded-[--thumb-size] will-change-transform
                [transition:translate_.15s,border-radius_.15s,scale_.1s_.1s,transform-origin_.15s]
                in-[[data-slot=drawer-menu-checkbox-item]:active]:rounded-[var(--thumb-size)/calc(var(--thumb-size)*1.10)]
                in-[[data-slot=drawer-menu-checkbox-item]:active]:not-data-disabled:scale-x-110
                in-[[data-slot=drawer-menu-checkbox-item][data-checked]]:origin-[var(--thumb-size)_50%]
                in-[[data-slot=drawer-menu-checkbox-item][data-checked]]:translate-x-[calc(var(--thumb-size)-4px)]
              `}
            />
          </CheckboxPrimitive.Indicator>
        </>
      ) : (
        <>
          <CheckboxPrimitive.Indicator className="col-start-1">
            <svg
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M5.252 12.7 10.2 18.63 18.748 5.37" />
            </svg>
          </CheckboxPrimitive.Indicator>

          <span className="col-start-2">{children}</span>
        </>
      )}
    </CheckboxPrimitive.Root>
  )
}

export type DrawerMenuRadioGroupProps = RadioGroupPrimitive.Props & {}

export const DrawerMenuRadioGroup: React.FC<DrawerMenuRadioGroupProps> = ({
  className,
  ...props
}) => {
  return (
    <RadioGroupPrimitive
      className={cn("flex flex-col", className)}
      data-slot="drawer-menu-radio-group"
      {...props}
    />
  )
}

export type DrawerMenuRadioItemProps = RadioPrimitive.Root.Props & {
  value: string
  render?: React.ReactElement
}

export const DrawerMenuRadioItem: React.FC<DrawerMenuRadioItemProps> = ({
  className,
  children,
  value,
  disabled,
  render,
  ...props
}) => {
  return (
    <RadioPrimitive.Root
      className={cn(
        `
          min-h-9 gap-2 rounded-sm px-2 py-1 text-base text-foreground
          hover:bg-accent hover:text-accent-foreground
          sm:min-h-8 sm:text-sm
          [&_svg:not-[class*='size-']]:size-4.5
          sm:[&_svg:not-[class*='size-']]:size-4
          [&_svg]:-mx-0.5
          grid w-full cursor-default items-center outline-none select-none
          data-disabled:pointer-events-none data-disabled:opacity-64
          [&_svg]:pointer-events-none [&_svg]:shrink-0
          [&_svg:not-[class*='opacity-']]:opacity-80
        `,

        "pe-4 grid-cols-[1rem_1fr] items-center",
        className,
      )}
      data-slot="drawer-menu-radio-item"
      disabled={disabled}
      render={render}
      value={value}
      {...props}
    >
      <RadioPrimitive.Indicator className="col-start-1">
        <svg
          fill="none"
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5.252 12.7 10.2 18.63 18.748 5.37" />
        </svg>
      </RadioPrimitive.Indicator>

      <span className="col-start-2">{children}</span>
    </RadioPrimitive.Root>
  )
}
