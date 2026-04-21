//* Ported from: https://ui.shadcn.com

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"

import { cn } from "@/utils"

export type AccordionProps = AccordionPrimitive.Root.Props & {}

export const Accordion: React.FC<AccordionProps> = (props) => (
  <AccordionPrimitive.Root data-slot="accordion" {...props} />
)

export type AccordionItemProps = AccordionPrimitive.Item.Props & {}

export const AccordionItem: React.FC<AccordionItemProps> = ({ className, ...props }) => (
  <AccordionPrimitive.Item
    data-slot="accordion-item"
    className={cn("rounded-lg break-inside-avoid overflow-hidden border last:border-b", className)}
    {...props}
  />
)

export type AccordionContentProps = AccordionPrimitive.Panel.Props & {}

export const AccordionContent: React.FC<AccordionContentProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className={cn(`
        ease-out
        data-[ending-style]:h-0
        data-[starting-style]:h-0
        text-sm transition-height h-[--accordion-panel-height] overflow-hidden
      `)}
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Panel>
  )
}
