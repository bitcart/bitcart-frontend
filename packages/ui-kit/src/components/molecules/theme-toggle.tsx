import {
  UI_THEME_TOGGLE_TESTID,
  UI_THEME_ICON_DARK_TESTID,
  UI_THEME_ICON_LIGHT_TESTID,
  UI_THEME_ICON_SYSTEM_TESTID,
} from "@bitcart/qa"
import { t } from "@lingui/core/macro"
import { Loader, Monitor, Moon, Sun } from "lucide-react"
import { useCallback, useMemo } from "react"

import { useTheme } from "@/hooks"
import type { ThemeMode } from "@/types"
import { cn, isThemeMode } from "@/utils"

import { Button } from "../atoms/button"

const DEFAULT_THEME_MODE: ThemeMode = "system"

const NEXT_THEME_MODE: Record<ThemeMode, ThemeMode> = {
  system: "light",
  light: "dark",
  dark: "system",
}

export type ThemeToggleProps = {
  className?: string
  showLabel?: boolean

  /**
   * @default UI_THEME_TOGGLE_TESTID
   */
  testId?: string
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  showLabel = false,
  testId = UI_THEME_TOGGLE_TESTID,
}) => {
  const { theme, setTheme } = useTheme()

  //* Mitigates unrecoverable state caused by an invalid cached setting.
  const themeMode = isThemeMode(theme) ? theme : DEFAULT_THEME_MODE
  const toggleTheme = useCallback(() => setTheme(NEXT_THEME_MODE[themeMode]), [setTheme, themeMode])

  const getThemeLabel = useCallback(() => {
    switch (themeMode) {
      case "light": {
        return t`Light`
      }

      case "dark": {
        return t`Dark`
      }

      default: {
        return t`System`
      }
    }
  }, [themeMode])

  const getButtonHint = useCallback(
    () => t`Current theme: ${getThemeLabel()}. Click to cycle through themes.`,
    [getThemeLabel],
  )

  const icon = useMemo(() => {
    const elementClassName = "text-foreground"

    switch (themeMode) {
      case "light": {
        return <Sun className={elementClassName} data-testid={UI_THEME_ICON_LIGHT_TESTID} />
      }

      case "dark": {
        return <Moon className={elementClassName} data-testid={UI_THEME_ICON_DARK_TESTID} />
      }

      default: {
        return <Monitor className={elementClassName} data-testid={UI_THEME_ICON_SYSTEM_TESTID} />
      }
    }
  }, [themeMode])

  return (
    <Button
      onClick={toggleTheme}
      size="icon"
      variant="ghost"
      title={getButtonHint()}
      className={className}
      aria-label={getButtonHint()}
      data-testid={testId}
    >
      {icon}
      {showLabel && <span className="text-sm font-medium">{getThemeLabel()}</span>}
    </Button>
  )
}

export type ThemeToggleFallbackProps = {
  className?: string
}

export const ThemeToggleFallback: React.FC<ThemeToggleFallbackProps> = ({ className }) => (
  <span className={cn("size-9 flex items-center justify-center", className)}>
    <Loader className="size-4 animate-spin text-foreground" />
  </span>
)
