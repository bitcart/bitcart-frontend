import { Checkbox, type CheckboxProps } from "@bitcart/ui-kit/components"
import { values } from "remeda"

import type { StoryComponentVariantPresetMap, StoryComponentVariantPresets } from "@/common/types"
import { defineStory } from "@/common/ui/story-factory"

const DEFAULT_PROPS = {
  defaultChecked: false,
  disabled: false,
} satisfies CheckboxProps

export const VARIANT_PRESET_MAP: StoryComponentVariantPresetMap<typeof Checkbox> = {
  default: {
    variant: "Default",
    description: "Unchecked, ready for input",
    initial: DEFAULT_PROPS,
  },

  checked: {
    variant: "Checked",
    description: "Primary fill when selected",
    initial: { ...DEFAULT_PROPS, defaultChecked: true },
  },

  disabled: {
    variant: "Disabled",
    description: "Non-interactive",
    initial: { ...DEFAULT_PROPS, disabled: true },
  },
}

const mainStoryVariantPresets: StoryComponentVariantPresets<typeof Checkbox> =
  values(VARIANT_PRESET_MAP)

export const mainStory = defineStory({
  Component: Checkbox,
  args: mainStoryVariantPresets,
})
