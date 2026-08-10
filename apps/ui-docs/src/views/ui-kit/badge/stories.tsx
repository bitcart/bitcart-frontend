import { Badge, type BadgeProps } from "@bitcart/ui-kit/components"
import { values } from "remeda"

import type { StoryComponentVariantPresetMap, StoryComponentVariantPresets } from "@/common/types"
import { defineStory } from "@/common/ui/story-factory"

const DEFAULT_PROPS = {
  children: "NEW",
} satisfies BadgeProps

export const VARIANT_PRESET_MAP: StoryComponentVariantPresetMap<typeof Badge> = {
  default: {
    variant: "Default",
    description: "Solid primary fill, for the most prominent labels",
    initial: { ...DEFAULT_PROPS, variant: "default" },
  },

  plain: {
    variant: "Plain",
    description: "Background-colored with a visible border, for low-emphasis labels",
    initial: { ...DEFAULT_PROPS, variant: "plain" },
  },

  secondary: {
    variant: "Secondary",
    description: "Muted fill, for supporting metadata",
    initial: { ...DEFAULT_PROPS, variant: "secondary" },
  },

  accent: {
    variant: "Accent",
    description: "Accent fill, to draw attention",
    initial: { ...DEFAULT_PROPS, variant: "accent" },
  },

  destructive: {
    variant: "Destructive",
    description: "Signals an error, failure, or otherwise dangerous state",
    initial: { ...DEFAULT_PROPS, variant: "destructive" },
  },

  outline: {
    variant: "Outline",
    description: "Border only, for the quietest labels",
    initial: { ...DEFAULT_PROPS, variant: "outline" },
  },
}

const mainStoryVariantPresets: StoryComponentVariantPresets<typeof Badge> =
  values(VARIANT_PRESET_MAP)

export const mainStory = defineStory({
  Component: Badge,
  args: mainStoryVariantPresets,
})
