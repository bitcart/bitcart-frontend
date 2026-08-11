import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { useTheme } from "@fumadocs/base-ui/provider/base"
import { useLingui } from "@lingui/react/macro"
import { PaletteIcon } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { capitalize } from "remeda"

import {
  type Brand,
  BRAND_STORAGE_KEY,
  BRANDS,
  DEFAULT_BRAND,
  type Mode,
  MODE_SELECTIONS,
  type ModeSelection,
  SYSTEM_MODE,
} from "@/common/constants"
import { BrandContext, type BrandContextValue, useBrand } from "@/common/contexts"
import { resolveBrand, resolveMode } from "@/common/utils"

const readStoredBrand = (): Brand => {
  try {
    return resolveBrand(localStorage.getItem(BRAND_STORAGE_KEY))
  } catch {
    return DEFAULT_BRAND
  }
}

export type BrandProviderProps = {
  children: React.ReactNode
}

/**
 * Owns the brand half of the theme, as next-themes owns the mode half.
 */
export const BrandProvider: React.FC<BrandProviderProps> = ({ children }) => {
  //! Read during the initial client render rather than in an effect, so that `ThemeSync`
  //! never applies the SSR'd default over the stored brand.
  const [brand, setBrandState] = useState<Brand>(() =>
    typeof window === "undefined" ? DEFAULT_BRAND : readStoredBrand(),
  )

  const setBrand = useCallback((nextBrand: Brand) => {
    setBrandState(nextBrand)

    try {
      localStorage.setItem(BRAND_STORAGE_KEY, nextBrand)
    } catch {
      //! Persisting is best-effort; the selection still applies in memory.
    }
  }, [])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === BRAND_STORAGE_KEY) {
        setBrandState(resolveBrand(event.newValue))
      }
    }

    window.addEventListener("storage", handleStorage)

    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const value = useMemo<BrandContextValue>(() => ({ brand, setBrand }), [brand, setBrand])

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
}

const applyTheme = (brand: Brand, mode: Mode): void => {
  //* The brand class lives on <body> rather than <html>: the generated dark-mode
  //* selectors are descendant combinators (`.dark .theme-<brand>`), and next-themes
  //* owns the light/dark class on <html>.
  for (const themeBrand of BRANDS) {
    document.body.classList.toggle(`theme-${themeBrand}`, themeBrand === brand)
  }

  document.documentElement.dataset.brand = brand

  //! Owned here rather than by next-themes, which knows about the mode only.
  document.documentElement.style.colorScheme = mode
}

/**
 * Projects both selections onto the document, except the light/dark class on <html>,
 * which is next-themes' own.
 */
export const ThemeSync: React.FC = () => {
  const { brand } = useBrand()
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    applyTheme(brand, resolveMode(resolvedTheme))
  }, [brand, resolvedTheme])

  return null
}

//! The app's uno config scans `src/views/**` and the UI Kit, not `src/common/**`, so only
//! utilities already emitted into uno.generated.css can be used here.
const GROUP_LABEL_CLASS_NAME = "text-muted-foreground text-xs font-normal"

type ThemeOptionProps = {
  label: string
  isActive: boolean
  onSelect: () => void
}

const ThemeOption: React.FC<ThemeOptionProps> = ({ label, isActive, onSelect }) => (
  <DropdownMenuItem
    onClick={onSelect}
    render={
      <Button
        variant={isActive ? "accent" : "ghost"}
        className={cn("focus-visible:ring-transparent", { "text-foreground": isActive })}
        aria-label={label}
      />
    }
  >
    <span className="w-full text-left">{label}</span>
  </DropdownMenuItem>
)

/**
 * Selects both theme dimensions, replacing the built-in Fumadocs theme switch, which has
 * no notion of the brand.
 */
export const ThemeSelector: React.FC = () => {
  const { t } = useLingui()
  const { brand, setBrand } = useBrand()
  const { theme, resolvedTheme, setTheme } = useTheme()

  //* `theme` is the selection, not the resolution, and is undefined before hydration.
  const modeSelection: ModeSelection = MODE_SELECTIONS.includes(theme as ModeSelection)
    ? (theme as ModeSelection)
    : SYSTEM_MODE

  const modeLabels: Record<ModeSelection, string> = {
    system: t`System`,
    light: t`Light`,
    dark: t`Dark`,
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />} aria-label={t`Select theme`}>
        <PaletteIcon className="h-4 w-4" />
        {`${capitalize(brand)} ${capitalize(resolveMode(resolvedTheme))}`}
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-50">
        <DropdownMenuGroup>
          <DropdownMenuLabel className={GROUP_LABEL_CLASS_NAME}>{t`Brand`}</DropdownMenuLabel>

          {BRANDS.map((value) => (
            <ThemeOption
              key={value}
              label={capitalize(value)}
              isActive={value === brand}
              onSelect={() => setBrand(value)}
            />
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className={GROUP_LABEL_CLASS_NAME}>{t`Mode`}</DropdownMenuLabel>

          {MODE_SELECTIONS.map((value) => (
            <ThemeOption
              key={value}
              label={modeLabels[value]}
              isActive={value === modeSelection}
              onSelect={() => setTheme(value)}
            />
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
