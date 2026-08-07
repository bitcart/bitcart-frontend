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

export type CommandProps = React.ComponentProps<typeof Autocomplete> & {}

export const Command: React.FC<CommandProps> = ({
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

export type CommandCollectionProps = React.ComponentProps<typeof AutocompleteCollection> & {}

export const CommandCollection: React.FC<CommandCollectionProps> = ({ ...props }) => {
  return <AutocompleteCollection data-slot="command-collection" {...props} />
}

export const CommandCreateHandle: typeof CommandDialogPrimitive.createHandle =
  CommandDialogPrimitive.createHandle

export const CommandDialog: typeof CommandDialogPrimitive.Root = CommandDialogPrimitive.Root

export type CommandDialogBackdropProps = CommandDialogPrimitive.Backdrop.Props & {}

export const CommandDialogBackdrop: React.FC<CommandDialogBackdropProps> = ({
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

export type CommandDialogTriggerProps = CommandDialogPrimitive.Trigger.Props & {}

export const CommandDialogTrigger: React.FC<CommandDialogTriggerProps> = (props) => {
  return <CommandDialogPrimitive.Trigger data-slot="command-dialog-trigger" {...props} />
}

export type CommandDialogViewportProps = CommandDialogPrimitive.Viewport.Props & {}

export const CommandDialogViewport: React.FC<CommandDialogViewportProps> = ({
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

export type CommandEmptyProps = React.ComponentProps<typeof AutocompleteEmpty> & {}

export const CommandEmpty: React.FC<CommandEmptyProps> = ({ className, ...props }) => {
  return (
    <AutocompleteEmpty
      className={cn("not-empty:py-6", className)}
      data-slot="command-empty"
      {...props}
    />
  )
}

export type CommandFooterProps = React.ComponentProps<"div"> & {}

export const CommandFooter: React.FC<CommandFooterProps> = ({ className, ...props }) => {
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

export type CommandGroupProps = React.ComponentProps<typeof AutocompleteGroup> & {}

export const CommandGroup: React.FC<CommandGroupProps> = ({ className, ...props }) => {
  return <AutocompleteGroup className={className} data-slot="command-group" {...props} />
}

export type CommandGroupLabelProps = React.ComponentProps<typeof AutocompleteGroupLabel> & {}

export const CommandGroupLabel: React.FC<CommandGroupLabelProps> = ({ className, ...props }) => {
  return <AutocompleteGroupLabel className={className} data-slot="command-group-label" {...props} />
}

export type CommandItemProps = React.ComponentProps<typeof AutocompleteItem> & {}

export const CommandItem: React.FC<CommandItemProps> = ({ className, ...props }) => {
  return (
    <AutocompleteItem className={cn("py-1.5", className)} data-slot="command-item" {...props} />
  )
}

export type CommandPanelProps = React.ComponentProps<"div"> & {}

export const CommandPanel: React.FC<CommandPanelProps> = ({ className, ...props }) => {
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

export type CommandSeparatorProps = React.ComponentProps<typeof AutocompleteSeparator> & {}

export const CommandSeparator: React.FC<CommandSeparatorProps> = ({ className, ...props }) => {
  return (
    <AutocompleteSeparator
      className={cn("my-2", className)}
      data-slot="command-separator"
      {...props}
    />
  )
}

export type CommandShortcutProps = React.ComponentProps<"kbd"> & {}

export const CommandShortcut: React.FC<CommandShortcutProps> = ({ className, ...props }) => {
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
