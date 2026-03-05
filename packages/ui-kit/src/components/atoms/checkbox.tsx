import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/utils"

export type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root> & {}

export const Checkbox: React.FC<CheckboxProps> = ({ className, ...props }) => {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        `
          peer border-input size-4 shadow-xs
          dark:bg-input/30
          data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground
          data-[state=checked]:border-primary
          dark:data-[state=checked]:bg-primary
          focus-visible:border-ring focus-visible:ring-ring/50
          aria-invalid:ring-destructive/20 aria-invalid:border-destructive
          dark:aria-invalid:ring-destructive/40
          shrink-0 rounded-[4px] border transition-shadow outline-none
          focus-visible:ring-[3px]
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
