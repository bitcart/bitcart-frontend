//* Ported from: https://coss.com/ui

import { SearchIcon } from "lucide-react"

import { cn } from "@/utils"

import { AutocompleteInput, type AutocompleteInputProps } from "./autocomplete-input"

export type CommandInputProps = AutocompleteInputProps & {}

export const CommandInput: React.FC<CommandInputProps> = ({ className, placeholder, ...props }) => {
  return (
    <div className="p-2.5">
      <AutocompleteInput
        className={cn(
          "border-transparent! bg-transparent! shadow-none before:hidden has-focus-visible:ring-0",
          className,
        )}
        placeholder={placeholder}
        startAddon={<SearchIcon />}
        {...props}
      />
    </div>
  )
}
