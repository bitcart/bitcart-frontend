import { Separator, type SeparatorProps } from "@bitcart/ui-kit/components"
import { values } from "remeda"

import type { StoryComponentVariantPresetMap, StoryComponentVariantPresets } from "@/common/types"
import { defineStory } from "@/common/ui/story-factory"

const DEFAULT_PROPS = {
  orientation: "horizontal",
  className: "w-64",
} satisfies SeparatorProps

export const VARIANT_PRESET_MAP: StoryComponentVariantPresetMap<typeof Separator> = {
  horizontal: {
    variant: "Horizontal",
    description: "Full-width rule dividing stacked content",
    initial: DEFAULT_PROPS,
  },

  vertical: {
    variant: "Vertical",
    description: "Stretches to the height of its flex container, for inline groups",
    initial: { ...DEFAULT_PROPS, orientation: "vertical", className: "h-16" },
  },
}

const mainStoryVariantPresets: StoryComponentVariantPresets<typeof Separator> =
  values(VARIANT_PRESET_MAP)

export const mainStory = defineStory({
  Component: Separator,
  args: mainStoryVariantPresets,
})
