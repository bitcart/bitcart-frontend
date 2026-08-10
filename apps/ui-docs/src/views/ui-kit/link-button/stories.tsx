import { LinkButton, type LinkButtonProps } from "@bitcart/ui-kit/components"
import { values } from "remeda"

import type { StoryComponentVariantPresetMap, StoryComponentVariantPresets } from "@/common/types"
import { defineStory } from "@/common/ui/story-factory"

const DEFAULT_PROPS = {
  href: "/",
  size: "default",
  expandOnHover: false,
  children: "Learn more",
} satisfies LinkButtonProps

export const VARIANT_PRESET_MAP: StoryComponentVariantPresetMap<typeof LinkButton> = {
  default: {
    variant: "Default",
    description: "The primary link-as-button of a view",
    initial: { ...DEFAULT_PROPS, variant: "default" },
  },

  secondary: {
    variant: "Secondary",
    description: "A supporting destination shown alongside the primary one",
    initial: { ...DEFAULT_PROPS, variant: "secondary" },
  },

  accent: {
    variant: "Accent",
    description: "Accent fill, to draw attention without competing with the primary action",
    initial: { ...DEFAULT_PROPS, variant: "accent" },
  },

  destructive: {
    variant: "Destructive",
    description: "Links leading to irreversible or otherwise dangerous flows",
    initial: { ...DEFAULT_PROPS, variant: "destructive" },
  },

  outline: {
    variant: "Outline",
    description: "Border only, for low-emphasis destinations",
    initial: { ...DEFAULT_PROPS, variant: "outline" },
  },

  ghost: {
    variant: "Ghost",
    description: "No fill until hovered, for dense toolbars and icon rows",
    initial: { ...DEFAULT_PROPS, variant: "ghost" },
  },

  link: {
    variant: "Link",
    description: "Plain underlined link appearance",
    initial: { ...DEFAULT_PROPS, variant: "link" },
  },

  white: {
    variant: "White",

    description:
      "For surfaces that retain dark background regardless of the theme, such as a brand-colored landing hero",

    initial: { ...DEFAULT_PROPS, variant: "white" },
  },

  expandOnHover: {
    variant: "Expanding on hover",
    description: "Scales up slightly on hover, combines with any variant",
    initial: { ...DEFAULT_PROPS, variant: "default", expandOnHover: true },
  },

  external: {
    variant: "External",
    description: "Opens an external destination in a new tab with an accessibility hint",

    initial: {
      ...DEFAULT_PROPS,
      variant: "outline",
      href: "https://bitcart.ai",
      isExternalLink: true,
      children: "Visit bitcart.ai",
    },
  },
}

const mainStoryVariantPresets: StoryComponentVariantPresets<typeof LinkButton> =
  values(VARIANT_PRESET_MAP)

export const mainStory = defineStory({
  Component: LinkButton,
  args: mainStoryVariantPresets,
})
