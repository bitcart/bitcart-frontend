//* Originally ported from: https://ui.shadcn.com

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

import { useDocumentThemeMode, useTheme } from "@/hooks"
import { isThemeMode } from "@/utils"

export type { ToasterProps }

export const Toaster: React.FC<ToasterProps> = (props) => {
  const { theme } = useTheme()
  const documentThemeMode = useDocumentThemeMode()

  //* Sonner keys its entire palette off the exact "light" / "dark" pair.
  //* Apps may register other arbitrary theme keys (e.g. brand-mode pairs),
  //* which match none of its selectors, thus requiring a fallback mechanism.
  const themeMode = isThemeMode(theme) ? theme : documentThemeMode

  return (
    <Sonner
      theme={themeMode}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "oklch(var(--popover))",
          "--normal-text": "oklch(var(--popover-foreground))",
          "--normal-border": "oklch(var(--border))",
          "--border-radius": "var(--radius-md)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}
