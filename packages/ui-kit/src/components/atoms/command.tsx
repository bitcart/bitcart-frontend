//* Ported from: https://coss.com/ui

import { Dialog as CommandDialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/utils"

import {
  Autocomplete,
  AutocompleteCollection,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteItem,
  AutocompleteSeparator,
} from "./autocomplete"

export const Command: React.FC<React.ComponentProps<typeof Autocomplete>> = ({
  autoHighlight = "always",
  keepHighlight = true,
  ...props
}) => {
  return (
    <Autocomplete
      autoHighlight={autoHighlight}
      inline
      keepHighlight={keepHighlight}
      open
      {...props}
    />
  )
}

export const CommandCollection: React.FC<React.ComponentProps<typeof AutocompleteCollection>> = ({
  ...props
}) => {
  return <AutocompleteCollection data-slot="command-collection" {...props} />
}

export const CommandCreateHandle: typeof CommandDialogPrimitive.createHandle =
  CommandDialogPrimitive.createHandle

export const CommandDialog: typeof CommandDialogPrimitive.Root = CommandDialogPrimitive.Root

export const CommandDialogBackdrop: React.FC<CommandDialogPrimitive.Backdrop.Props> = ({
  className,
  ...props
}) => {
  return (
    <CommandDialogPrimitive.Backdrop
      className={cn(
        `
          inset-0 bg-black/32 backdrop-blur-sm fixed z-50 transition-all duration-200
          data-ending-style:opacity-0
          data-starting-style:opacity-0
        `,

        className,
      )}
      data-slot="command-dialog-backdrop"
      {...props}
    />
  )
}

export const CommandDialogPortal: typeof CommandDialogPrimitive.Portal =
  CommandDialogPrimitive.Portal

export const CommandDialogTrigger: React.FC<CommandDialogPrimitive.Trigger.Props> = (props) => {
  return <CommandDialogPrimitive.Trigger data-slot="command-dialog-trigger" {...props} />
}

export const CommandDialogViewport: React.FC<CommandDialogPrimitive.Viewport.Props> = ({
  className,
  ...props
}) => {
  return (
    <CommandDialogPrimitive.Viewport
      className={cn(
        `
          inset-0 px-4
          sm:py-[10vh]
          fixed z-50 flex flex-col items-center py-[max(calc(var(--spacing)*4),4vh)]
        `,

        className,
      )}
      data-slot="command-dialog-viewport"
      {...props}
    />
  )
}

export const CommandEmpty: React.FC<React.ComponentProps<typeof AutocompleteEmpty>> = ({
  className,
  ...props
}) => {
  return (
    <AutocompleteEmpty
      className={cn("not-empty:py-6", className)}
      data-slot="command-empty"
      {...props}
    />
  )
}

export const CommandFooter: React.FC<React.ComponentProps<"div">> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        `
          gap-2 px-5 py-3 text-muted-foreground text-xs flex items-center justify-between
          rounded-b-[calc(var(--radius-2xl)-1px)] border-t
        `,

        className,
      )}
      data-slot="command-footer"
      {...props}
    />
  )
}

export const CommandGroup: React.FC<React.ComponentProps<typeof AutocompleteGroup>> = ({
  className,
  ...props
}) => {
  return <AutocompleteGroup className={className} data-slot="command-group" {...props} />
}

export const CommandGroupLabel: React.FC<React.ComponentProps<typeof AutocompleteGroupLabel>> = ({
  className,
  ...props
}) => {
  return <AutocompleteGroupLabel className={className} data-slot="command-group-label" {...props} />
}

export const CommandItem: React.FC<React.ComponentProps<typeof AutocompleteItem>> = ({
  className,
  ...props
}) => {
  return (
    <AutocompleteItem className={cn("py-1.5", className)} data-slot="command-item" {...props} />
  )
}

export const CommandPanel: React.FC<React.ComponentProps<"div">> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        `
          min-h-0 rounded-t-lg
          not-has-[+[data-slot=command-footer]]:rounded-b-lg
          bg-popover shadow-xs/5
          before:inset-0
          **:data-[slot=scroll-area-scrollbar]:mt-2
          relative -mx-px border border-b-0 bg-clip-padding [clip-path:inset(0_1px)]
          not-has-[+[data-slot=command-footer]]:-mb-px
          not-has-[+[data-slot=command-footer]]:[clip-path:inset(0_1px_1px_1px_round_0_0_calc(var(--radius-2xl)-1px)_calc(var(--radius-2xl)-1px))]
          before:pointer-events-none before:absolute before:rounded-t-[calc(var(--radius-xl)-1px)]
        `,

        className,
      )}
      {...props}
    />
  )
}

export const CommandSeparator: React.FC<React.ComponentProps<typeof AutocompleteSeparator>> = ({
  className,
  ...props
}) => {
  return (
    <AutocompleteSeparator
      className={cn("my-2", className)}
      data-slot="command-separator"
      {...props}
    />
  )
}

export const CommandShortcut: React.FC<React.ComponentProps<"kbd">> = ({ className, ...props }) => {
  return (
    <kbd
      className={cn(
        "font-medium font-sans text-muted-foreground/72 text-xs tracking-widest ms-auto",
        className,
      )}
      data-slot="command-shortcut"
      {...props}
    />
  )
}
