import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/utils"

export type CheckboxProps = CheckboxPrimitive.Root.Props & {}

export const Checkbox: React.FC<CheckboxProps> = ({ className, ...props }) => {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        `
          peer border-input size-4 shadow-xs
          dark:bg-input/30
          data-checked:bg-primary data-checked:text-primary-foreground data-checked:border-primary
          dark:data-checked:bg-primary
          focus-visible:border-ring focus-visible:ring-ring/50
          aria-invalid:ring-destructive/20 aria-invalid:border-destructive
          dark:aria-invalid:ring-destructive/40
          rounded-sm flex shrink-0 items-center justify-center border transition-shadow outline-none
          focus-visible:ring-2
          disabled:cursor-not-allowed disabled:opacity-50
        `,

        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
