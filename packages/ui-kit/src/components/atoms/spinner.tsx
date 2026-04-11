//* Ported from: https://coss.com/ui

import { t } from "@lingui/core/macro"
import { Loader2Icon } from "lucide-react"

import type { LucideIconProps } from "@/types"
import { cn } from "@/utils"

export const Spinner: React.FC<LucideIconProps> = ({ className, ...props }) => (
  <Loader2Icon
    aria-label={t`Loading`}
    className={cn("animate-spin", className)}
    role="status"
    {...props}
  />
)
