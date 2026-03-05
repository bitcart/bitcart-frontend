import { Accordion as AccordionPrimitive } from "radix-ui"

import { cn } from "@/utils"

export type AccordionProps = React.ComponentProps<typeof AccordionPrimitive.Root> & {}

export const Accordion: React.FC<AccordionProps> = (props) => (
  <AccordionPrimitive.Root data-slot="accordion" {...props} />
)

export type AccordionItemProps = React.ComponentProps<typeof AccordionPrimitive.Item> & {}

export const AccordionItem: React.FC<AccordionItemProps> = ({ className, ...props }) => (
  <AccordionPrimitive.Item
    data-slot="accordion-item"
    className={cn("border-b last:border-b-0", className)}
    {...props}
  />
)

export type AccordionContentProps = React.ComponentProps<typeof AccordionPrimitive.Content> & {}

export const AccordionContent: React.FC<AccordionContentProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="
        data-[state=closed]:animate-accordion-up
        data-[state=open]:animate-accordion-down
        text-sm overflow-hidden
      "
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}
