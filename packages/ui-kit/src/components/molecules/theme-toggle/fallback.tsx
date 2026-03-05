import { Loader } from "lucide-react"

import { cn } from "@/utils"

export type ThemeToggleFallbackProps = {
  className?: string
}

export const ThemeToggleFallback: React.FC<ThemeToggleFallbackProps> = ({ className }) => (
  <span className={cn("w-9 h-9 flex items-center justify-center", className)}>
    <Loader className="w-4 h-4 animate-spin text-foreground" />
  </span>
)
