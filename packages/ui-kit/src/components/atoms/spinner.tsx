//* Originally ported from: https://coss.com/ui

import { useLingui } from "@lingui/react/macro"
import { Loader2Icon } from "lucide-react"

import type { LucideIconProps } from "@/types"
import { cn } from "@/utils"

export const Spinner: React.FC<LucideIconProps> = ({ className, ...props }) => {
  const { t } = useLingui()

  return (
    <Loader2Icon
      aria-label={t`Loading`}
      className={cn("animate-spin", className)}
      role="status"
      {...props}
    />
  )
}
