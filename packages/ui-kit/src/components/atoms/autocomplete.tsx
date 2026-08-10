//* Originally ported from: https://coss.com/ui

import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete"

import { cn } from "@/utils"

export const Autocomplete: typeof AutocompletePrimitive.Root = AutocompletePrimitive.Root

export type AutocompleteCollectionProps = AutocompletePrimitive.Collection.Props & {}

export const AutocompleteCollection: React.FC<AutocompleteCollectionProps> = ({ ...props }) => {
  return <AutocompletePrimitive.Collection data-slot="autocomplete-collection" {...props} />
}

export type AutocompleteEmptyProps = AutocompletePrimitive.Empty.Props & {}

export const AutocompleteEmpty: React.FC<AutocompleteEmptyProps> = ({ className, ...props }) => {
  return (
    <AutocompletePrimitive.Empty
      className={cn(
        "not-empty:p-2 text-base text-muted-foreground sm:text-sm text-center",
        className,
      )}
      data-slot="autocomplete-empty"
      {...props}
    />
  )
}

export type AutocompleteGroupProps = AutocompletePrimitive.Group.Props & {}

export const AutocompleteGroup: React.FC<AutocompleteGroupProps> = ({ className, ...props }) => {
  return (
    <AutocompletePrimitive.Group
      className={cn("[[role=group]+&]:mt-1.5", className)}
      data-slot="autocomplete-group"
      {...props}
    />
  )
}

export type AutocompleteGroupLabelProps = AutocompletePrimitive.GroupLabel.Props & {}

export const AutocompleteGroupLabel: React.FC<AutocompleteGroupLabelProps> = ({
  className,
  ...props
}) => {
  return (
    <AutocompletePrimitive.GroupLabel
      className={cn("px-2 py-1.5 font-medium text-muted-foreground text-xs", className)}
      data-slot="autocomplete-group-label"
      {...props}
    />
  )
}

export type AutocompleteItemProps = AutocompletePrimitive.Item.Props & {}

export const AutocompleteItem: React.FC<AutocompleteItemProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <AutocompletePrimitive.Item
      className={cn(
        `
          min-h-8 rounded-sm px-2 py-1 text-base
          data-highlighted:bg-accent data-highlighted:text-accent-foreground
          sm:min-h-7 sm:text-sm
          flex cursor-default items-center outline-none select-none
          data-disabled:pointer-events-none data-disabled:opacity-64
        `,

        className,
      )}
      data-slot="autocomplete-item"
      {...props}
    >
      {children}
    </AutocompletePrimitive.Item>
  )
}

export type AutocompleteRowProps = AutocompletePrimitive.Row.Props & {}

export const AutocompleteRow: React.FC<AutocompleteRowProps> = ({ className, ...props }) => {
  return <AutocompletePrimitive.Row className={className} data-slot="autocomplete-row" {...props} />
}

export type AutocompleteSeparatorProps = AutocompletePrimitive.Separator.Props & {}

export const AutocompleteSeparator: React.FC<AutocompleteSeparatorProps> = ({
  className,
  ...props
}) => {
  return (
    <AutocompletePrimitive.Separator
      className={cn("mx-2 my-1 bg-border h-px last:hidden", className)}
      data-slot="autocomplete-separator"
      {...props}
    />
  )
}

export type AutocompleteStatusProps = AutocompletePrimitive.Status.Props & {}

export const AutocompleteStatus: React.FC<AutocompleteStatusProps> = ({ className, ...props }) => {
  return (
    <AutocompletePrimitive.Status
      className={cn(
        "px-3 py-2 font-medium text-muted-foreground text-xs empty:m-0 empty:p-0",
        className,
      )}
      data-slot="autocomplete-status"
      {...props}
    />
  )
}

export type AutocompleteTriggerProps = AutocompletePrimitive.Trigger.Props & {}

export const AutocompleteTrigger: React.FC<AutocompleteTriggerProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <AutocompletePrimitive.Trigger
      className={className}
      data-slot="autocomplete-trigger"
      {...props}
    >
      {children}
    </AutocompletePrimitive.Trigger>
  )
}

export type AutocompleteValueProps = AutocompletePrimitive.Value.Props & {}

export const AutocompleteValue: React.FC<AutocompleteValueProps> = ({ ...props }) => {
  return <AutocompletePrimitive.Value data-slot="autocomplete-value" {...props} />
}
