import { t } from "@lingui/core/macro"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useCallback, useMemo } from "react"

import { Button } from "@/components/atoms/button"

export type ThemeToggleProps = {
  className?: string
  showLabel?: boolean
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, showLabel = false }) => {
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
        return <Sun className={elementClassName} />
      }

      case "dark": {
        return <Moon className={elementClassName} />
      }

      default: {
        return <Monitor className={elementClassName} />
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
    >
      {icon}
      {showLabel && <span className="text-sm font-medium">{getThemeLabel()}</span>}
    </Button>
  )
}

//! For lazy imports only!
export default ThemeToggle
