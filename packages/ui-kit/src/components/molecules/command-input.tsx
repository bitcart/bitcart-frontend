import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon } from "lucide-react"

import { cn } from "@/utils"

export const CommandInput: React.FC<React.ComponentProps<typeof CommandPrimitive.Input>> = ({
  className,
  ...props
}) => (
  <div data-slot="command-input-wrapper" className="h-9 gap-2 px-3 flex items-center border-b">
    <SearchIcon className="size-4 shrink-0 opacity-50" />

    <CommandPrimitive.Input
      data-slot="command-input"
      className={cn(
        `
          placeholder:text-muted-foreground
          h-10 rounded-md py-3 text-sm flex w-full bg-transparent outline-hidden
          disabled:cursor-not-allowed disabled:opacity-50
        `,

        className,
      )}
      {...props}
    />
  </div>
)
