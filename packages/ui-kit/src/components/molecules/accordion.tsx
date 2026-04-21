//* Ported from: https://ui.shadcn.com

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/utils"

const defaultChevronElement = (
  <ChevronDownIcon
    className={cn(`
      chevron text-muted-foreground size-4
      sm:size-5
      pointer-events-none shrink-0 transition-transform duration-200
    `)}
  />
)

export type AccordionTriggerProps = AccordionPrimitive.Trigger.Props & {
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
            gap-4 rounded-lg py-4 text-sm font-medium flex flex-1 items-start justify-between
            text-left transition-all outline-none
            focus-visible:ring-[3px] focus-visible:ring-inset
            disabled:pointer-events-none disabled:opacity-50
            [&[aria-expanded=true]_svg.chevron]:rotate-180
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
