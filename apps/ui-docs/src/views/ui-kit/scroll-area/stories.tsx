import { ScrollArea, type ScrollAreaProps } from "@bitcart/ui-kit/components"
import { values } from "remeda"

import type { StoryComponentVariantPresetMap, StoryComponentVariantPresets } from "@/common/types"
import { defineStory } from "@/common/ui/story-factory"

const TRANSACTIONS = Array.from({ length: 16 }, (_value, index) => ({
  id: `tx-${index + 1}`,
  hash: `bc1q…${(index + 1).toString().padStart(4, "0")}`,
  amount: `${(0.01 * (index + 1)).toFixed(2)} BTC`,
}))

const DEFAULT_PROPS = {
  className: "border-border rounded-md h-64 w-72 border",

  children: (
    <ul className="p-4 gap-2 text-sm flex flex-col">
      {TRANSACTIONS.map(({ id, hash, amount }) => (
        <li key={id} className="flex items-center justify-between">
          <span className="font-mono">{hash}</span>

          <span className="text-muted-foreground">{amount}</span>
        </li>
      ))}
    </ul>
  ),
} satisfies ScrollAreaProps

export const VARIANT_PRESET_MAP: StoryComponentVariantPresetMap<typeof ScrollArea> = {
  default: {
    variant: "Default",
    description: "Overlay scrollbars that surface while hovering or scrolling",
    initial: DEFAULT_PROPS,
  },

  fade: {
    variant: "Faded edges",
    description: "Masks the overflowing edges to hint at the content beyond them",
    initial: { ...DEFAULT_PROPS, scrollFade: true },
  },

  gutter: {
    variant: "Scrollbar gutter",
    description: "Reserves room for the scrollbar so it never overlaps the content",
    initial: { ...DEFAULT_PROPS, scrollbarGutter: true },
  },
}

const mainStoryVariantPresets: StoryComponentVariantPresets<typeof ScrollArea> =
  values(VARIANT_PRESET_MAP)

export const mainStory = defineStory({
  Component: ScrollArea,
  args: mainStoryVariantPresets,
})
