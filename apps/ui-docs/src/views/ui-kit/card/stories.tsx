import {
  Badge,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@bitcart/ui-kit/components"
import { values } from "remeda"

import type { StoryComponentVariantPresetMap, StoryComponentVariantPresets } from "@/common/types"
import { defineStory } from "@/common/ui/story-factory"

const DEFAULT_PROPS = {
  className: "w-full max-w-sm",

  children: (
    <>
      <CardHeader>
        <CardTitle>Store overview</CardTitle>
        <CardDescription>Your store at a glance</CardDescription>

        <CardAction>
          <Badge variant="secondary">Live</Badge>
        </CardAction>
      </CardHeader>

      <CardContent>
        <p className="text-sm">12 invoices were paid this week, totaling 0.024 BTC.</p>
      </CardContent>

      <CardFooter>
        <p className="text-muted-foreground text-xs">Updated 5 minutes ago</p>
      </CardFooter>
    </>
  ),
} satisfies React.ComponentProps<typeof Card>

export const VARIANT_PRESET_MAP: StoryComponentVariantPresetMap<typeof Card> = {
  default: {
    variant: "Default",
    description: "A bordered surface composed of header, content, and footer sections",
    initial: DEFAULT_PROPS,
  },
}

const mainStoryVariantPresets: StoryComponentVariantPresets<typeof Card> =
  values(VARIANT_PRESET_MAP)

export const mainStory = defineStory({
  Component: Card,
  args: mainStoryVariantPresets,
})
