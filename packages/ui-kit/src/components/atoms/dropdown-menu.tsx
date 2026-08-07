//* Ported from: https://ui.shadcn.com

import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { cn } from "@/utils"

export type DropdownMenuProps = MenuPrimitive.Root.Props & {}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ ...props }) => {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

export type DropdownMenuPortalProps = MenuPrimitive.Portal.Props & {}

export const DropdownMenuPortal: React.FC<DropdownMenuPortalProps> = ({ ...props }) => {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
}

export type DropdownMenuBackdropProps = MenuPrimitive.Backdrop.Props & {}

export const DropdownMenuBackdrop: React.FC<DropdownMenuBackdropProps> = ({
  className,
  ...props
}) => {
  return (
    <MenuPrimitive.Backdrop
      className={cn(
        `
          inset-0 bg-black/32 absolute z-50 transition-opacity duration-450
          ease-[cubic-bezier(0.32,0.72,0,1)]
          data-[ending-style]:opacity-0
          data-[starting-style]:opacity-0
        `,

        className,
      )}
      data-slot="dropdown-menu-backdrop"
      {...props}
    />
  )
}

export type DropdownMenuTriggerProps = MenuPrimitive.Trigger.Props & {}

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({ ...props }) => {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

export type DropdownMenuGroupProps = MenuPrimitive.Group.Props & {}

export const DropdownMenuGroup: React.FC<DropdownMenuGroupProps> = ({ className, ...props }) => {
  return (
    <MenuPrimitive.Group
      data-slot="dropdown-menu-group"
      className={cn("gap-1 flex flex-col", className)}
      {...props}
    />
  )
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

export type DropdownMenuRadioGroupProps = MenuPrimitive.RadioGroup.Props & {}

export const DropdownMenuRadioGroup: React.FC<DropdownMenuRadioGroupProps> = ({ ...props }) => {
  return <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
}

export type DropdownMenuLabelProps = MenuPrimitive.GroupLabel.Props & {
  inset?: boolean
}

export const DropdownMenuLabel: React.FC<DropdownMenuLabelProps> = ({
  className,
  inset,
  ...props
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

export type DropdownMenuSeparatorProps = MenuPrimitive.Separator.Props & {}

export const DropdownMenuSeparator: React.FC<DropdownMenuSeparatorProps> = ({
  className,
  ...props
}) => {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

export type DropdownMenuShortcutProps = React.ComponentProps<"span"> & {}

export const DropdownMenuShortcut: React.FC<DropdownMenuShortcutProps> = ({
  className,
  ...props
}) => {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn("text-muted-foreground text-xs tracking-widest ml-auto", className)}
      {...props}
    />
  )
}

export type DropdownMenuSubProps = MenuPrimitive.SubmenuRoot.Props & {}

export const DropdownMenuSub: React.FC<DropdownMenuSubProps> = ({ ...props }) => {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />
}
