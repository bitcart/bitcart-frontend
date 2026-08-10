import { Textarea, type TextareaProps } from "@bitcart/ui-kit/components"
import { values } from "remeda"

import type { StoryComponentVariantPresetMap, StoryComponentVariantPresets } from "@/common/types"
import { defineStory } from "@/common/ui/story-factory"

const DEFAULT_PROPS = {
  disabled: false,
  placeholder: "Describe the refund reason…",
  className: "max-w-sm",
} satisfies TextareaProps

export const VARIANT_PRESET_MAP: StoryComponentVariantPresetMap<typeof Textarea> = {
  default: {
    variant: "Default",
    description: "Multi-line text control, resizable vertically",
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
    initial: { ...DEFAULT_PROPS, "aria-invalid": true, defaultValue: "Too short" },
  },
}

const mainStoryVariantPresets: StoryComponentVariantPresets<typeof Textarea> =
  values(VARIANT_PRESET_MAP)

export const mainStory = defineStory({
  Component: Textarea,
  args: mainStoryVariantPresets,
})
