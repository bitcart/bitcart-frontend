import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@bitcart/ui-kit/components"
import { ChevronsUpDownIcon } from "lucide-react"
import { values } from "remeda"

import type { StoryComponentVariantPresetMap, StoryComponentVariantPresets } from "@/common/types"
import { defineStory } from "@/common/ui/story-factory"

const DEFAULT_PROPS = {
  defaultOpen: false,
  className: "gap-2 w-80 flex flex-col",

  children: (
    <>
      <div className="px-4 gap-4 flex items-center justify-between">
        <h4 className="text-sm font-semibold">Connected wallets (3)</h4>

        <CollapsibleTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <ChevronsUpDownIcon />
          <span className="sr-only">Toggle</span>
        </CollapsibleTrigger>
      </div>

      <div className="border-border rounded-md px-4 py-2 font-mono text-sm border">
        bc1qxy2k…0wlh
      </div>

      <CollapsibleContent className="gap-2 flex flex-col">
        <div className="border-border rounded-md px-4 py-2 font-mono text-sm border">
          bc1q9d3e…7klm
        </div>

        <div className="border-border rounded-md px-4 py-2 font-mono text-sm border">
          bc1p5cyx…4fnr
        </div>
      </CollapsibleContent>
    </>
  ),
} satisfies React.ComponentProps<typeof Collapsible>

export const VARIANT_PRESET_MAP: StoryComponentVariantPresetMap<typeof Collapsible> = {
  default: {
    variant: "Default",
    description: "Collapsed until the trigger is activated",
    initial: DEFAULT_PROPS,
  },

  open: {
    variant: "Open",
    description: "Expanded by default, collapsible on demand",
    initial: { ...DEFAULT_PROPS, defaultOpen: true },
  },
}

const mainStoryVariantPresets: StoryComponentVariantPresets<typeof Collapsible> =
  values(VARIANT_PRESET_MAP)

export const mainStory = defineStory({
  Component: Collapsible,
  args: mainStoryVariantPresets,
})
