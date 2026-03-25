//* Ported from: https://coss.com/ui

import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete"

import { cn } from "@/utils"

import { ScrollArea } from "./scroll-area"

export type AutocompleteListProps = AutocompletePrimitive.List.Props & {}

export const AutocompleteList: React.FC<AutocompleteListProps> = ({ className, ...props }) => {
  return (
    <ScrollArea scrollbarGutter scrollFade>
      <AutocompletePrimitive.List
        className={cn("not-empty:scroll-py-1 not-empty:p-1 in-data-has-overflow-y:pe-3", className)}
        data-slot="autocomplete-list"
        {...props}
      />
    </ScrollArea>
  )
}
