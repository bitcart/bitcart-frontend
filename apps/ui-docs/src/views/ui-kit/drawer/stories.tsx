import {
  Button,
  Drawer,
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
  DrawerTrigger,
  type DrawerProps,
} from "@bitcart/ui-kit/components"
import { values } from "remeda"

import type { StoryComponentVariantPresetMap, StoryComponentVariantPresets } from "@/common/types"
import { defineStory } from "@/common/ui/story-factory"

const DEFAULT_PROPS = {
  children: (
    <>
      <DrawerTrigger render={<Button variant="outline" />}>Payment methods</DrawerTrigger>

      <DrawerPopup>
        <DrawerHeader>
          <DrawerTitle>Payment methods</DrawerTitle>

          <DrawerDescription>
            Pick which of the connected wallets this store offers at checkout.
          </DrawerDescription>
        </DrawerHeader>

        <DrawerPanel>
          <ul className="gap-2 text-sm flex flex-col">
            {["Bitcoin", "Lightning", "Ethereum", "Monero"].map((method) => (
              <li key={method} className="border-border rounded-md px-4 py-2 border">
                {method}
              </li>
            ))}
          </ul>
        </DrawerPanel>

        <DrawerFooter>
          <DrawerClose render={<Button variant="outline" />}>Close</DrawerClose>
          <DrawerClose render={<Button />}>Save</DrawerClose>
        </DrawerFooter>
      </DrawerPopup>
    </>
  ),
} satisfies DrawerProps

export const VARIANT_PRESET_MAP: StoryComponentVariantPresetMap<typeof Drawer> = {
  bottomPosition: {
    variant: "Bottom sheet",
    description: "Slides up from the bottom edge and dismisses on a downward swipe",
    initial: DEFAULT_PROPS,
  },

  sidePosition: {
    variant: "Side sheet",
    description: "Anchors to the inline end of the viewport, for wider auxiliary panels",
    initial: { ...DEFAULT_PROPS, position: "right" },
  },
}

const mainStoryVariantPresets: StoryComponentVariantPresets<typeof Drawer> =
  values(VARIANT_PRESET_MAP)

export const mainStory = defineStory({
  Component: Drawer,
  args: mainStoryVariantPresets,
})
