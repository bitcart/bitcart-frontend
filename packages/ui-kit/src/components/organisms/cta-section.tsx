import { useId } from "react"

import type { ActionDescriptor } from "@/types"
import { cn } from "@/utils"

import { CtaButton } from "../molecules/cta-button"

export type CtaSectionProps = {
  /**
   * Anchor target for the section heading. Falls back to a generated identifier,
   * which makes it unreachable by URL fragment.
   */
  anchorId?: string

  title: string
  description: React.ReactNode

  actions: {
    primary: ActionDescriptor
    secondary?: ActionDescriptor
  }

  footnote?: React.ReactNode
  className?: string
}

export const CtaSection: React.FC<CtaSectionProps> = ({
  anchorId,
  title,
  description,
  actions,
  footnote,
  className,
}) => {
  const fallbackAnchorId = useId()
  const headingId = anchorId ?? fallbackAnchorId

  return (
    <section
      aria-labelledby={headingId}
      className={cn("py-12 sm:py-20 from-primary to-primary/80 bg-linear-to-r", className)}
    >
      <div className="max-w-4xl px-4 md:px-6 lg:px-8 mx-auto text-center">
        <h2
          id={headingId}
          className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4 sm:mb-6"
        >
          {title}
        </h2>

        <p className="text-lg sm:text-xl text-primary-foreground mb-6 sm:mb-8 leading-relaxed">
          {description}
        </p>

        <div className="sm:flex-row gap-4 flex flex-col justify-center">
          <CtaButton {...actions.primary} isPrimaryAction />
          {actions.secondary && <CtaButton {...actions.secondary} />}
        </div>

        {footnote && (
          <p className="text-primary-foreground mt-4 sm:mt-6 text-xs sm:text-sm">{footnote}</p>
        )}
      </div>
    </section>
  )
}
