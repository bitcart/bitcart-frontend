import { ToggleGroup, type ToggleGroupProps } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"

export const PreviewToggleGroup = ({ className, ...props }: ToggleGroupProps) => (
  <ToggleGroup
    variant="outline"
    className={cn("gap-1 [&>*]:ml-0! [&>*]:rounded-md! max-w-full flex-wrap", className)}
    {...props}
  />
)
