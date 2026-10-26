import { cn } from "@bitcart/ui-kit/utils"

import { useCanOpenExternalLinks } from "../terminal"

type ExternalLinkProps = {
  href: string
  className?: string
  linkClassName?: string
  newTab?: boolean
  "aria-label"?: string
  children: React.ReactNode
}

//* A terminal's shell blocks navigation off the checkout's origin, so there the link is plain text.
export const ExternalLink = ({
  href,
  className,
  linkClassName,
  newTab = true,
  "aria-label": ariaLabel,
  children,
}: ExternalLinkProps) => {
  const canOpenExternalLinks = useCanOpenExternalLinks()

  if (!canOpenExternalLinks) {
    return <span className={className}>{children}</span>
  } else
    return (
      <a
        href={href}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noopener noreferrer" : undefined}
        aria-label={ariaLabel}
        className={cn(className, linkClassName)}
      >
        {children}
      </a>
    )
}
