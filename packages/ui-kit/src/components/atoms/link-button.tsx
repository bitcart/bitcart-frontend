import {
  getDestinationTypeAwareLinkProps,
  isHttpHref,
  type HttpHref,
  type InternalHref,
  type MailtoHref,
} from "@bitcart/core/navigation"
import { useLingui } from "@lingui/react"
import { type VariantProps } from "class-variance-authority"
import { createElement } from "react"

import { useLayoutContext } from "@/hooks"
import { cn, getTargetBlankA11yHint } from "@/utils"

import { buttonVariants } from "./button-variants"

export type LinkButtonProps = VariantProps<typeof buttonVariants> &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: InternalHref | HttpHref | MailtoHref
    disabled?: boolean
    expandOnHover?: boolean
    isOriginAware?: boolean
  }

export const LinkButton: React.FC<LinkButtonProps> = ({
  disabled = false,
  expandOnHover = false,
  isOriginAware = true,
  size,
  variant,
  className,
  href,
  children,
  ...props
}) => {
  const { Link } = useLayoutContext()
  const { i18n } = useLingui()

  const linkProps = {
    ...getDestinationTypeAwareLinkProps({ href, isOriginAware }),
    ...props,
  }

  const a11yAwareLinkProps = isHttpHref(href)
    ? { href, a11yHint: getTargetBlankA11yHint(i18n) }
    : { href }

  const disabledProps = disabled ? { "aria-disabled": true, tabIndex: -1 } : {}

  return createElement(
    Link,

    {
      className: cn(
        buttonVariants({ variant, size }),

        {
          //* Anchors can't be `:disabled`, so the CVA `disabled:*` styles never match
          "sm:hover:scale-105 hover:scale-102": expandOnHover && !disabled,
          "pointer-events-none cursor-not-allowed opacity-50": disabled,
        },

        className,
      ),

      ...linkProps,
      ...a11yAwareLinkProps,
      ...disabledProps,
    },

    children,
  )
}
