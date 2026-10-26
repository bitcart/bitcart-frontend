import type { CopyOutcome } from "@bitcart/hooks"
import { cn } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react/macro"
import { CheckIcon, CopyIcon } from "lucide-react"

export const CopyStatusIcon = ({
  outcome,
  className,
}: {
  outcome: CopyOutcome | null
  className?: string
}) => {
  const { t } = useLingui()

  if (outcome === "copied") {
    return <CheckIcon aria-hidden className={cn("size-4 text-success shrink-0", className)} />
  } else if (outcome === "failed") {
    return (
      <span className="text-xs text-destructive font-medium shrink-0 whitespace-nowrap">
        {t`Couldn't copy`}
      </span>
    )
  } else
    return (
      <CopyIcon aria-hidden className={cn("size-4 text-muted-foreground shrink-0", className)} />
    )
}

export const CopyAnnouncement = ({
  outcome,
  label,
}: {
  outcome: CopyOutcome | null
  label: string
}) => {
  const { t } = useLingui()

  const announcement = (() => {
    if (outcome === "copied") {
      return t`${label} copied`
    } else if (outcome === "failed") {
      return t`${label} not copied`
    } else return ""
  })()

  return (
    <span className="sr-only" aria-live="polite">
      {announcement}
    </span>
  )
}
