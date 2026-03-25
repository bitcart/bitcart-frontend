//* Ported from: https://coss.com/ui

import { cn } from "@/utils"

import { AutocompleteList, type AutocompleteListProps } from "./autocomplete-list"

export type CommandListProps = AutocompleteListProps & {}

export const CommandList: React.FC<CommandListProps> = ({ className, ...props }) => {
  return (
    <AutocompleteList
      className={cn("not-empty:scroll-py-2 not-empty:p-2", className)}
      data-slot="command-list"
      {...props}
    />
  )
}
