//* Ported from: https://ui.shadcn.com

import { Menu as MenuPrimitive } from "@base-ui/react/menu"

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

export const DropdownMenuRadioGroup = ({ ...props }: MenuPrimitive.RadioGroup.Props) => {
  return <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
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
