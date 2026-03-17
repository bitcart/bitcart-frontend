import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/utils"

import { badgeVariants } from "./badge-variants"

export type BadgeProps = useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>

export const Badge: React.FC<BadgeProps> = ({ className, variant, render, ...props }) => {
  const element = useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })

  return element
}
