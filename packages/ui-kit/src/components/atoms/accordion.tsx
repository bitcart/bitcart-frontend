//* Originally ported from: https://ui.shadcn.com

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { cva } from "class-variance-authority"
import { createContext, useContext } from "react"

import { cn } from "@/utils"

const accordionItemVariants = cva("break-inside-avoid", {
  variants: {
    variant: {
      cards: "rounded-lg overflow-hidden border last:border-b",
      divided: "border-b last:border-b-0",
    },
  },
})

type AccordionVariant = "cards" | "divided"

const AccordionContext = createContext<{ variant: AccordionVariant }>({ variant: "cards" })

export type AccordionProps = AccordionPrimitive.Root.Props & {
  variant?: AccordionVariant
}

export const Accordion: React.FC<AccordionProps> = ({ variant = "cards", ...props }) => (
  <AccordionContext.Provider value={{ variant }}>
    <AccordionPrimitive.Root data-slot="accordion" data-variant={variant} {...props} />
  </AccordionContext.Provider>
)

export type AccordionItemProps = AccordionPrimitive.Item.Props & {}

export const AccordionItem: React.FC<AccordionItemProps> = ({ className, ...props }) => {
  const { variant } = useContext(AccordionContext)

  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(accordionItemVariants({ variant }), className)}
      {...props}
    />
  )
}

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
