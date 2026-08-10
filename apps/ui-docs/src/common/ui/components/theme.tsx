import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { useTheme } from "@fumadocs/base-ui/provider/base"
import { useLingui } from "@lingui/react/macro"
import { PaletteIcon } from "lucide-react"
import { useEffect } from "react"
import { capitalize } from "remeda"

import {
  type Brand,
  BRANDS,
  DEFAULT_THEME_KEY,
  THEME_KEYS,
  type ThemeKey,
} from "@/common/constants"
import { parseThemeKey } from "@/common/utils"

const applyTheme = (brand: Brand): void => {
  //* The brand class lives on <body> rather than <html>: the generated dark-mode
  //* selectors are descendant combinators (`.dark .theme-<brand>`), and next-themes
  //* owns the light/dark class on <html>.
  for (const themeBrand of BRANDS) {
    document.body.classList.toggle(`theme-${themeBrand}`, themeBrand === brand)
  }

  document.documentElement.dataset.brand = brand
}

/**
 * Keeps the active brand's `theme-<brand>` class on <body> in sync with the active
 * next-themes theme. Mode (light/dark) is handled natively by next-themes through
 * the `value` class mapping; the brand half of the theme key selects which
 * `.theme-<brand>` CSS variable scope from uno.generated.css applies.
 */
export const ThemeBrandSync: React.FC = () => {
  const { theme } = useTheme()

  useEffect(() => {
    applyTheme(parseThemeKey(theme).brand)
  }, [theme])

  return null
}

/**
 * Selector for the four brand-mode theme combinations, replacing the built-in
 * Fumadocs theme switch (which only cycles light/dark/system).
 */
export const ThemeSelector: React.FC = () => {
  const { t } = useLingui()
  const { theme, setTheme } = useTheme()

  //* `theme` may be undefined or invalid on the first render.
  const currentKey: ThemeKey = THEME_KEYS.includes(theme as ThemeKey)
    ? (theme as ThemeKey)
    : DEFAULT_THEME_KEY

  const options = THEME_KEYS.map((key) => {
    const { brand, mode } = parseThemeKey(key)

    return { value: key, label: `${capitalize(brand)} ${capitalize(mode)}` }
  })

  const currentOption = options.find(({ value }) => value === currentKey)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />} aria-label={t`Select theme`}>
        <PaletteIcon className="h-4 w-4" />
        {currentOption?.label}
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-50">
        <DropdownMenuGroup>
          {options.map(({ value, label }) => (
            <DropdownMenuItem
              key={value}
              onClick={() => setTheme(value)}
              render={
                <Button
                  variant={value === currentKey ? "accent" : "ghost"}
                  className={cn("focus-visible:ring-transparent", {
                    "text-foreground": value === currentKey,
                  })}
                  aria-label={label}
                />
              }
            >
              <span className="w-full text-left">{label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
