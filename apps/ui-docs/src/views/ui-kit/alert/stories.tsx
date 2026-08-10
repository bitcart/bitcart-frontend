import { Alert, AlertDescription, AlertTitle } from "@bitcart/ui-kit/components"
import { CircleCheckIcon } from "lucide-react"
import { values } from "remeda"

import type { StoryComponentVariantPresetMap, StoryComponentVariantPresets } from "@/common/types"
import { defineStory } from "@/common/ui/story-factory"

const DEFAULT_PROPS = {
  className: "max-w-md",

  children: (
    <>
      <CircleCheckIcon />
      <AlertTitle>Payment confirmed</AlertTitle>
      <AlertDescription>The invoice has been settled on-chain.</AlertDescription>
    </>
  ),
} satisfies React.ComponentProps<typeof Alert>

export const VARIANT_PRESET_MAP: StoryComponentVariantPresetMap<typeof Alert> = {
  default: {
    variant: "Default",
    description: "Card-colored callout for neutral inline notices",
    initial: { ...DEFAULT_PROPS, variant: "default" },
  },

  accent: {
    variant: "Accent",
    description: "Accent fill, for notices that should stand out from the page",
    initial: { ...DEFAULT_PROPS, variant: "accent" },
  },

  destructive: {
    variant: "Destructive",
    description: "Signals an error or failure state",
    initial: { ...DEFAULT_PROPS, variant: "destructive" },
  },
}

const mainStoryVariantPresets: StoryComponentVariantPresets<typeof Alert> =
  values(VARIANT_PRESET_MAP)

export const mainStory = defineStory({
  Component: Alert,
  args: mainStoryVariantPresets,
})
