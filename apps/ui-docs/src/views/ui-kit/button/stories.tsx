import { Button, type ButtonProps } from "@bitcart/ui-kit/components"
import { values } from "remeda"

import type { StoryComponentVariantPresetMap, StoryComponentVariantPresets } from "@/common/types"
import { defineStory } from "@/common/ui/story-factory"

const DEFAULT_PROPS = {
  disabled: false,
  expandOnHover: false,
  size: "default",
  children: "Submit",
} satisfies ButtonProps

export const VARIANT_PRESET_MAP: StoryComponentVariantPresetMap<typeof Button> = {
  default: {
    variant: "Default",
    description: "The primary action of a view",
    initial: { ...DEFAULT_PROPS, variant: "default" },
  },

  secondary: {
    variant: "Secondary",
    description: "A supporting action shown alongside the primary one",
    initial: { ...DEFAULT_PROPS, variant: "secondary" },
  },

  accent: {
    variant: "Accent",
    description: "Accent fill, to draw attention without competing with the primary action",
    initial: { ...DEFAULT_PROPS, variant: "accent" },
  },

  destructive: {
    variant: "Destructive",
    description: "Irreversible or otherwise dangerous actions",
    initial: { ...DEFAULT_PROPS, variant: "destructive" },
  },

  outline: {
    variant: "Outline",
    description: "Border only, for low-emphasis actions",
    initial: { ...DEFAULT_PROPS, variant: "outline" },
  },

  ghost: {
    variant: "Ghost",
    description: "No fill until hovered, for dense toolbars and icon rows",
    initial: { ...DEFAULT_PROPS, variant: "ghost" },
  },

  link: {
    variant: "Link",
    description: "For link and link-like interactive elements",
    initial: { ...DEFAULT_PROPS, variant: "link" },
  },

  white: {
    variant: "White",

    description:
      "For surfaces that retain dark background regardless of the theme, such as a brand-colored landing hero",

    initial: { ...DEFAULT_PROPS, variant: "white" },
  },

  expanding: {
    variant: "Expanding on hover",
    description: "Scales up slightly on hover, combines with any variant",
    initial: { ...DEFAULT_PROPS, variant: "default", expandOnHover: true },
  },

  inline: {
    variant: "Inline",

    description:
      "Follows the height and text size of the container. Mainly intended for the link variant.",

    initial: { ...DEFAULT_PROPS, variant: "link", size: "inline" },
  },
}

const mainStoryVariantPresets: StoryComponentVariantPresets<typeof Button> =
  values(VARIANT_PRESET_MAP)

export const mainStory = defineStory({
  Component: Button,
  args: mainStoryVariantPresets,
})
