import type { ActionDescriptor } from "@/types"
import { cn } from "@/utils"

import { Button } from "../atoms/button"
import { LinkButton } from "../atoms/link-button"

export type CtaButtonProps = ActionDescriptor & {
  isPrimaryAction?: boolean
  className?: string
}

/**
 * An {@link ActionDescriptor} rendered as a call-to-action button. Styled for a surface filled
 * with `primary`, which is why the leading action takes the inverted variant.
 */
export const CtaButton: React.FC<CtaButtonProps> = ({
  label,
  icons,
  isPrimaryAction = false,
  className,
  ...props
}) => {
  const commonProps = {
    expandOnHover: true,
    size: "xl",
    variant: isPrimaryAction ? "white" : "default",
    className: cn(
      `
        group
        focus-visible:border-primary-foreground focus-visible:outline-primary-foreground
        focus-visible:ring-primary-foreground/90 focus-visible:ring-offset-primary
        focus-visible:ring-offset-2
      `,

      {
        "elevation-3": isPrimaryAction,

        [`
          border-primary-foreground text-primary-foreground
          hover:bg-primary-foreground/15
          focus:bg-primary-foreground/15
          border-2 bg-transparent
        `]: !isPrimaryAction,
      },

      className,
    ),

    children: (
      <>
        {icons?.left && <icons.left />}
        <span>{label}</span>
        {icons?.right && <icons.right className="group-hover:translate-x-1 transition-transform" />}
      </>
    ),
  } as const

  if ("href" in props) {
    return <LinkButton {...commonProps} href={props.href} />
  } else {
    return <Button {...commonProps} onClick={props.callback} />
  }
}
