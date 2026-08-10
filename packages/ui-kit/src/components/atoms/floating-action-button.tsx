import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

/**
 * Floating Action Button.
 *
 * Mostly based on Material 3 specs, but with some modifications
 * inspired by Liquid Glass and its glass-like predecessors.
 *
 * @see https://m3.material.io/components/floating-action-button/specs
 */
const floatingActionButtonVariants = cva(
  `
    not-active:glassy
    text-foreground
    focus-visible:outline-ring focus-visible:ring-ring focus-visible:border-ring
    border-input/80 elevation-2 shadow-foreground/25 border-b-none
    active:bg-background
    disabled:text-muted-foreground disabled:shadow-foreground/15
    flex shrink-0 cursor-pointer items-center justify-center border-1 transition-all duration-200
    outline-none
    focus-visible:border-none focus-visible:ring-3 focus-visible:outline-2
    active:border-none
    disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-none
    [&_svg]:pointer-events-none [&_svg]:shrink-0
  `,

  {
    variants: {
      size: {
        sm: "size-14 [&_svg]:size-6 rounded-4",
        default: "size-20 [&_svg]:size-7 rounded-5",
      },
    },

    defaultVariants: {
      size: "default",
    },
  },
)

export type FloatingActionButtonProps = Pick<
  ButtonPrimitive.Props,
  "children" | "className" | "disabled"
> &
  VariantProps<typeof floatingActionButtonVariants> & {}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  size,
  className,
  ...props
}) => {
  return (
    <ButtonPrimitive
      className={floatingActionButtonVariants({ size, className })}
      data-slot="button"
      {...props}
    />
  )
}
