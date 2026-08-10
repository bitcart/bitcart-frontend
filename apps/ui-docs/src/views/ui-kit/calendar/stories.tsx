import { Calendar, type CalendarProps } from "@bitcart/ui-kit/components"
import { values } from "remeda"

import type { StoryComponentVariantPresetMap, StoryComponentVariantPresets } from "@/common/types"
import { defineStory } from "@/common/ui/story-factory"

const DEFAULT_PROPS = {
  className: "rounded-lg border shadow-sm",
} satisfies CalendarProps

export const VARIANT_PRESET_MAP: StoryComponentVariantPresetMap<typeof Calendar> = {
  single: {
    variant: "Single date",
    description: "Picks one day, the common case for invoice and payout filters",
    initial: { ...DEFAULT_PROPS, mode: "single" },
  },

  range: {
    variant: "Date range",
    description: "Selects a start and an end day across two visible months",
    initial: { ...DEFAULT_PROPS, mode: "range", numberOfMonths: 2 },
  },

  dropdown: {
    variant: "Dropdown caption",
    description: "Swaps the static caption for month and year dropdowns",
    initial: { ...DEFAULT_PROPS, mode: "single", captionLayout: "dropdown" },
  },
}

const mainStoryVariantPresets: StoryComponentVariantPresets<typeof Calendar> =
  values(VARIANT_PRESET_MAP)

export const mainStory = defineStory({
  Component: Calendar,
  args: mainStoryVariantPresets,
})
