import { Loader } from "lucide-react"

import { cn } from "@/utils"

export type ThemeToggleFallbackProps = {
  className?: string
}

export const ThemeToggleFallback: React.FC<ThemeToggleFallbackProps> = ({ className }) => (
  <span className={cn("size-9 flex items-center justify-center", className)}>
    <Loader className="size-4 animate-spin text-foreground" />
  </span>
)
