import type { HttpHref, InternalHref, MailtoHref } from "@bitcart/core/types"
import { type VariantProps } from "class-variance-authority"
import { createElement } from "react"

import { useLinkComponent } from "@/hooks"
import { cn, getTargetBlankA11yHint } from "@/utils"

import { buttonVariants } from "./button-variants"

export type LinkButtonProps = VariantProps<typeof buttonVariants> &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> &
  (
    | { href: InternalHref | MailtoHref; isExternalLink?: false }
    | { href: HttpHref; isExternalLink: true }
  ) & {
    expandOnHover?: boolean
    isExternalLink?: boolean
  }

export const LinkButton: React.FC<LinkButtonProps> = ({
  expandOnHover = false,
  isExternalLink = false,
  size,
  variant,
  className,
  href,
  children,
  ...props
}) => {
  const Link = useLinkComponent()

  const a11yAwareLinkProps = isExternalLink
    ? { href: href as HttpHref, a11yHint: getTargetBlankA11yHint() }
    : { href: href as InternalHref | MailtoHref }

  return createElement(
    Link,

    {
      className: cn(buttonVariants({ variant, size }), className, {
        "sm:hover:scale-105 hover:scale-102": expandOnHover,
      }),

      ...props,
      ...a11yAwareLinkProps,
    },

    children,
  )
}
