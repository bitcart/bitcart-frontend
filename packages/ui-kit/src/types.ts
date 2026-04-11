import type { LocaleId, PseudoLocaleId } from "@bitcart/core/utils"
import type { BreakpointKey } from "@bitcart/unocss-preset"
import type { Icon } from "@phosphor-icons/react"
import type { LucideProps } from "lucide-react"

export type BasicThemeMode = "dark" | "light"

export type ThemeMode = BasicThemeMode | "system"

export type SystemThemeMode = BasicThemeMode

export type ErrorDisplayAttributes = {
  title: string
  message: string
  icon: React.ReactNode
}

export type LucideIconComponent = React.ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
>

export type LucideIconProps = React.ComponentProps<LucideIconComponent>

export type IconComponent = LucideIconComponent | Icon

export type BasicLinkComponent = React.ComponentType<{
  href: string
  title?: string
  onClick?: VoidFunction
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}>

export interface WithGlobalPosition {
  /**
   * Rendering priority within the subdirectory.
   * Useful when all subdirectory group items are rendered side-by-side inside the same container
   * in an order different from the one in which they are declared.
   */
  globalPosition: number
}

export type BasicNavigationLink = {
  href: string

  /**
   * Optional meta information
   */
  description?: string

  external?: boolean

  /**
   * Used as ARIA label and optionally as a tooltip text
   */
  hint?: string
}

export type LabeledNavigationLink = BasicNavigationLink & {
  /**
   * Link display name. Will also be used as ARIA label,
   * if {@link LabeledNavigationLink.hint} is not provided
   */
  label: string

  /**
   * A short label to be used in place of {@link LabeledNavigationLink.label} on smaller screens
   */
  shortLabel?: string

  /**
   * A supplementary icon
   */
  icon?: IconComponent
}

export type IconNavigationLink = BasicNavigationLink & {
  icon: IconComponent

  /**
   * Used as tooltip text and ARIA labels
   */
  hint: string
}

export type NavigationLinkGroup<TNavigationLink = LabeledNavigationLink> = (
  | {}
  | { menuOnly: boolean }
  | { footerOnly: boolean }
) & {
  groupTitle: string
  items: TNavigationLink[]
}

export type RootLayoutRegionDesignation = "header" | "footer"

export type LayoutI18nConfig = {
  /**
   * A valid BCP-47 language code for the currently used locale
   */
  activeLocale: string

  /**
   * Valid BCP-47 language codes for all available locales
   */
  availableLocales: readonly (LocaleId | PseudoLocaleId)[]
}

export type LayoutBrandAttributes = {
  name: string
  copyrightAppendix?: string
  copyrightSinceYear?: number
  logoImageSrc: string
  logoImageAltText: string
  projectCanonicalName: string
  tagline?: string
}

/**
 * Navigation directory containing link groups segregated by link type
 */
export type NavigationDirectory = {
  labeledLinks: NavigationLinkGroup<
    LabeledNavigationLink | (LabeledNavigationLink & WithGlobalPosition)
  >[]

  iconLinks?: NavigationLinkGroup<IconNavigationLink | (IconNavigationLink & WithGlobalPosition)>[]
}

export type LayoutNavigationConfig = {
  /**
   * Useful when the root route is not "/"
   *
   * @default "/"
   */
  rootRoutePath?: string

  /**
   * How much links should fit in the navigation bar depending on the screen size.
   * The remaining links will be displayed in a dropdown menu.
   *
   * Note that the navigation bar is completely hidden on small screens
   * and the width of the link row may vary significantly between localizations.
   *
   * @example { md: 2, lg: 4, xl: 6, "2xl": 7, "3xl": 8 }
   */
  navBarDisplayCapacity: Record<Exclude<BreakpointKey, "sm">, number>

  /**
   * Navigation directory containing link groups segregated by link type
   */
  directory: NavigationDirectory
}

export type NavigationLink =
  | LabeledNavigationLink
  | (LabeledNavigationLink & WithGlobalPosition)
  | IconNavigationLink
  | (IconNavigationLink & WithGlobalPosition)

/**
 * Generalized navigation link group definition
 */
export type NavigationGroup = NavigationLinkGroup<NavigationLink>

/**
 * Global layout configuration to be applied at the root level
 */
export type LayoutConfig = {
  i18n: LayoutI18nConfig
  brand: LayoutBrandAttributes
  navigation: LayoutNavigationConfig
}

export type DrawerPosition = "right" | "left" | "top" | "bottom"
