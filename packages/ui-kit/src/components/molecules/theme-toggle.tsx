import {
  UI_THEME_TOGGLE_TESTID,
  UI_THEME_ICON_DARK_TESTID,
  UI_THEME_ICON_LIGHT_TESTID,
  UI_THEME_ICON_SYSTEM_TESTID,
} from "@bitcart/qa"
import { t } from "@lingui/core/macro"
import { Loader, Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useCallback, useMemo } from "react"

import { cn } from "@/utils"

import { Button } from "../atoms/button"

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

  const toggleTheme = useCallback(() => {
    switch (theme) {
      case "system": {
        setTheme("light")
        break
      }

      case "light": {
        setTheme("dark")
        break
      }

      case "dark": {
        setTheme("system")
        break
      }
    }
  }, [setTheme, theme])

  const getThemeLabel = useCallback(() => {
    switch (theme) {
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
  }, [theme])

  const buttonHint = useMemo(
    () => t`Current theme: ${getThemeLabel()}. Click to cycle through themes.`,
    [getThemeLabel],
  )

  const icon = useMemo(() => {
    const elementClassName = "text-foreground"

    switch (theme) {
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
  }, [theme])

  return (
    <Button
      onClick={toggleTheme}
      size="icon"
      variant="ghost"
      title={buttonHint}
      className={className}
      aria-label={buttonHint}
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
