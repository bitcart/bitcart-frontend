import { Input, type InputProps } from "@bitcart/ui-kit/components"
import { values } from "remeda"

import type { StoryComponentVariantPresetMap, StoryComponentVariantPresets } from "@/common/types"
import { defineStory } from "@/common/ui/story-factory"

const DEFAULT_PROPS = {
  size: "default",
  disabled: false,
  type: "text",
  placeholder: "Store name",
  className: "max-w-xs",
} satisfies InputProps

export const VARIANT_PRESET_MAP: StoryComponentVariantPresetMap<typeof Input> = {
  default: {
    variant: "Default",
    description: "Single-line text control, available in sm, default, and lg sizes",
    initial: DEFAULT_PROPS,
  },

  disabled: {
    variant: "Disabled",
    description: "Non-interactive",
    initial: { ...DEFAULT_PROPS, disabled: true },
  },

  invalid: {
    variant: "Invalid",
    description: "Failed validation, flagged via aria-invalid",
    initial: { ...DEFAULT_PROPS, "aria-invalid": true, defaultValue: "not-an-email" },
  },
}

const mainStoryVariantPresets: StoryComponentVariantPresets<typeof Input> =
  values(VARIANT_PRESET_MAP)

export const mainStory = defineStory({
  Component: Input,
  args: mainStoryVariantPresets,
})
