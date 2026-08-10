import { Button, Toaster, type ToasterProps } from "@bitcart/ui-kit/components"
import { toast } from "@bitcart/ui-kit/utils"
import { values } from "remeda"

import type { StoryComponentVariantPresetMap, StoryComponentVariantPresets } from "@/common/types"
import { defineStory } from "@/common/ui/story-factory"

const STORY_TOASTER_ID = "ui-kit-toaster-story"

const showToast = () =>
  toast.success("Invoice #1042 paid", {
    description: "0.0241 BTC confirmed in block 912,338.",
    toasterId: STORY_TOASTER_ID,
  })

type ToasterPreviewProps = Omit<ToasterProps, "id"> & {}

const ToasterPreview: React.FC<ToasterPreviewProps> = (props) => (
  <>
    <Button variant="outline" onClick={showToast}>
      Show toast
    </Button>

    <Toaster {...props} id={STORY_TOASTER_ID} />
  </>
)

const DEFAULT_PROPS = {
  position: "bottom-right",
} satisfies ToasterPreviewProps

export const VARIANT_PRESET_MAP: StoryComponentVariantPresetMap<typeof ToasterPreview> = {
  default: {
    variant: "Default",
    description: "Bottom-right viewport that inherits the active light or dark theme",
    initial: DEFAULT_PROPS,
  },

  topCenter: {
    variant: "Top center",
    description: "Moves the stack above the content, for global and blocking notices",
    initial: { ...DEFAULT_PROPS, position: "top-center" },
  },

  richColors: {
    variant: "Rich colors",
    description: "Tints each notification by its semantic type instead of the neutral surface",
    initial: { ...DEFAULT_PROPS, richColors: true },
  },

  closeButton: {
    variant: "With close button",
    description: "Adds an explicit dismiss affordance for notifications that outlive a glance",
    initial: { ...DEFAULT_PROPS, closeButton: true, duration: 10_000 },
  },
}

const mainStoryVariantPresets: StoryComponentVariantPresets<typeof ToasterPreview> =
  values(VARIANT_PRESET_MAP)

export const mainStory = defineStory({
  Component: ToasterPreview,
  args: mainStoryVariantPresets,
})
