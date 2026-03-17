import { Command as CommandPrimitive } from "cmdk"

import { cn } from "@/utils"

export const Command: React.FC<React.ComponentProps<typeof CommandPrimitive>> = ({
  className,
  ...props
}) => (
  <CommandPrimitive
    data-slot="command"
    className={cn(
      "bg-popover text-popover-foreground rounded-md flex size-full flex-col overflow-hidden",
      className,
    )}
    {...props}
  />
)

export const CommandList: React.FC<React.ComponentProps<typeof CommandPrimitive.List>> = ({
  className,
  ...props
}) => (
  <CommandPrimitive.List
    data-slot="command-list"
    className={cn("scroll-py-1 max-h-[300px] overflow-x-hidden overflow-y-auto", className)}
    {...props}
  />
)

export const CommandEmpty: React.FC<React.ComponentProps<typeof CommandPrimitive.Empty>> = ({
  ...props
}) => (
  <CommandPrimitive.Empty
    data-slot="command-empty"
    className="py-6 text-sm text-center"
    {...props}
  />
)

export const CommandGroup: React.FC<React.ComponentProps<typeof CommandPrimitive.Group>> = ({
  className,
  ...props
}) => (
  <CommandPrimitive.Group
    data-slot="command-group"
    className={cn(
      `
        text-foreground p-1
        [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2
        [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs
        [&_[cmdk-group-heading]]:font-medium
        overflow-hidden
      `,

      className,
    )}
    {...props}
  />
)

export const CommandSeparator: React.FC<
  React.ComponentProps<typeof CommandPrimitive.Separator>
> = ({ className, ...props }) => (
  <CommandPrimitive.Separator
    data-slot="command-separator"
    className={cn("bg-border -mx-1 h-px", className)}
    {...props}
  />
)

export const CommandItem: React.FC<React.ComponentProps<typeof CommandPrimitive.Item>> = ({
  className,
  ...props
}) => (
  <CommandPrimitive.Item
    data-slot="command-item"
    className={cn(
      `
        data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground
        [&_svg:not-[class*='text-']]:text-muted-foreground
        gap-2 rounded-sm px-2 py-1.5 text-sm
        [&_svg:not-[class*='size-']]:size-4
        relative flex cursor-default items-center outline-hidden select-none
        data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50
        [&_svg]:pointer-events-none [&_svg]:shrink-0
      `,

      className,
    )}
    {...props}
  />
)

export const CommandShortcut: React.FC<React.ComponentProps<"span">> = ({
  className,
  ...props
}) => (
  <span
    data-slot="command-shortcut"
    className={cn("text-muted-foreground text-xs tracking-widest ml-auto", className)}
    {...props}
  />
)
