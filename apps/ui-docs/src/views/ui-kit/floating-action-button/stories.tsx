import { FloatingActionButton, type FloatingActionButtonProps } from "@bitcart/ui-kit/components"
import { BitcartLogoIcon } from "@bitcart/ui-kit/icons"
import { values } from "remeda"

import type { StoryComponentVariantPresetMap, StoryComponentVariantPresets } from "@/common/types"
import { defineStory } from "@/common/ui/story-factory"

const DEFAULT_PROPS = {
  disabled: false,
  size: "default",
  children: <BitcartLogoIcon />,
} satisfies FloatingActionButtonProps

export const VARIANT_PRESET_MAP: StoryComponentVariantPresetMap<typeof FloatingActionButton> = {
  default: {
    variant: "Default",
    initial: DEFAULT_PROPS,
  },

  disabled: {
    variant: "Disabled",
    description: "Non-interactive",
    initial: { ...DEFAULT_PROPS, disabled: true },
  },
}

const mainStoryVariantPresets: StoryComponentVariantPresets<typeof FloatingActionButton> =
  values(VARIANT_PRESET_MAP)

export const mainStory = defineStory({
  Component: FloatingActionButton,
  args: mainStoryVariantPresets,
})
