//* Ported from: https://ui.shadcn.com

import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { CheckIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@/utils"

export const DropdownMenu = ({ ...props }: MenuPrimitive.Root.Props) => {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

export const DropdownMenuPortal = ({ ...props }: MenuPrimitive.Portal.Props) => {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
}

export const DropdownMenuTrigger = ({ ...props }: MenuPrimitive.Trigger.Props) => {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

export const DropdownMenuContent = ({
  className,
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<MenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) => {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            `
              bg-popover text-popover-foreground
              data-closed:fade-out-0
              data-open:fade-in-0
              data-closed:zoom-out-95
              data-open:zoom-in-95
              data-[side=bottom]:slide-in-from-top-2
              data-[side=left]:slide-in-from-right-2
              data-[side=right]:slide-in-from-left-2
              data-[side=top]:slide-in-from-bottom-2
              rounded-md p-2 shadow-md
              data-open:animate-in
              data-closed:animate-out
              z-50 max-h-[--available-height] min-w-[8rem] origin-[--transform-origin]
              overflow-x-hidden overflow-y-auto border
            `,

            className,
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

export const DropdownMenuGroup = ({ ...props }: MenuPrimitive.Group.Props) => {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

export type DropdownMenuItemProps = MenuPrimitive.Item.Props & {
  inset?: boolean
  variant?: "default" | "destructive"
}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  nativeButton: isNativeButton = true,
  inset,
  variant = "default",
  className,
  ...props
}) => {
  return (
    <MenuPrimitive.Item
      nativeButton={isNativeButton}
      className={cn(
        `
          focus:bg-muted/25 focus:text-accent-foreground
          font-medium
          data-[variant=destructive]:text-destructive-foreground
          data-[variant=destructive]:focus:bg-destructive/10
          data-[variant=destructive]:focus:text-destructive-foreground
          [&[data-variant=destructive]_svg]:text-destructive-foreground
          [&_svg:not-[class*='text-']]:text-muted-foreground
          gap-2 rounded-md px-2 py-2 text-sm
          data-[inset]:pl-8
          [&_svg:not-[class*='size-']]:size-4
          relative flex w-full cursor-pointer items-center outline-hidden transition-none
          select-none
          data-disabled:pointer-events-none data-disabled:opacity-50
          [&_svg]:pointer-events-none [&_svg]:shrink-0
        `,

        className,
      )}
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      {...props}
    />
  )
}

export const DropdownMenuCheckboxItem = ({
  className,
  children,
  checked,
  ...props
}: MenuPrimitive.CheckboxItem.Props) => {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        `
          focus:bg-accent focus:text-accent-foreground
          gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm
          [&_svg:not-[class*='size-']]:size-4
          relative flex cursor-default items-center outline-hidden select-none
          data-disabled:pointer-events-none data-disabled:opacity-50
          [&_svg]:pointer-events-none [&_svg]:shrink-0
        `,

        className,
      )}
      checked={checked}
      {...props}
    >
      <span
        className={"left-2 size-3.5 pointer-events-none absolute flex items-center justify-center"}
      >
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon className="size-4" />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>

      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

export const DropdownMenuRadioGroup = ({ ...props }: MenuPrimitive.RadioGroup.Props) => {
  return <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
}

export const DropdownMenuRadioItem = ({
  className,
  children,
  ...props
}: MenuPrimitive.RadioItem.Props) => {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        `
          focus:bg-accent focus:text-accent-foreground
          gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm
          [&_svg:not-[class*='size-']]:size-4
          relative flex cursor-default items-center outline-hidden select-none
          data-disabled:pointer-events-none data-disabled:opacity-50
          [&_svg]:pointer-events-none [&_svg]:shrink-0
        `,

        className,
      )}
      {...props}
    >
      <span
        className={"left-2 size-3.5 pointer-events-none absolute flex items-center justify-center"}
      >
        <MenuPrimitive.RadioItemIndicator>
          <CheckIcon className="size-4" />
        </MenuPrimitive.RadioItemIndicator>
      </span>

      {children}
    </MenuPrimitive.RadioItem>
  )
}

export const DropdownMenuLabel = ({
  className,
  inset,
  ...props
}: MenuPrimitive.GroupLabel.Props & {
  inset?: boolean
}) => {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn("px-2 py-1.5 text-sm font-medium data-[inset]:pl-8", className)}
      {...props}
    />
  )
}

export const DropdownMenuSeparator = ({ className, ...props }: MenuPrimitive.Separator.Props) => {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

export const DropdownMenuShortcut = ({ className, ...props }: React.ComponentProps<"span">) => {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn("text-muted-foreground text-xs tracking-widest ml-auto", className)}
      {...props}
    />
  )
}

export const DropdownMenuSub = ({ ...props }: MenuPrimitive.SubmenuRoot.Props) => {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />
}

export const DropdownMenuSubTrigger = ({
  className,
  inset,
  children,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean
}) => {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        `
          focus:bg-accent
          hover:bg-accent
          data-popup-open:bg-accent data-popup-open:text-accent-foreground
          data-open:bg-accent data-open:text-accent-foreground
          [&_svg:not-[class*='text-']]:text-muted-foreground
          gap-2 rounded-sm px-2 py-1.5 text-sm
          data-[inset]:pl-8
          [&_svg:not-[class*='size-']]:size-4
          flex cursor-default items-center outline-hidden select-none
          [&_svg]:pointer-events-none [&_svg]:shrink-0
        `,

        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="size-4 ml-auto" />
    </MenuPrimitive.SubmenuTrigger>
  )
}

export const DropdownMenuSubContent = ({
  className,
  align = "start",
  alignOffset = -3,
  side = "right",
  sideOffset = 0,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) => {
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        `
          rounded-md bg-popover p-1 text-popover-foreground shadow-lg ring-foreground/10 w-auto
          min-w-[96px] ring-1
        `,
        className,
      )}
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  )
}
