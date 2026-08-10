import { Button, ButtonGroup, type ButtonGroupProps } from "@bitcart/ui-kit/components"
import { values } from "remeda"

import type { StoryComponentVariantPresetMap, StoryComponentVariantPresets } from "@/common/types"
import { defineStory } from "@/common/ui/story-factory"

const DEFAULT_PROPS = {
  children: (
    <>
      <Button variant="outline">Day</Button>
      <Button variant="outline">Week</Button>
      <Button variant="outline">Month</Button>
    </>
  ),
} satisfies ButtonGroupProps

export const VARIANT_PRESET_MAP: StoryComponentVariantPresetMap<typeof ButtonGroup> = {
  horizontal: {
    variant: "Horizontal",
    description: "Related actions joined into a single segmented control",
    initial: DEFAULT_PROPS,
  },

  vertical: {
    variant: "Vertical",
    description: "Stacks the same actions for narrow containers and side panels",
    initial: { ...DEFAULT_PROPS, orientation: "vertical" },
  },
}

const mainStoryVariantPresets: StoryComponentVariantPresets<typeof ButtonGroup> =
  values(VARIANT_PRESET_MAP)

export const mainStory = defineStory({
  Component: ButtonGroup,
  args: mainStoryVariantPresets,
})
