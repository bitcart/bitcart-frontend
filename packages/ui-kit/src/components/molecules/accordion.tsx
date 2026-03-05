import { ChevronDownIcon } from "lucide-react"
import { Accordion as AccordionPrimitive } from "radix-ui"

import { cn } from "@/utils"

const defaultChevronElement = (
  <ChevronDownIcon
    className={`
      chevron text-muted-foreground size-4
      sm:size-5
      pointer-events-none shrink-0 transition-transform duration-200
    `}
  />
)

export type AccordionTriggerProps = React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
  chevronElement?: React.ReactElement
  underlineOnHover?: boolean
}

export const AccordionTrigger = ({
  chevronElement = defaultChevronElement,
  underlineOnHover = false,
  className,
  children,
  ...props
}: AccordionTriggerProps) => {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          `
            focus-visible:border-ring focus-visible:ring-ring/50
            gap-4 rounded-md py-4 text-sm font-medium flex flex-1 items-start justify-between
            text-left transition-all outline-none
            focus-visible:ring-[3px]
            disabled:pointer-events-none disabled:opacity-50
            [&[data-state=open]_svg.chevron]:rotate-180
          `,

          { "hover:underline": underlineOnHover },
          className,
        )}
        {...props}
      >
        {children}

        {chevronElement}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}
